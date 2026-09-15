import { useState } from "react";
import { BookOpenText, Save, X, Eye, Calendar, Trash2, Clock, Sparkles } from "lucide-react";
import { useJournals, useCreateJournal, useDeleteJournal, Journal } from "@/hooks/useJournals";
import { useNotificationStore } from "@/lib/notifications";
import PanelTitle from "@/components/ui/PanelTitle";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function JournalPage() {
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);

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
      if (selectedJournal?.id === id) {
        setSelectedJournal(null);
      }

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

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  return (
    <div className="content-grid two-col journal-page-grid">
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
            {createJournalMutation.isPending ? "Menyimpan..." : "Simpan Journal (+35 EXP)"}
          </button>
        </form>
      </section>

      <section className="journal-list-section">
        <div className="journal-list-header">
          <div className="journal-list-title">
            <BookOpenText size={18} className="text-cyan" />
            <strong>Arsip Jurnal Petualangan</strong>
          </div>
          {data?.total !== undefined && (
            <span className="journal-count-badge">{data.total} Catatan</span>
          )}
        </div>

        {isLoading ? (
          <div className="journal-loading-box">
            <LoadingSpinner />
          </div>
        ) : data?.data && data.data.length > 0 ? (
          <div className="journal-cards-container">
            {data.data.map((journal) => (
              <article
                key={journal.id}
                className="journal-compact-card"
                onClick={() => setSelectedJournal(journal)}
                title="Klik untuk membuka preview lengkap"
              >
                <div className="journal-compact-top">
                  <div className="journal-date-chip">
                    <Calendar size={12} />
                    <span>
                      {new Date(journal.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="journal-actions-row">
                    <span className="journal-exp-tag">+35 EXP</span>
                    <button
                      type="button"
                      className="journal-delete-btn"
                      aria-label="Hapus journal"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(journal.id);
                      }}
                      title="Hapus Jurnal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="journal-compact-title">{journal.title}</h3>
                <p className="journal-compact-snippet">{journal.body}</p>

                <div className="journal-compact-footer">
                  <span className="journal-word-count">
                    {countWords(journal.body)} kata
                  </span>
                  <div className="journal-preview-hint">
                    <span>Baca Selengkapnya</span>
                    <Eye size={13} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-journal-box">
            <p className="muted empty-text">Belum ada jurnal petualangan.</p>
            <span className="empty-subtext">Tulis refleksi harianmu untuk mengumpulkan +35 EXP!</span>
          </div>
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

      {/* Journal Preview Modal */}
      {selectedJournal && (
        <div className="modal-overlay" onClick={() => setSelectedJournal(null)}>
          <div
            className="journal-preview-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedJournal(null)}
              aria-label="Tutup"
            >
              <X size={18} />
            </button>

            <div className="journal-modal-header">
              <div className="journal-modal-badges">
                <span className="journal-badge-hunter">
                  <Sparkles size={12} className="text-cyan" />
                  HUNTER ARCHIVE · ADVENTURE LOG
                </span>
                <span className="journal-badge-exp">+35 EXP REWARD</span>
              </div>

              <h2 className="journal-modal-title">{selectedJournal.title}</h2>

              <div className="journal-modal-meta">
                <div className="meta-item">
                  <Calendar size={14} />
                  <span>
                    {new Date(selectedJournal.created_at).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="meta-item">
                  <Clock size={14} />
                  <span>
                    {new Date(selectedJournal.created_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    WIB
                  </span>
                </div>
                <div className="meta-item">
                  <span>{countWords(selectedJournal.body)} Kata</span>
                </div>
              </div>
            </div>

            <div className="journal-modal-content">
              <p className="journal-modal-body">{selectedJournal.body}</p>
            </div>

            <div className="journal-modal-footer">
              <button
                type="button"
                className="journal-modal-delete-btn"
                onClick={() => handleDelete(selectedJournal.id)}
              >
                <Trash2 size={15} />
                <span>Hapus Jurnal</span>
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => setSelectedJournal(null)}
              >
                Selesai Membaca
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

