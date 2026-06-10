"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NoteComponent from "@/components/NoteComponent";
import { useSearchParams } from "next/navigation";
import { getVerifyMessage } from "@/services/tool/get-verify-message.service";

/** ========= Page ========= */
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shouldGoVerify, setShouldGoVerify] = useState<boolean | null>(null);
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status === "authenticated") {
      const run = async () => {
        const res = await fetch("/api/notes");
        const data = await res.json();

        if (data?.shouldGoVerify) {
          router.replace("/verify");
        } else {
          setShouldGoVerify(false);
        }
      };

      run();
    }
  }, [status, router]);

  if (status === "loading") return <p>読み込み中...</p>;
  if (shouldGoVerify === null) return <p>認証確認中...</p>;
  if (shouldGoVerify) return <p>認証ページへ移動中...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      <h1 className="text-3xl font-bold">ダッシュボード</h1>

      <p className="text-gray-600">
        ログイン中: {session?.user?.name}
      </p>

      <div className="mt-6 border p-4 rounded">
        <NoteComponent />
      </div>
    </div>
  );
}