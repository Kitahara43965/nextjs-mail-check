import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">MemoApp</h1>

      <p className="text-gray-600">
        シンプルで使いやすいメモ管理アプリ
      </p>

      <Link
        href="/dashboard"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        はじめる
      </Link>
    </main>
  );
}