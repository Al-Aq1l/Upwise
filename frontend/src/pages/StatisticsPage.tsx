import { useState, useMemo } from "react";
import {
  ClipboardList,
  Timer,
  Sparkles,
  Flame,
  BarChart3,
  Target,
  Calendar,
  Zap,
  Info,
  ChevronRight,
} from "lucide-react";
import { useStatistics, useHeatmap, HeatmapItem } from "@/hooks/useStatistics";
import Metric from "@/components/ui/Metric";
import PanelTitle from "@/components/ui/PanelTitle";
import MiniChart from "@/components/ui/MiniChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function StatisticsPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const { data, isLoading, isError } = useStatistics(period);
  const { data: heatmapData, isLoading: isHeatmapLoading } = useHeatmap();
  const [selectedDay, setSelectedDay] = useState<HeatmapItem | null>(null);

  const heatmapList = useMemo(() => {
    return heatmapData?.heatmap || [];
  }, [heatmapData]);

  const heatmapStats = useMemo(() => {
    if (!heatmapList.length) return { activeDays: 0, maxExp: 0 };
    let active = 0;
    let max = 0;
    heatmapList.forEach((d) => {
      if (d.exp > 0) active++;
      if (d.exp > max) max = d.exp;
    });
    return { activeDays: active, maxExp: max };
  }, [heatmapList]);

  if (isLoading || isHeatmapLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !data) {
    return (
      <div className="error-panel">
        Gagal memuat statistik. Silakan refresh halaman atau coba sesaat lagi.
      </div>
    );
  }

  const { summary, stats } = data;

  const formatHoursMinutes = (totalMins: number) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h === 0) return `${m}m`;
    return `${h}j ${m}m`;
  };

  return (
    <div className="statistics-page-container">
      {/* Period Filter Toggle Bar */}
      <div className="period-filter-row">
        <button
          type="button"
          className={period === "weekly" ? "active secondary" : "secondary"}
          onClick={() => setPeriod("weekly")}
        >
          <Calendar size={15} />
          <span>Mingguan (7 Hari)</span>
        </button>
        <button
          type="button"
          className={period === "monthly" ? "active secondary" : "secondary"}
          onClick={() => setPeriod("monthly")}
        >
          <BarChart3 size={15} />
          <span>Bulanan (30 Hari)</span>
        </button>
      </div>

      {/* 4 Core Summary Metrics */}
      <div className="content-grid statistics-grid">
        <Metric
          icon={ClipboardList}
          label="Quest Selesai"
          value={`${summary.total_quests_completed}`}
          detail={`Periode ${period === "weekly" ? "7 hari" : "30 hari"}`}
        />
        <Metric
          icon={Timer}
          label="Fokus Total"
          value={formatHoursMinutes(summary.total_focus_minutes)}
          detail={`${summary.total_focus_minutes} menit akumulasi`}
        />
        <Metric
          icon={Sparkles}
          label="EXP Didapat"
          value={`+${summary.total_exp}`}
          detail="Total poin capaian"
        />
        <Metric
          icon={Flame}
          label="Streak Disiplin"
          value={`${summary.current_streak} hari`}
          detail={`Rekor terpanjang: ${summary.longest_streak} hari`}
        />

        {/* Daily EXP Chart */}
        <section className="panel span-2 chart-card-panel">
          <PanelTitle icon={BarChart3} title="Tren EXP Harian" />
          {stats.length > 0 ? (
            <MiniChart data={stats} metric="exp" unit="EXP" />
          ) : (
            <p className="muted empty-text">Tidak ada data untuk periode ini.</p>
          )}
        </section>

        {/* Focus & Quest Chart */}
        <section className="panel span-2 chart-card-panel">
          <PanelTitle icon={Target} title="Menit Fokus Harian" />
          {stats.length > 0 ? (
            <MiniChart data={stats} metric="focus" unit="menit" />
          ) : (
            <p className="muted empty-text">Tidak ada data untuk periode ini.</p>
          )}
        </section>

        {/* Full Year 365-Day Activity Heatmap */}
        <section className="panel span-4 full-year-heatmap-panel">
          <div className="heatmap-header-flex">
            <PanelTitle icon={Flame} title="Heatmap Aktivitas 365 Hari" />
            
            <div className="heatmap-quick-summary">
              <span className="summary-pill">
                <strong>{heatmapStats.activeDays}</strong> Hari Aktif
              </span>
              <span className="summary-pill">
                Max <strong>{heatmapStats.maxExp}</strong> EXP/hari
              </span>
            </div>
          </div>

          {/* Interactive Day Inspector (Especially helpful on Mobile) */}
          {selectedDay ? (
            <div className="heatmap-selected-inspector">
              <Info size={16} className="text-cyan" />
              <div className="inspector-text">
                <strong>
                  {new Date(selectedDay.date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
                <span>
                  {selectedDay.exp > 0
                    ? `Capaian: +${selectedDay.exp} EXP (Intensitas Level ${selectedDay.intensity})`
                    : "Tidak ada aktivitas tercatat pada tanggal ini."}
                </span>
              </div>
            </div>
          ) : (
            <p className="heatmap-hint-text">
              Sentuh kotak tanggal pada heatmap di bawah untuk melihat detail aktivitas harian:
            </p>
          )}

          {/* Scrollable Heatmap Grid */}
          <div className="heatmap-scroll-container">
            <div className="full-year-heatmap-grid">
              {heatmapList.map((day, idx) => {
                const isSelected = selectedDay?.date === day.date;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`heatmap-cell h${day.intensity} ${isSelected ? "selected-cell" : ""}`}
                    onClick={() => setSelectedDay(day)}
                    title={`${day.date}: ${day.exp} EXP`}
                    aria-label={`${day.date}: ${day.exp} EXP`}
                  />
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="heatmap-legend">
            <span>Kurang Aktif</span>
            <span className="legend-box h0" />
            <span className="legend-box h1" />
            <span className="legend-box h2" />
            <span className="legend-box h3" />
            <span className="legend-box h4" />
            <span>Sangat Aktif</span>
          </div>
        </section>
      </div>
    </div>
  );
}
