"use client";

import { useState } from "react";
import { ResendVerificationKind } from "@/constants/resend-verification-kind.constant";
import { z } from "zod";

/** Zod schema */
const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("正しいメールアドレスを入力してください"),
});

export default function RequestPasswordResetPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setError(null);
    setIsDone(false);

    /** ✅ Zod validation */
    const result = requestPasswordResetSchema.safeParse({ email });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setError(fieldErrors.email?.[0] ?? "入力エラーがあります");
      return;
    }

    setIsLoading(true);

    try {

      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resendVerificationKind: ResendVerificationKind.REQUEST_PASSWORD_RESET,
          email:email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "送信に失敗しました");
        return;
      }

      // 成功表示（存在有無に依存しない設計）
      setIsDone(true);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          パスワード再設定
        </h1>

        {/* Email */}
        <div className="mb-4">
          <input
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 text-center mb-4">
            {error}
          </p>
        )}

        {/* Success */}
        {isDone && (
          <p className="text-green-600 text-center mb-4">
            メールアドレスが登録されている場合は送信しました
          </p>
        )}

        {/* Button */}
        <button
          onClick={send}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {isLoading ? "送信中..." : "送信"}
        </button>
      </div>
    </div>
  );
}