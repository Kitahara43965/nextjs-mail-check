"use client";

import { redirect } from "next/navigation";
import { signOut } from "next-auth/react";
import { getAuthBroadcastChannel } from "@/lib/auth/get-auth-broadcast-channel";
import { useRouter } from "next/navigation";

export default function LogoutButton() {

  const router = useRouter();

  const handleLogout = async () => {

    const channel = getAuthBroadcastChannel();

    if(channel){

      channel.postMessage({
        type:"LOGOUT",
      });

      channel.close();
    }

    await signOut({
      redirect:false,
    });

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