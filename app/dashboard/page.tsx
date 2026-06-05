"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Note } from "@prisma/client";
import { z } from "zod";
import LogoutButton from "@/components/LogoutButton";

/** ========= ZOD ========= */
const noteSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  content: z.string().min(1, "内容を入力してください"),
});

type FieldErrors = {
  title?: string;
  content?: string;
  general?: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);

  const [createErrors, setCreateErrors] = useState<FieldErrors>({});
  const [editErrors, setEditErrors] = useState<FieldErrors>({});

  /** ========= fetch notes ========= */
  const fetchNotes = async () => {
    const res = await fetch("/api/notes");
    if (!res.ok) return null;
    return res.json();
  };

  useEffect(() => {
    if (status !== "authenticated") return;

    const run = async () => {
      const res = await fetch("/api/notes");
      const data = await res.json();

      if (data.isVerificationEmailSent) {
        router.push("/verify");
        return;
      }

      setNotes(data.notes);
      setLoading(false);
    };

    run();
  }, [status, router]);

  /** ========= CREATE ========= */
  const createNote = async () => {
    const result = noteSchema.safeParse({ title, content });

    if (!result.success) return;

    setCreating(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      // 👇ここが重要
      setNotes((prev) => [data.note, ...prev]);

      setTitle("");
      setContent("");
    } finally {
      setCreating(false);
    }
  };

  /** ========= EDIT ========= */
  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content || "");
    setEditErrors({});
  };

  const updateNote = async () => {
    if (!editingId) return;

    setEditErrors({});

    const result = noteSchema.safeParse({
      title: editTitle,
      content: editContent,
    });

    if (!result.success) {
      const f = result.error.flatten().fieldErrors;
      setEditErrors({
        title: f.title?.[0],
        content: f.content?.[0],
      });
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/notes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingId ? data.note : n
        )
      );

      setEditingId(null);
    } finally {
      setUpdating(false);
    }
  };

  /** ========= DELETE ========= */
  const deleteNote = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  if (status === "loading" || loading) {
    return <p>読み込み中...</p>;
  }
  
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      {/* ヘッダー */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold">メモアプリ</h1>
        <p className="text-gray-600">ようこそ {session?.user?.name}</p>
      </header>

      {/* ========= CREATE ========= */}
      <section className="mb-8 border-b pb-6">
        <h2 className="text-lg font-semibold mb-3">新規作成</h2>

        <input
          className="border p-2 w-full mb-1"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setCreateErrors((p) => ({ ...p, title: undefined }));
          }}
          placeholder="タイトル"
        />
        {createErrors.title && (
          <p className="text-red-500 text-sm mb-2">{createErrors.title}</p>
        )}

        <textarea
          className="border p-2 w-full mb-1"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setCreateErrors((p) => ({ ...p, content: undefined }));
          }}
          placeholder="内容"
        />
        {createErrors.content && (
          <p className="text-red-500 text-sm mb-2">{createErrors.content}</p>
        )}

        <button
          onClick={createNote}
          disabled={creating}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {creating ? "追加中..." : "追加"}
        </button>
      </section>

      {/* ========= LIST ========= */}
      <section className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-gray-500">まだメモがありません</p>
        ) : (
          notes.map((note) => (
            <article key={note.id} className="border p-3 rounded">
              <div className="flex gap-4 text-xs text-gray-500">
                <p>作成: {new Date(note.createdAt).toLocaleString()}</p>
                <span>•</span>
                <p>更新: {new Date(note.updatedAt).toLocaleString()}</p>
              </div>
              {editingId === note.id ? (
                <>
                  {/* EDIT MODE */}
                  <input
                    className="border p-1 w-full mb-1"
                    value={editTitle}
                    onChange={(e) => {
                      setEditTitle(e.target.value);
                      setEditErrors((p) => ({ ...p, title: undefined }));
                    }}
                  />
                  {editErrors.title && (
                    <p className="text-red-500 text-sm mb-1">
                      {editErrors.title}
                    </p>
                  )}

                  <textarea
                    className="border p-1 w-full mb-1"
                    value={editContent}
                    onChange={(e) => {
                      setEditContent(e.target.value);
                      setEditErrors((p) => ({ ...p, content: undefined }));
                    }}
                  />
                  {editErrors.content && (
                    <p className="text-red-500 text-sm mb-1">
                      {editErrors.content}
                    </p>
                  )}

                  <button
                    onClick={updateNote}
                    className="text-green-600"
                  >
                    {updating ? "保存中..." : "保存"}
                  </button>
                </>
              ) : (
                <>
                  {/* VIEW MODE */}
                  <h3 className="font-bold">{note.title}</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {note.content}
                  </p>

                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={() => startEdit(note)}
                      className="text-blue-500"
                    >
                      編集
                    </button>

                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-500"
                    >
                      削除
                    </button>
                  </div>
                </>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
}