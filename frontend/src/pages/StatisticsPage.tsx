import { useState, useMemo } from "react";
import {
  ClipboardList,
  Dumbbell,
  Sparkles,
  Flame,
  BarChart3,
  Target,
  Calendar,
  Zap,
  Info,
  ChevronRight,
  Layers,
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

  const { summary, stats } = data as any;
  const muscleGroups = summary?.muscle_groups || {};
  const totalMuscleCount = Object.values(muscleGroups).reduce((a: number, b: any) => a + Number(b), 0) as number;

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

      {/* 4 Core Gym Summary Metrics */}
      <div className="content-grid statistics-grid">
        <Metric
          icon={ClipboardList}
          label="Quest Latihan Selesai"
          value={`${summary.total_quests_completed}`}
          detail={`Periode ${period === "weekly" ? "7 hari" : "30 hari"}`}
        />
        <Metric
          icon={Dumbbell}
          label="Sesi Gym Cleared"
          value={`${summary.total_workouts || 0} Sesi`}
          detail="Sesi latihan tuntas"
        />
        <Metric
          icon={Sparkles}
          label="EXP Kekuatan"
          value={`+${summary.total_exp}`}
          detail="Total poin progres otot"
        />
        <Metric
          icon={Flame}
          label="Streak Disiplin Gym"
          value={`${summary.current_streak} hari`}
          detail={`Rekor konsistensi: ${summary.longest_streak} hari`}
        />

        {/* Daily EXP Chart */}
        <section className="panel span-2 chart-card-panel">
          <PanelTitle icon={BarChart3} title="Tren EXP & Beban Latihan" />
          {stats.length > 0 ? (
            <MiniChart data={stats} metric="exp" unit="EXP" />
          ) : (
            <p className="muted empty-text">Tidak ada data untuk periode ini.</p>
          )}
        </section>

        {/* Quest Completion Trend Chart */}
        <section className="panel span-2 chart-card-panel">
          <PanelTitle icon={Target} title="Penyelesaian Quest Latihan (%)" />
          {stats.length > 0 ? (
            <MiniChart data={stats} metric="quests" unit="%" />
          ) : (
            <p className="muted empty-text">Tidak ada data untuk periode ini.</p>
          )}
        </section>

        {/* Muscle Groups Breakdown Panel */}
        <section className="panel span-4 muscle-breakdown-panel">
          <PanelTitle icon={Layers} title="Distribusi Kelompok Otot Dilatih" />
          <div className="muscle-bars-grid">
            {[
              { key: "Push", label: "Push (Dada, Bahu, Triceps)", color: "cyan" },
              { key: "Pull", label: "Pull (Punggung, Biceps)", color: "blue" },
              { key: "Legs", label: "Legs (Paha, Betis, Glutes)", color: "rose" },
              { key: "Core", label: "Core & Abs (Perut)", color: "amber" },
              { key: "Cardio", label: "Cardio & Stamina", color: "emerald" },
              { key: "Nutrition", label: "Recovery & Nutrisi", color: "purple" },
            ].map((grp) => {
              const count = Number(muscleGroups[grp.key] || 0);
              const pct = totalMuscleCount > 0 ? Math.round((count / totalMuscleCount) * 100) : 0;
              return (
                <div key={grp.key} className="muscle-bar-item">
                  <div className="muscle-bar-info">
                    <span className="muscle-name">{grp.label}</span>
                    <span className="muscle-count"><strong>{count}</strong> set ({pct}%)</span>
                  </div>
                  <div className="muscle-track">
                    <div
                      className={`muscle-fill fill-${grp.color}`}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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
