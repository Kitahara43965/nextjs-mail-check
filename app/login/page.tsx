"use client";

import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginErrors } from "@/types/auth";
import { ResendVerificationKind } from "@/constants/resend-verification-kind.constant";
import { z } from "zod";
import { useEffect } from "react";

/** Zod schema */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("正しいメールアドレスを入力してください"),

  password: z
    .string()
    .min(1, "パスワードを入力してください"),
});

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  const getRegister = () => router.push("/register");
  const getRequestPasswordReset = () => router.push("/request-password-reset");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status]);
  
  const afterLoginFlow = async () => {
    const formData = new FormData();

    formData.append(
      "stringResendVerificationKind",
      ResendVerificationKind.LOGIN.toString()
    );

    formData.append("email", email);

    const response = await fetch("/api/resend-verification", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data?.shouldGoVerify === true) {
      router.push("/verify");
      console.log("reason=login");
      return;
    }

    router.push("/dashboard");
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

    try {
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setLoginErrors({
          general: "メールアドレスまたはパスワードが間違っています",
        });
        return;
      }

      await afterLoginFlow();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>

        {/* Email */}
        <div className="mb-4">
          <input
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setLoginErrors((prev) => ({
                ...prev,
                email: undefined,
                general: undefined,
              }));
            }}
          />
          {loginErrors.email && (
            <p className="text-red-500 text-sm mt-1">{loginErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4">
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="パスワード"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setLoginErrors((prev) => ({
                ...prev,
                password: undefined,
                general: undefined,
              }));
            }}
          />
          {loginErrors.password && (
            <p className="text-red-500 text-sm mt-1">{loginErrors.password}</p>
          )}
        </div>

        {/* General Error */}
        {loginErrors.general && (
          <p className="text-red-600 text-center mb-4">
            {loginErrors.general}
          </p>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>

        {/* Links */}
        <button
          onClick={getRegister}
          className="w-full mt-4 text-blue-600 hover:no-underline text-center"
        >
          会員登録
        </button>

        <button
          onClick={getRequestPasswordReset}
          className="w-full mt-4 text-blue-600 hover:no-underline text-center"
        >
          パスワードリセット
        </button>
      </div>
    </div>
  );
}