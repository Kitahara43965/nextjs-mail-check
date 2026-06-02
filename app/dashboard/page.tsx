"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import LogoutButton from "@/app/components/LogoutButton";
import type { Note } from "@prisma/client";
import { z } from "zod";

type FieldErrors = {
  title?: string;
  content?: string;
  general?: string;
};

/** ========= ZOD ========= */
const noteSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  content: z.string().min(1, "内容を入力してください"),
});

/** editも同じ */
const editSchema = noteSchema;

/** ========= component ========= */
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [createErrors, setCreateErrors] = useState<FieldErrors>({});
  const [editErrors, setEditErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchNotes = useCallback(async () => {
    const res = await fetch("/api/notes");
    if (!res.ok) return;
    setNotes(await res.json());
  }, []);

  useEffect(() => {
    let ignore = false;

    const fetchNotes = async () => {
      const res = await fetch("/api/notes");
      if (!res.ok) return;

      const data = await res.json();

      if (!ignore) {
        setNotes(data);
      }
    };

    fetchNotes();

    return () => {
      ignore = true;
    };
  }, []);

  /** ========= CREATE ========= */
  const createNote = async () => {
    setCreateErrors({});

    const result = noteSchema.safeParse({ title, content });

    if (!result.success) {
      const f = result.error.flatten().fieldErrors;
      setCreateErrors({
        title: f.title?.[0],
        content: f.content?.[0],
      });
      return;
    }

    setLoading(true);

    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      setTitle("");
      setContent("");
      await fetchNotes();
    } finally {
      setLoading(false);
    }
  };

  /** ========= EDIT ========= */
  const updateNote = async () => {
    if (!editingId) return;

    setEditErrors({});

    const result = editSchema.safeParse({
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

    setLoading(true);

    try {
      await fetch(`/api/notes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      setEditingId(null);
      await fetchNotes();
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content || "");
    setEditErrors({});
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      <h1 className="text-3xl font-bold mb-4">メモアプリ</h1>
      <p className="mb-6">ようこそ {session?.user?.name}</p>

      {/* CREATE */}
      <div className="mb-6">
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
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "作成中..." : "追加"}
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="border p-3 rounded">
            {editingId === note.id ? (
              <>
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

                <button onClick={updateNote} className="text-green-600">
                  保存
                </button>
              </>
            ) : (
              <>
                <h3 className="font-bold">{note.title}</h3>
                <p>{note.content}</p>

                <button
                  onClick={() => startEdit(note)}
                  className="text-blue-500 mr-2"
                >
                  編集
                </button>

                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-red-500"
                >
                  削除
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}