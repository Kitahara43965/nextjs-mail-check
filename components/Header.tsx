"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/auth/LogoutButton";
import { useSession } from "next-auth/react";

export default function Header() {

  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b">

      <Link href="/">
        <Logo />
      </Link>

      <nav className="flex items-center gap-4">

        {session ? (
          <>
            <Link href="/dashboard">
              ダッシュボード
            </Link>

            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login">
              ログイン
            </Link>

            <Link href="/register">
              会員登録
            </Link>
          </>
        )}

      </nav>

    </header>
  );
}