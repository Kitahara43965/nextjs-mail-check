"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "パスワードは8文字以上です"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "パスワードが一致しません",
  });

type Props = {
  token: string;
};

export default function PasswordResetForm({
  token,
}: Props) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setFieldErrors({});

    const result = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      setFieldErrors({
        password: errors.password?.[0],
        confirmPassword: errors.confirmPassword?.[0],
      });

      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          token,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.error ??
            "パスワード更新に失敗しました"
        );
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

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <p className="text-center text-green-600">
          パスワードを更新しました
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        パスワード再設定
      </h1>

      <div className="mb-2">
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors((prev) => ({
              ...prev,
              password: undefined,
            }));
          }}
          className="w-full px-4 py-2 border rounded-md"
        />

        {fieldErrors.password && (
          <p className="text-red-500 text-sm mt-1">
            {fieldErrors.password}
          </p>
        )}
      </div>

      <div className="mb-2">
        <input
          type="password"
          placeholder="パスワード（確認）"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setFieldErrors((prev) => ({
              ...prev,
              confirmPassword: undefined,
            }));
          }}
          className="w-full px-4 py-2 border rounded-md"
        />

        {fieldErrors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {error && (
        <p className="text-red-600 text-center mb-4">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-md"
      >
        {isLoading ? "更新中..." : "登録"}
      </button>
    </div>
  );
}