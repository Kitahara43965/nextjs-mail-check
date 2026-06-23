"use client";

import { redirect } from "next/navigation";
import { signOut,getSession } from "next-auth/react";
import { getAuthBroadcastChannel } from "@/lib/auth/get-auth-broadcast-channel";
import { useRouter } from "next/navigation";

export default function LogoutButton() {

  const router = useRouter();

  const handleLogout = async () => {

    const authBroadcastChannel = getAuthBroadcastChannel();

    await signOut({
      redirect:false,
    });

    if(authBroadcastChannel){
      authBroadcastChannel.postMessage({
        type:"LOGOUT",
      });

      setTimeout(() => {
        authBroadcastChannel.close();
      }, 100);
    }//authBroadcastChannel

    router.replace("/login");

  };


  return (
    <button
      onClick={handleLogout}
      className="text-red-500"
    >
      ログアウト
    </button>
  );
}