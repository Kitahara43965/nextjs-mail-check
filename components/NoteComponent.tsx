"use client";

import { useEffect, useState } from "react";
import type {Note} from "@prisma/client"
import { z } from "zod";

export default function NoteComponent() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content ?? "");
  };

  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
  }>({});

  const [editErrors, setEditErrors] = useState<{
    title?: string;
    content?: string;
  }>({});

  const noteSchema = z.object({
    title: z.string().min(1, "タイトルの入力をお願いします"),
    content: z.string().min(1, "内容の入力をお願いします"),
  });

  // ========= fetch =========
  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        return;
      }

      setNotes(data.notes ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // ========= create =========
  const createNote = async () => {
    const result = noteSchema.safeParse({ title, content });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        title: fieldErrors.title?.[0],
        content: fieldErrors.content?.[0],
      });

      return;
    }

    setErrors({});
    setCreating(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      if (!res.ok) return;

      // 🚀 即反映
      setNotes((prev) => [data.note, ...prev]);

      setTitle("");
      setContent("");
    } finally {
      setCreating(false);
    }
  };

  const deleteNote = async (id: string) => {
    // 🚀 先にUIから消す（速く見せる）
    setNotes((prev) => prev.filter((n) => n.id !== id));

    const res = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      console.error(await res.json());
    }
  };

  const updateNote = async () => {
    if (!editingId) return;

    const result = noteSchema.safeParse({
      title: editTitle,
      content: editContent,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setEditErrors({
        title: fieldErrors.title?.[0],
        content: fieldErrors.content?.[0],
      });

      return;
    }

    setEditErrors({});

    setEditingId(null);

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

    if (!res.ok) {
      console.error(await res.json());
    }
  };

  return (
    <div className="space-y-4">
      {/* ===== 作成フォーム ===== */}
      <div className="border p-3 rounded space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title}</p>
        )}

        <textarea
          className="border p-2 w-full"
          placeholder="内容"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {errors.content && (
          <p className="text-red-500 text-sm">{errors.content}</p>
        )}

        <button
          onClick={createNote}
          disabled={creating}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {creating ? "作成中..." : "メモ作成"}
        </button>
      </div>

      <div className="border p-2 text-xs text-gray-500 rounded">
        本サービスは継続的に改善を行っているため、仕様や機能は予告なく変更される場合があります。
        パスワード・個人情報などの機密性の高い情報の入力や保存はお控えください。
      </div>

      {/* ===== 一覧 ===== */}
      {loading ? (
        <p>読み込み中...</p>
      ) : notes.length === 0 ? (
        <p>まだメモがありません</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note.id} className="border p-2 rounded">
              {editingId === note.id ? (
                <div className="space-y-2">
                  
                  {/* タイトル */}
                  <input
                    value={editTitle}
                    onChange={(e) => {
                      setEditTitle(e.target.value);
                      setEditErrors((prev) => ({ ...prev, title: undefined }));
                    }}
                    className="border p-1 w-full"
                  />

                  {editErrors.title && (
                    <p className="text-red-500 text-sm">{editErrors.title}</p>
                  )}

                  {/* 内容 */}
                  <textarea
                    value={editContent}
                    onChange={(e) => {
                      setEditContent(e.target.value);
                      setEditErrors((prev) => ({ ...prev, content: undefined }));
                    }}
                    className="border p-1 w-full"
                  />

                  {editErrors.content && (
                    <p className="text-red-500 text-sm">{editErrors.content}</p>
                  )}

                  {/* ボタン */}
                  <div className="flex gap-2">
                    <button onClick={updateNote} className="text-green-600">
                      保存
                    </button>

                    <button onClick={() => setEditingId(null)}>
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  
                  <p className="font-bold">{note.title}</p>
                  <p className="text-sm text-gray-600">{note.content}</p>

                  <button
                    onClick={() => startEdit(note)}
                    className="text-blue-500"
                  >
                    編集
                  </button>

                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-500 ml-2"
                  >
                    削除
                  </button>
                </>
              )}
              {/* 日時 */}
              <div className="mt-1.5 text-xs text-gray-500">
                <p>
                  作成日：
                  {new Date(note.createdAt).toLocaleString("ja-JP")}
                </p>
                <p>
                  更新日：
                  {new Date(note.updatedAt).toLocaleString("ja-JP")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}