"use client";

import { useState } from "react";
import { z } from "zod";
import { ResendVerificationKind } from "@/constants/resend-verification-kind.constant";

const schema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("正しいメールアドレスを入力してください"),
});

export default function RequestPasswordResetForm() {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);


  async function send() {

    setError(null);
    setDone(false);

    const result = schema.safeParse({
      email,
    });


    if (!result.success) {
      setError(
        result.error.flatten().fieldErrors.email?.[0]
        ?? "入力エラーがあります"
      );
      return;
    }


    setLoading(true);


    try {

      const res = await fetch(
        "/api/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resendVerificationKind:
              ResendVerificationKind.REQUEST_PASSWORD_RESET,
            email,
          }),
        }
      );


      const data = await res.json();


      if (!res.ok) {
        setError(data?.error ?? "送信に失敗しました");
        return;
      }


      setDone(true);


    } catch {

      setError("通信エラーが発生しました");

    } finally {

      setLoading(false);

    }
  }


  return (
    <>

      {/* Email */}
      <div className="mb-4">

        <input
          className="
            w-full px-4 py-2 border rounded-md
            focus:ring-2 focus:ring-blue-500
            focus:outline-none
          "
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
      {done && (
        <p className="text-green-600 text-center mb-4">
          メールアドレスが登録されている場合は送信しました
        </p>
      )}


      {/* Button */}
      <button
        onClick={send}
        disabled={loading}
        className="
          w-full bg-blue-600 text-white py-2 rounded-md
          hover:bg-blue-700 transition
          disabled:bg-gray-400
        "
      >
        {loading ? "送信中..." : "送信"}

      </button>

    </>
  );
}