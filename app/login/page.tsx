"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { LoginErrors } from "@/types/auth";
import { ResendVerificationKind } from "@/constants/resend-verification-kind.constant";

const loginSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
});

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  // ✅ ① authenticatedなら即リダイレクト（副作用）
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // ✅ ② loading中は何も表示しない（チラつき防止）
  if (status === "loading") {
    return null;
  }

  // -------------------------
  // login処理
  // -------------------------
  const afterLoginFlow = async () => {
    const formData = new FormData();
    formData.append(
      "stringResendVerificationKind",
      ResendVerificationKind.LOGIN.toString()
    );
    formData.append("email", email);

    const res = await fetch("/api/resend-verification", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data?.shouldGoVerify) {
      router.replace("/verify");
      return;
    }

    router.replace("/dashboard");
  };

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setLoginErrors({});

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setLoginErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });

      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      setLoginErrors({
        general: "メールアドレスまたはパスワードが間違っています",
      });
      setLoading(false);
      return;
    }

    await afterLoginFlow();
    setLoading(false);
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>

        {/* Email */}
        <input
          className="w-full px-4 py-2 border rounded-md mb-4"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {loginErrors.email && <p>{loginErrors.email}</p>}

        {/* Password */}
        <input
          type="password"
          className="w-full px-4 py-2 border rounded-md mb-4"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {loginErrors.password && <p>{loginErrors.password}</p>}

        {loginErrors.general && <p>{loginErrors.general}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>

        <button onClick={() => router.push("/register")}>
          会員登録
        </button>
      </div>
    </div>
  );
}