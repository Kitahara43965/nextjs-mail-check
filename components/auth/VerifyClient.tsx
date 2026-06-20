"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ResendVerificationKind } from "@/constants/resend-verification-kind.constant";
import { ResendVerificationError } from "@/constants/resend-verification-error.constant";
import { getAuthBroadcastChannel } from "@/lib/auth/get-auth-broadcast-channel";

type VerifyClientProps = {
  verifyMessage: string;
  reason: string|null;
};

export default function VerifyClient({
  verifyMessage,
  reason,
}: VerifyClientProps) {
  useEffect(()=>{

    const channel = getAuthBroadcastChannel();

    channel?.postMessage({
      type:"SESSION_EXPIRED"
    });

    return ()=>{
      channel?.close();
    };

  },[]);
  
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const intervalDuration = 3000;

  const handleResend = async () => {
    if (loading) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(
        "/api/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            resendVerificationKind:
              ResendVerificationKind.MAIL_RESENDING,
            email: null,
          }),
        }
      );

      const data = await res.json();

      if (
        data.resendVerificationError !==
        ResendVerificationError.UNDEFINED
      ) {
        setMessage(
          data.resendVerificationError ||
            "送信に失敗しました"
        );
        return;
      }

      setMessage(
        "認証メールを送信しました！"
      );
    } catch {
      setMessage(
        "エラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    let isStopped = false;

    const checkStatus = async () => {
      const res = await fetch(
        "/api/can-resend-verification-email"
      );
      const data = await res.json();

      if (data?.isLoggedIn === true) {
        if (
          data?.canResendVerificationEmailFromStringDate === false
        ) {
          router.replace("/dashboard?reason=interval");
          return;
        }
      }//data?.isLoggedIn

      if (!isStopped) {
        setTimeout(
          checkStatus,
          intervalDuration
        );
      }
    };

    checkStatus();

    return () => {
      isStopped = true;
    };
  }, [router]);


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
          <p className="mb-4 text-sm font-medium text-green-600">
            {message}
          </p>
        )}

        <button
          onClick={handleResend}
          disabled={loading}
          className={`w-full py-2 rounded-md text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading
            ? "送信中..."
            : "認証メールを再送する"}
        </button>

        {loading && (
          <p className="text-xs text-gray-500 mt-2">
            メールを送信しています...
          </p>
        )}

        <p className="text-sm text-gray-500 mt-4">
          認証完了後、自動でダッシュボードへ移動します
        </p>
      </div>
    </div>
  );
}