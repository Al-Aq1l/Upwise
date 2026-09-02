import { useState } from "react";
import { BookOpenText, Save, X } from "lucide-react";
import { useJournals, useCreateJournal, useDeleteJournal } from "@/hooks/useJournals";
import { useNotificationStore } from "@/lib/notifications";
import PanelTitle from "@/components/ui/PanelTitle";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function JournalPage() {
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const { data, isLoading } = useJournals(page);
  const createJournalMutation = useCreateJournal();
  const deleteJournalMutation = useDeleteJournal();
  const { showToast } = useNotificationStore();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const currentTitle = title;
    const currentBody = body;

    // 1. Instantly reset inputs
    setTitle("");
    setBody("");

    // 2. Instantly show toast notification (0ms)
    showToast({
      type: "quest",
      title: "Journal Tersimpan!",
      message: `Catatan jurnal berhasil disimpan! +35 EXP`,
      exp: 35,
    });

    // 3. Mutate in background
    createJournalMutation.mutate(
      { title: currentTitle, body: currentBody },
      {
        onError: (err: any) => {
          const msg = err?.response?.data?.message || "Gagal menyimpan journal. Silakan coba lagi.";
          showToast({
            type: "info",
            title: "Gagal Simpan Journal",
            message: msg,
          });
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Hapus jurnal ini?")) {
      // Instantly notify
      showToast({
        type: "info",
        title: "Journal Dihapus",
        message: "Entri jurnal berhasil dihapus.",
      });

      deleteJournalMutation.mutate(id, {
        onError: (err: any) => {
          const msg = err?.response?.data?.message || "Gagal menghapus journal.";
          showToast({
            type: "info",
            title: "Gagal Hapus",
            message: msg,
          });
        },
      });
    }
  };

  return (
    <div className="content-grid two-col">
      <section className="panel form-panel">
        <PanelTitle icon={BookOpenText} title="Tulis Journal" />
        <form onSubmit={handleSave} className="form-container">
          <label>
            Judul
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Catatan perjalanan hari ini"
              required
            />
          </label>
          <label>
            Isi
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Apa yang terjadi, dipelajari, dan perlu diperbaiki?"
              required
            />
          </label>
          <button className="primary" type="submit" disabled={createJournalMutation.isPending}>
            <Save size={18} />{" "}
            {createJournalMutation.isPending ? "Menyimpan..." : "Simpan Journal"}
          </button>
        </form>
      </section>

      <section className="journal-list">
        {data?.data && data.data.length > 0 ? (
          data.data.map((journal) => (
            <article key={journal.id} className="panel journal-item">
              <div className="journal-head">
                <span>
                  {new Date(journal.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  className="icon-btn remove-journal-btn"
                  aria-label="Hapus journal"
                  onClick={() => handleDelete(journal.id)}
                >
                  <X size={16} />
                </button>
              </div>
              <h3>{journal.title}</h3>
              <p>{journal.body}</p>
            </article>
          ))
        ) : (
          <p className="muted empty-text">Belum ada jurnal petualangan. Tulis jurnal pertamamu!</p>
        )}

        {data && data.last_page > 1 && (
          <div className="pagination">
            <button
              className="secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="pagination-info">
              {page} / {data.last_page}
            </span>
            <button
              className="secondary"
              disabled={page === data.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
