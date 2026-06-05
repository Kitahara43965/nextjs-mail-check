"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ResendVerificationKind } from "@/constants/resend-verification-kind.constant";
import { ResendVerificationError } from "@/constants/resend-verification-error.constant";
import { ResendVerificationStatus } from "@/constants/resend-verification-status.constant";
import { useSearchParams } from "next/navigation";

type Props = {
  searchParams: {
    error?: string;
  };
};

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const intervalDuration = 3000;
  const searchParams = useSearchParams();
  const isInvalid = searchParams.get("error") === "invalid";

  const handleResend = async () => {
    let isVerificationEmailSent: boolean = false;
    let formDataResendVerification: FormData | null = null;
    let resendVerificationKind: number = ResendVerificationKind.UNDEFINED;
    let resendVerificationError:string|null = ResendVerificationError.UNDEFINED;
    let resendVerificationStatus:string|null = ResendVerificationStatus.UNDEFINED;

    if (loading) return;
    setLoading(true);
    setMessage(null);

    resendVerificationKind = ResendVerificationKind.MAIL_RESENDING;
    formDataResendVerification = new FormData();
    formDataResendVerification.append(
      "stringResendVerificationKind",
      resendVerificationKind.toString(),
    );
    try {

      const res = await fetch("/api/resend-verification", {
        method: "POST",
        body: formDataResendVerification,
      });

      const data = await res.json();
      if (data) {
        isVerificationEmailSent = data.isVerificationEmailSent;
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
    const formData = new FormData();
    formData.append(
      "stringResendVerificationKind",
      ResendVerificationKind.CHECK_VERIFICATION.toString(),
    );

    const res = await fetch("/api/resend-verification", {
      method: "POST",
      body: formData,
    });

    return res.json();
  };

  useEffect(() => {
  let interval: ReturnType<typeof setInterval>;

    const run = async () => {
      const data = await checkVerification();

      if (data?.isVerificationEmailSent === false) {
        router.push("/dashboard");
        return;
      }

      interval = setInterval(async () => {
        try {
          const data = await checkVerification();

          if (data?.isVerificationEmailSent === false) {
            clearInterval(interval);
            router.push("/dashboard");
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

      {isInvalid && (
        <div className="text-lg font-bold mb-4 text-red-600">
         無効なリンクです
        </div>
      )}

      <p className="text-gray-600 mb-6">
        ログインまたは会員登録時に認証メールを送信しています。
        メールに記載されたリンクをクリックすると認証が完了します。
        メールが見つからない場合は、迷惑メールフォルダもご確認ください。
      </p>

      {/* メッセージ表示（状態に応じて色変える） */}
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
