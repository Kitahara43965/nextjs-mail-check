"use client";

import { useSession } from "next-auth/react";
import {getCanResendVerificationEmailFromSessionForClient} from "@/services/tool/can-resend-verification-email.service";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shouldGoVerify, setShouldGoVerify]
  = useState<boolean | null>(null);
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");


  useEffect(() => {
    let ignore:boolean = false;

    if (status !== "authenticated") {
      return;
    }

    const run = async () => {
      const formData = new FormData();
      const response = await fetch("/api/notes", {
        method: "GET",
      });

      const data = await response.json();

      if(data){
        setShouldGoVerify(data.shouldGoVerify);
      }//data
    }

    run();

    return () => {
      ignore = true;
    };
  }, [status]);

  useEffect(() => {

    if (shouldGoVerify) {
      router.push(`/verify?reason=dashboard`);
    }
  }, [shouldGoVerify]);


  if (status === "loading") {
    return <p>読み込み中...</p>;
  }

  if (status !== "authenticated") {
    return <p>ログインが必要です</p>;
  }

  if (shouldGoVerify === null) {
    return <p>認証確認中...</p>;
  }

  if (shouldGoVerify === true) {
  return <p>認証ページへ移動中...</p>;
}

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-gray-600">
          ログイン中: {session?.user?.name}
        </p>
      </header>

      <div className="p-4 border rounded">
        <p>認証OKです 👍</p>
      </div>
    </div>
  );
}