import { signIn, signOut } from "next-auth/react";
import { authChannel } from "@/lib/auth-channel";

export async function login(email: string, password: string) {
  const res = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (!res?.error) {
    authChannel.postMessage({ type: "LOGIN" });
  }

  return res;
}

export async function logout() {
  // ① 他タブに通知（先に送る）
  authChannel.postMessage({ type: "LOGOUT" });

  // ② 自タブのログアウト
  await signOut({
    callbackUrl: "/login",
  });
}