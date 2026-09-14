import { useState, useMemo, useEffect } from "react";
import {
  History,
  Timer,
  ClipboardList,
  Swords,
  BookOpenText,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  Flame,
  ArrowUpRight,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useHistory } from "@/hooks/useHistory";
import PanelTitle from "@/components/ui/PanelTitle";
import Metric from "@/components/ui/Metric";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type FilterTab = "all" | "focus" | "quest" | "dungeon" | "journal";

export default function HistoryPage() {
  const { data, isLoading } = useHistory();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const unifiedTimeline = useMemo(() => {
    if (!data) return [];

    const items: Array<{
      id: string;
      type: "focus" | "quest" | "dungeon" | "journal";
      title: string;
      subtitle?: string;
      details?: string;
      timestamp: Date;
      dateStr: string;
      timeStr: string;
      tag?: string;
      badge?: string;
      exp?: number;
    }> = [];

    // 1. Focus Sessions
    data.focus_sessions.forEach((s) => {
      const date = new Date(s.completed_at || s.started_at || s.date);
      items.push({
        id: `focus-${s.id}`,
        type: "focus",
        title: s.quest_title || "General Focus",
        subtitle: `${s.duration_minutes} Menit Deep Focus`,
        timestamp: date,
        dateStr: date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        timeStr: date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        tag: "Fokus",
        badge: `${s.duration_minutes}m`,
        exp: s.duration_minutes,
      });
    });

    // 2. Completed Quests
    data.quests.forEach((q) => {
      const date = new Date(q.completed_at || q.date);
      items.push({
        id: `quest-${q.id}`,
        type: "quest",
        title: q.title,
        subtitle: `${q.category} · Kesulitan ${q.difficulty}`,
        timestamp: date,
        dateStr: date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        timeStr: q.completed_at
          ? new Date(q.completed_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
          : "-",
        tag: q.category,
        badge: `+${q.exp_reward} EXP`,
        exp: q.exp_reward,
      });
    });

    // 3. Dungeon Sessions
    data.dungeon_sessions.forEach((d) => {
      const date = new Date(d.completed_at || d.started_at || d.date);
      const isCleared = d.status === "completed";
      items.push({
        id: `dungeon-${d.id}`,
        type: "dungeon",
        title: isCleared ? "Dungeon Cleared" : "Dungeon Infiltration",
        subtitle: d.intention ? `Target: "${d.intention}"` : "Sesi Gate Harian",
        details: d.reflection ? `Refleksi: ${d.reflection}` : undefined,
        timestamp: date,
        dateStr: date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        timeStr: date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        tag: isCleared ? "CLEARED" : "STANDBY",
        badge: isCleared ? "Rank Clear" : "Active",
      });
    });

    // 4. Journals
    data.journals.forEach((j) => {
      const date = new Date(j.created_at || j.date || new Date());
      items.push({
        id: `journal-${j.id}`,
        type: "journal",
        title: j.title,
        subtitle: j.body.slice(0, 100) + (j.body.length > 100 ? "..." : ""),
        timestamp: date,
        dateStr: date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        timeStr: date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        tag: j.mood ? `Mood: ${j.mood}` : "Refleksi",
        badge: "+35 EXP",
        exp: 35,
      });
    });

    // Sort descending by timestamp
    items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return items;
  }, [data]);

  const filteredItems = useMemo(() => {
    return unifiedTimeline.filter((item) => {
      const matchesTab = activeTab === "all" || item.type === activeTab;
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.details && item.details.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [unifiedTimeline, activeTab, searchQuery]);

  // Reset to page 1 whenever filter tab or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Pagination calculation
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const paginatedItems = useMemo(() => {
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, startIndex, endIndex]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const panel = document.querySelector(".history-main-panel");
    if (panel) {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getPaginationRange = (current: number, total: number) => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, "...", total];
    }
    if (current >= total - 2) {
      return [1, "...", total - 3, total - 2, total - 1, total];
    }
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  if (isLoading) return <LoadingSpinner />;

  const summary = data?.summary || {
    total_focus_minutes: 0,
    total_completed_quests: 0,
    total_dungeon_clears: 0,
    total_journals: 0,
  };

  const formatHoursMinutes = (totalMins: number) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h === 0) return `${m}m`;
    return `${h}j ${m}m`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "focus":
        return <Timer size={18} className="text-cyan" />;
      case "quest":
        return <CheckCircle2 size={18} className="text-emerald" />;
      case "dungeon":
        return <Swords size={18} className="text-amber" />;
      case "journal":
        return <BookOpenText size={18} className="text-violet" />;
      default:
        return <History size={18} />;
    }
  };

  return (
    <div className="history-page-container">
      {/* Top Metric Strip */}
      <div className="content-grid four-col history-metrics-grid">
        <Metric
          icon={Timer}
          label="Total Fokus"
          value={formatHoursMinutes(summary.total_focus_minutes)}
          detail={`${summary.total_focus_minutes} menit akumulasi`}
        />
        <Metric
          icon={ClipboardList}
          label="Quest Tuntas"
          value={`${summary.total_completed_quests}`}
          detail="Target berhasil ditaklukkan"
        />
        <Metric
          icon={Swords}
          label="Dungeon Cleared"
          value={`${summary.total_dungeon_clears}`}
          detail="Sesi harian terselesaikan"
        />
        <Metric
          icon={BookOpenText}
          label="Catatan Jurnal"
          value={`${summary.total_journals}`}
          detail="Refleksi pertumbuhan diri"
        />
      </div>

      {/* Main Panel: Filter Controls & History List */}
      <section className="panel history-main-panel">
        <div className="history-header-row">
          <PanelTitle icon={History} title="Arsip & Log Aktivitas Lengkap" />
          
          <div className="history-search-box">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              placeholder="Cari aktivitas, judul quest, atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Filter Chips */}
        <div className="history-filter-chips">
          <button
            type="button"
            className={`history-chip ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <span>Semua Aktivitas ({unifiedTimeline.length})</span>
          </button>
          <button
            type="button"
            className={`history-chip ${activeTab === "focus" ? "active" : ""}`}
            onClick={() => setActiveTab("focus")}
          >
            <Timer size={14} />
            <span>Fokus ({data?.focus_sessions.length || 0})</span>
          </button>
          <button
            type="button"
            className={`history-chip ${activeTab === "quest" ? "active" : ""}`}
            onClick={() => setActiveTab("quest")}
          >
            <CheckCircle2 size={14} />
            <span>Quest ({data?.quests.length || 0})</span>
          </button>
          <button
            type="button"
            className={`history-chip ${activeTab === "dungeon" ? "active" : ""}`}
            onClick={() => setActiveTab("dungeon")}
          >
            <Swords size={14} />
            <span>Dungeon ({data?.dungeon_sessions.length || 0})</span>
          </button>
          <button
            type="button"
            className={`history-chip ${activeTab === "journal" ? "active" : ""}`}
            onClick={() => setActiveTab("journal")}
          >
            <BookOpenText size={14} />
            <span>Jurnal ({data?.journals.length || 0})</span>
          </button>
        </div>

        {/* Timeline List (Paginated) */}
        <div className="history-timeline-list">
          {paginatedItems.length > 0 ? (
            paginatedItems.map((item) => (
              <div key={item.id} className={`history-row type-${item.type}`}>
                <div className="history-icon-col">{getTypeIcon(item.type)}</div>

                <div className="history-info-col">
                  <div className="history-title-line">
                    <strong className="history-title">{item.title}</strong>
                    {item.badge && <span className="history-badge">{item.badge}</span>}
                  </div>
                  {item.subtitle && <p className="history-subtitle">{item.subtitle}</p>}
                  {item.details && <p className="history-details-note">{item.details}</p>}
                </div>

                <div className="history-meta-col">
                  <span className="history-date">{item.dateStr}</span>
                  <small className="history-time">{item.timeStr}</small>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-history-state">
              <History size={40} className="text-muted" />
              <p>Tidak ada riwayat yang cocok dengan filter saat ini.</p>
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {totalItems > 0 && (
          <div className="history-pagination-row">
            <div className="history-pagination-info">
              Menampilkan <strong>{totalItems === 0 ? 0 : startIndex + 1} - {endIndex}</strong> dari <strong>{totalItems}</strong> aktivitas
            </div>

            <div className="history-pagination-controls">
              <div className="history-page-size-select">
                <span>Tampilkan:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <button
                type="button"
                className="history-page-btn"
                disabled={safePage <= 1}
                onClick={() => handlePageChange(safePage - 1)}
                title="Halaman Sebelumnya"
                aria-label="Sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>

              {getPaginationRange(safePage, totalPages).map((p, idx) => {
                if (p === "...") {
                  return (
                    <span key={`ellipsis-${idx}`} className="history-page-ellipsis">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={`page-${p}`}
                    type="button"
                    className={`history-page-btn ${safePage === p ? "active" : ""}`}
                    onClick={() => handlePageChange(Number(p))}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                className="history-page-btn"
                disabled={safePage >= totalPages}
                onClick={() => handlePageChange(safePage + 1)}
                title="Halaman Berikutnya"
                aria-label="Berikutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
