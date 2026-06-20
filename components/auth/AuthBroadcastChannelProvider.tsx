"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthBroadcastChannel } from "@/lib/auth/get-auth-broadcast-channel";
import { signOut } from "next-auth/react";

export default function AuthBroadcastChannelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const authBroadcastChannel = getAuthBroadcastChannel();

    if (!authBroadcastChannel) return;

    const handler = async (event: MessageEvent) => {
      switch (event.data?.type) {
        case "LOGIN":
          break;

        case "LOGOUT":
          break;

        case "SESSION_EXPIRED":
          break;
      }
    };

    authBroadcastChannel.onmessage = handler;

    return () => {
      authBroadcastChannel.onmessage = null;
      authBroadcastChannel.close();
    };

  }, [router]);

  return <>{children}</>;
}