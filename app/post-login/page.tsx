"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostLoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    const run = async () => {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        body: new FormData(),
      });

      const data = await res.json();

      if (data?.shouldGoVerify) {
        router.replace("/verify");
      } else {
        router.replace("/dashboard");
      }
    };

    run();
  }, [status, router]);

  return <p>ログイン後処理中...</p>;
}