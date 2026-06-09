"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Logo from "@/components/Logo";
import { useRouter } from "next/navigation";

export default function Header() {
  const { status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <header className="flex items-center justify-between px-6 py-3 border-b bg-white">
        <Link href="/">
          <Logo />
        </Link>
        <p>準備中...</p>
      </header>
    );
  }

  const isLoggedIn = status === "authenticated";

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.replace("/login");
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white">
      <Link href="/">
        <Logo />
      </Link>

      <nav className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
            <Link href="/dashboard">ダッシュボード</Link>

            <button onClick={handleLogout} className="text-red-500">
              ログアウト
            </button>
          </>
        ) : (
          <>
            <Link href="/login">ログイン</Link>
            <Link href="/register">会員登録</Link>
          </>
        )}
      </nav>
    </header>
  );
}