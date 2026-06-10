"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ResendVerificationKind } from "@/constants/resend-verification-kind.constant";
import { ResendVerificationError } from "@/constants/resend-verification-error.constant";
import { ResendVerificationStatus } from "@/constants/resend-verification-status.constant";
import { useSearchParams } from "next/navigation";
import { getVerifyMessage } from "@/services/tool/get-verify-message.service";


export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const intervalDuration = 3000;
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const verifyMessage = getVerifyMessage(reason);

  const handleResend = async () => {
    let shouldGoVerify: boolean = false;
    let resendVerificationKind: number = ResendVerificationKind.UNDEFINED;
    let resendVerificationError:string|null = ResendVerificationError.UNDEFINED;
    let resendVerificationStatus:string|null = ResendVerificationStatus.UNDEFINED;

    if (loading) return;
    setLoading(true);
    setMessage(null);

    resendVerificationKind = ResendVerificationKind.MAIL_RESENDING;

    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resendVerificationKind: resendVerificationKind,
          email:null,
        }),
      });

      const data = await res.json();
      if (data) {
        shouldGoVerify = data.shouldGoVerify;
        resendVerificationError = data.resendVerificationError;
        resendVerificationStatus = data.resendVerificationStatus;
      } //data

      if (data.resendVerificationError != ResendVerificationError.UNDEFINED) {
        setMessage(data.resendVerificationError || "送信に失敗しました");
        return;
      }

      setMessage("認証メールを送信しました！");
    } catch (err) {
      setMessage("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const checkVerification = async () => {

    const res = await fetch("/api/resend-verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resendVerificationKind: ResendVerificationKind.CHECK_VERIFICATION,
        email:null,
      }),
    });

    return res.json();
  };

  useEffect(() => {
  let interval: ReturnType<typeof setInterval>;

    const run = async () => {
      const data = await checkVerification();

      if (data?.shouldGoVerify === false) {
        router.replace("/dashboard");
        return;
      }

      interval = setInterval(async () => {
        try {
          const data = await checkVerification();

          if (data?.shouldGoVerify === false) {
            clearInterval(interval);
            router.replace("/dashboard");
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }, intervalDuration);
    };

    run();

    return () => clearInterval(interval);
  }, [router, intervalDuration]);

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">

      <h1 className="text-2xl font-bold mb-4">
        メール認証が必要です
      </h1>

      <p className="text-gray-600 mb-6">
        {verifyMessage}
      </p>

      {message && (
        <p
          className={`mb-4 text-sm font-medium "text-green-600"}`}
        >
          {message}
        </p>
      )}

      {/* ボタン */}
      <button
        onClick={handleResend}
        disabled={loading}
        className={`w-full py-2 rounded-md text-white transition
          ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }
        `}
      >
        {loading ? "送信中..." : "認証メールを再送する"}
      </button>

      {/* ローディング補足 */}
      {loading && (
        <p className="text-xs text-gray-500 mt-2">
          メールを送信しています...
        </p>
      )}

      <p className="text-sm text-gray-500 mt-4">
        認証完了後、自動でダッシュボードへ移動します...
      </p>
    </div>
  </div>
);
}
