"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

/** Zod schema */
const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "パスワードは8文字以上です"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "パスワードが一致しません",
  });

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const token = searchParams.get("token");

  // token check（そのままOK）
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        router.replace("/request-password-reset");
        return;
      }

      try {
        const res = await fetch(`/api/reset-password/verify?token=${token}`);

        if (!res.ok) {
          router.replace("/request-password-reset");
          return;
        }
      } catch {
        router.replace("/request-password-reset");
        return;
      } finally {
        setIsChecking(false);
      }
    };

    checkToken();
  }, [token, router]);

  const handleSubmit = async () => {
    setError(null);
    setFieldErrors({});

    /** ✅ Zod validation */
    const result = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!result.success) {
      const f = result.error.flatten().fieldErrors;

      setFieldErrors({
        password: f.password?.[0],
        confirmPassword: f.confirmPassword?.[0],
      });

      return;
    }

    if (!token) {
      setError("トークンがありません");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          token,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "パスワード更新に失敗しました");
        return;
      }

      setIsSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) return <p>確認中...</p>;

  if (isSuccess) {
    return (
      <div>
        <p>パスワードを更新しました</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          パスワード再設定
        </h1>

        {/* Password */}
        <div className="mb-2">
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-md"
            placeholder="パスワード"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((p) => ({ ...p, password: undefined }));
            }}
          />
          {fieldErrors.password && (
            <p className="text-red-500 text-sm mt-1">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-2">
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-md"
            placeholder="パスワード（確認）"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setFieldErrors((p) => ({
                ...p,
                confirmPassword: undefined,
              }));
            }}
          />
          {fieldErrors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 text-center mb-4">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-md"
        >
          {isLoading ? "更新中..." : "登録"}
        </button>
      </div>
    </div>
  );
}