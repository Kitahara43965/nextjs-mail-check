"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthBroadcastChannel } from "@/lib/auth/get-auth-broadcast-channel";
import { signOut,getSession } from "next-auth/react";

export default function AuthBroadcastChannelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const authBroadcastChannel = getAuthBroadcastChannel();
    
    const handler = async (event: MessageEvent) => {
        
        switch (event.data?.type) {
          case "LOGIN":
            router.refresh();
            break;
          case "LOGOUT":
            router.replace("/login");
            break;
        }
    };

    if (authBroadcastChannel){
      authBroadcastChannel.onmessage = handler;
    }//authBroadcastChannel

    return () => {
      if(authBroadcastChannel){
        authBroadcastChannel.close();
      }//authBroadcastChannel
    };

  }, [router]);

  return <>{children}</>;
}
