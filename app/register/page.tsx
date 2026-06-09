"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegisterErrors } from "@/types/auth";

export default function RegisterPage() {
  const { status } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerErrors, setRegisterErrors] = useState<RegisterErrors>({});
  const [loading, setLoading] = useState(false);

  // -------------------------
  // redirect（副作用はここだけ）
  // -------------------------
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // -------------------------
  // loading中は描画しない（チラつき防止）
  // -------------------------
  if (status === "loading") {
    return <p>読み込み中...</p>;
  }

  const getLogin = () => router.push("/login");

  const handleRegister = async () => {
    if (loading) return;

    setRegisterErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setRegisterErrors(
          data.registerErrors || { general: "登録に失敗しました" }
        );
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setRegisterErrors({
          general: "自動ログインに失敗しました。手動でログインしてください",
        });
        return;
      }

      router.replace("/verify");
    } catch {
      setRegisterErrors({
        general: "サーバーエラーが発生しました",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          会員登録
        </h1>

        {/* Name */}
        <input
          className="w-full px-4 py-2 border rounded-md mb-4"
          placeholder="ユーザー名"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {registerErrors.name && <p>{registerErrors.name}</p>}

        {/* Email */}
        <input
          className="w-full px-4 py-2 border rounded-md mb-4"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {registerErrors.email && <p>{registerErrors.email}</p>}

        {/* Password */}
        <input
          type="password"
          className="w-full px-4 py-2 border rounded-md mb-4"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {registerErrors.password && <p>{registerErrors.password}</p>}

        {/* Confirm */}
        <input
          type="password"
          className="w-full px-4 py-2 border rounded-md mb-4"
          placeholder="パスワード(確認用)"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {registerErrors.confirmPassword && (
          <p>{registerErrors.confirmPassword}</p>
        )}

        {registerErrors.general && (
          <p className="text-red-600 mb-4">
            {registerErrors.general}
          </p>
        )}

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md"
        >
          {loading ? "登録中..." : "会員登録"}
        </button>

        <button
          onClick={getLogin}
          className="w-full mt-4 text-blue-600"
        >
          ログイン
        </button>
      </div>
    </div>
  );
}