"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Plus,
  List,
  FileText,
  Trash2,
  Edit,
  Lock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
  LogOut,
} from "lucide-react";

const API = "/api/admin/manga";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [tab, setTab] = useState<"add" | "chapter" | "list">("add");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [mangaList, setMangaList] = useState<string[]>([]);

  // ===== Add Manga form =====
  const [form, setForm] = useState({
    slug: "",
    title: "",
    alternativeTitle: "",
    cover: "",
    author: "",
    artist: "",
    status: "ongoing",
    type: "manga",
    synopsis: "",
    genres: "",
    releaseYear: new Date().getFullYear(),
    rating: 0,
  });

  // ===== Add Chapter form =====
  const [chForm, setChForm] = useState({
    mangaSlug: "",
    number: 1,
    title: "",
    releaseDate: new Date().toISOString().split("T")[0],
    pages: "",
  });

  // ===== Edit Manga =====
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  const authedPassword = typeof window !== "undefined" ? sessionStorage.getItem("admin_pw") || "" : "";

  const fetchMangaList = useCallback(async () => {
    try {
      const res = await fetch(`${API}?pw=${authedPassword}`);
      const data = await res.json();
      if (Array.isArray(data)) setMangaList(data);
    } catch {}
  }, [authedPassword]);

  useEffect(() => {
    if (authedPassword) {
      setAuthed(true);
      fetchMangaList();
    }
  }, [authedPassword, fetchMangaList]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    sessionStorage.setItem("admin_pw", password);
    setAuthed(true);
    setPassword("");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_pw");
    setAuthed(false);
    setTab("add");
    setMangaList([]);
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const sanitizeSlug = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  // ===== Add Manga =====
  const handleAddManga = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const genres = form.genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);

      const res = await fetch(`${API}?pw=${authedPassword}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug: sanitizeSlug(form.slug || form.title),
          genres,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showMessage("error", data.error);
      } else {
        showMessage("success", `✅ "${form.title}" berhasil ditambahkan!`);
        setForm({
          slug: "", title: "", alternativeTitle: "", cover: "", author: "", artist: "",
          status: "ongoing", type: "manga", synopsis: "", genres: "",
          releaseYear: new Date().getFullYear(), rating: 0,
        });
        fetchMangaList();
      }
    } catch (err: any) {
      showMessage("error", "Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  // ===== Add Chapter =====
  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const pages = chForm.pages
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);

      const res = await fetch(`${API}?pw=${authedPassword}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: chForm.mangaSlug,
          chapters: [
            {
              number: chForm.number,
              title: chForm.title,
              releaseDate: new Date(chForm.releaseDate).toISOString(),
              pages,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.error) {
        showMessage("error", data.error);
      } else {
        showMessage("success", `✅ Chapter ${chForm.number} berhasil ditambahkan ke "${data.manga?.title}"!`);
        setChForm({
          mangaSlug: chForm.mangaSlug,
          number: chForm.number + 1,
          title: "",
          releaseDate: new Date().toISOString().split("T")[0],
          pages: "",
        });
      }
    } catch (err: any) {
      showMessage("error", "Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  // ===== Delete Manga =====
  const handleDelete = async (slug: string) => {
    if (!confirm(`Yakin hapus "${slug}"?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}?pw=${authedPassword}&slug=${slug}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) {
        showMessage("error", data.error);
      } else {
        showMessage("success", `✅ "${slug}" dihapus`);
        fetchMangaList();
      }
    } catch {
      showMessage("error", "Gagal hapus");
    } finally {
      setLoading(false);
    }
  };

  // ===== Edit Manga =====
  const handleEditClick = async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}?pw=${authedPassword}&slug=${slug}`);
      const data = await res.json();
      if (data.error) {
        showMessage("error", data.error);
      } else {
        setEditing(slug);
        setEditForm(data);
      }
    } catch {
      showMessage("error", "Gagal load manga");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editing || !editForm) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}?pw=${authedPassword}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: editing,
          title: editForm.title,
          alternativeTitle: editForm.alternativeTitle,
          cover: editForm.cover,
          author: editForm.author,
          artist: editForm.artist,
          status: editForm.status,
          type: editForm.type,
          synopsis: editForm.synopsis,
          genres: editForm.genres,
          releaseYear: editForm.releaseYear,
          rating: editForm.rating,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showMessage("error", data.error);
      } else {
        showMessage("success", `✅ "${editForm.title}" diperbarui`);
        setEditing(null);
        setEditForm(null);
        fetchMangaList();
      }
    } catch {
      showMessage("error", "Gagal update");
    } finally {
      setLoading(false);
    }
  };

  // ===== Delete Chapter =====
  const handleDeleteChapter = async (slug: string, chapterNum: number) => {
    if (!confirm(`Hapus Chapter ${chapterNum} dari "${slug}"?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}?pw=${authedPassword}&slug=${slug}`);
      const data = await res.json();
      if (data.error) {
        showMessage("error", data.error);
        setLoading(false);
        return;
      }
      const updated = { ...data, slug, chapters: data.chapters.filter((c: any) => c.number !== chapterNum) };
      delete updated._sha;

      const putRes = await fetch(`${API}?pw=${authedPassword}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const putData = await putRes.json();
      if (putData.error) {
        showMessage("error", putData.error);
      } else {
        showMessage("success", `✅ Chapter ${chapterNum} dihapus`);
        handleEditClick(slug);
      }
    } catch {
      showMessage("error", "Gagal hapus chapter");
    } finally {
      setLoading(false);
    }
  };

  // ===== Login page =====
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <form onSubmit={handleLogin} className="w-full max-w-sm mx-4 space-y-4 p-8 bg-card border border-border rounded-xl">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Masukkan password untuk melanjutkan</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password admin"
            className="w-full h-10 px-4 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <button
            type="submit"
            className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Masuk
          </button>
        </form>
      </div>
    );
  }

  // ===== Admin Dashboard =====
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2 font-bold">
            <BookOpen className="w-5 h-5 text-primary" />
            Admin Panel
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 px-3 py-1.5 rounded hover:bg-secondary"
            >
              Lihat Website <ArrowRight className="w-3 h-3" />
            </a>
            <button onClick={handleLogout} className="p-2 rounded hover:bg-secondary text-muted-foreground hover:text-red-500">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg text-sm flex items-start gap-2 ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-500"
                : "bg-red-500/10 border border-red-500/20 text-red-500"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1 mb-6">
          {(["add", "chapter", "list"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                tab === t ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "add" && <Plus className="w-4 h-4" />}
              {t === "chapter" && <FileText className="w-4 h-4" />}
              {t === "list" && <List className="w-4 h-4" />}
              {t === "add" ? "Tambah Manga" : t === "chapter" ? "Tambah Chapter" : "Daftar Manga"}
            </button>
          ))}
        </div>

        {/* Tab: Add Manga */}
        {tab === "add" && (
          <form onSubmit={handleAddManga} className="space-y-4 bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold">➕ Tambah Manga Baru</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Judul *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    if (!form.slug) setForm((f) => ({ ...f, slug: sanitizeSlug(e.target.value) }));
                  }}
                  className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Chainsaw Man"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  placeholder="chainsaw-man"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Judul Alternatif</label>
                <input
                  value={form.alternativeTitle}
                  onChange={(e) => setForm({ ...form, alternativeTitle: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Cover URL</label>
                <input
                  value={form.cover}
                  onChange={(e) => setForm({ ...form, cover: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Author *</label>
                <input
                  required
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Artist</label>
                <input
                  value={form.artist}
                  onChange={(e) => setForm({ ...form, artist: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Tamat</option>
                  <option value="hiatus">Hiatus</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tipe</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="manga">Manga</option>
                  <option value="manhwa">Manhwa</option>
                  <option value="manhua">Manhua</option>
                  <option value="comic">Comic</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tahun Rilis</label>
                <input
                  type="number"
                  value={form.releaseYear}
                  onChange={(e) => setForm({ ...form, releaseYear: parseInt(e.target.value) || 2024 })}
                  className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Rating (0-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })}
                  className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Genre (pisahkan dengan koma)</label>
              <input
                value={form.genres}
                onChange={(e) => setForm({ ...form, genres: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Action, Fantasy, Adventure"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Sinopsis</label>
              <textarea
                value={form.synopsis}
                onChange={(e) => setForm({ ...form, synopsis: e.target.value })}
                className="w-full h-28 px-3 py-2 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Tambah Manga
            </button>
          </form>
        )}

        {/* Tab: Add Chapter */}
        {tab === "chapter" && (
          <form onSubmit={handleAddChapter} className="space-y-4 bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold">📄 Tambah Chapter</h2>

            <div>
              <label className="text-sm font-medium mb-1 block">Manga *</label>
              <select
                required
                value={chForm.mangaSlug}
                onChange={(e) => setChForm({ ...chForm, mangaSlug: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Pilih manga...</option>
                {mangaList.map((slug) => (
                  <option key={slug} value={slug}>{slug}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">No. Chapter *</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={chForm.number}
                  onChange={(e) => setChForm({ ...chForm, number: parseInt(e.target.value) || 1 })}
                  className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Judul Chapter</label>
                <input
                  value={chForm.title}
                  onChange={(e) => setChForm({ ...chForm, title: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Awakening"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tanggal Rilis</label>
                <input
                  type="date"
                  value={chForm.releaseDate}
                  onChange={(e) => setChForm({ ...chForm, releaseDate: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">URL Gambar (1 per baris)</label>
              <textarea
                value={chForm.pages}
                onChange={(e) => setChForm({ ...chForm, pages: e.target.value })}
                className="w-full h-32 px-3 py-2 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y font-mono"
                placeholder="https://example.com/page1.jpg&#10;https://example.com/page2.jpg&#10;https://example.com/page3.jpg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Tambah Chapter
            </button>
          </form>
        )}

        {/* Tab: List Manga */}
        {tab === "list" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">📚 Daftar Manga ({mangaList.length})</h2>
              <button onClick={fetchMangaList} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Refresh
              </button>
            </div>

            {editing && editForm ? (
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="font-semibold">✏️ Edit: {editing}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ["title", "Judul"],
                    ["alternativeTitle", "Judul Alt"],
                    ["cover", "Cover URL"],
                    ["author", "Author"],
                    ["artist", "Artist"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="text-sm font-medium mb-1 block">{label}</label>
                      <input
                        value={editForm[key] || ""}
                        onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-sm font-medium mb-1 block">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Tamat</option>
                      <option value="hiatus">Hiatus</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tipe</label>
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="manga">Manga</option>
                      <option value="manhwa">Manhwa</option>
                      <option value="manhua">Manhua</option>
                      <option value="comic">Comic</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tahun</label>
                    <input
                      type="number"
                      value={editForm.releaseYear}
                      onChange={(e) => setEditForm({ ...editForm, releaseYear: parseInt(e.target.value) })}
                      className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={editForm.rating}
                      onChange={(e) => setEditForm({ ...editForm, rating: parseFloat(e.target.value) })}
                      className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Genre (koma)</label>
                  <input
                    value={Array.isArray(editForm.genres) ? editForm.genres.join(", ") : editForm.genres || ""}
                    onChange={(e) => setEditForm({ ...editForm, genres: e.target.value.split(",").map((g: string) => g.trim()).filter(Boolean) })}
                    className="w-full h-10 px-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Sinopsis</label>
                  <textarea
                    value={editForm.synopsis || ""}
                    onChange={(e) => setEditForm({ ...editForm, synopsis: e.target.value })}
                    className="w-full h-24 px-3 py-2 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                  />
                </div>

                {/* Chapters in edit */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Chapter ({editForm.chapters?.length || 0})</label>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {editForm.chapters?.map((ch: any) => (
                      <div key={ch.number} className="flex items-center justify-between p-2 rounded bg-secondary text-sm">
                        <span>
                          Ch. {ch.number}{ch.title ? ` - ${ch.title}` : ""}
                          <span className="text-xs text-muted-foreground ml-2">({ch.pages?.length || 0} halaman)</span>
                        </span>
                        <button
                          onClick={() => handleDeleteChapter(editing!, ch.number)}
                          className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleEditSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Simpan
                  </button>
                  <button
                    onClick={() => { setEditing(null); setEditForm(null); }}
                    className="px-4 py-2 rounded-lg text-sm hover:bg-secondary"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              mangaList.map((slug) => (
                <div
                  key={slug}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{slug}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(slug)}
                      className="p-2 rounded hover:bg-secondary text-muted-foreground hover:text-primary"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(slug)}
                      className="p-2 rounded hover:bg-secondary text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
