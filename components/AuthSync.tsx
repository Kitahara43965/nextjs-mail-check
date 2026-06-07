"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const channel = new BroadcastChannel("auth");

export function AuthSync() {
  const router = useRouter();

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;

      if (msg?.type === "LOGIN" || msg?.type === "LOGOUT") {
        // NextAuthの正本に合わせる
        router.refresh();
      }
    };

    channel.addEventListener("message", handler);

    return () => {
      channel.removeEventListener("message", handler);
    };
  }, [router]);

  return null;
}