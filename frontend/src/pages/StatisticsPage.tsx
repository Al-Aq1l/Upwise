import { useState } from "react";
import { ClipboardList, Timer, Sparkles, Flame, BarChart3, Target } from "lucide-react";
import { useStatistics, useHeatmap } from "@/hooks/useStatistics";
import Metric from "@/components/ui/Metric";
import PanelTitle from "@/components/ui/PanelTitle";
import MiniChart from "@/components/ui/MiniChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function StatisticsPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const { data, isLoading } = useStatistics(period);
  const { data: heatmapData, isLoading: isHeatmapLoading } = useHeatmap();

  if (isLoading || isHeatmapLoading) return <LoadingSpinner />;
  if (!data) return <div className="error-panel">Gagal memuat data statistik.</div>;

  const { summary, stats } = data;

  // Render a full 52-week calendar heat grid
  const heatmapSlice = heatmapData?.heatmap ? heatmapData.heatmap.slice(-371) : [];

  return (
    <div className="statistics-page-container">
      <div className="period-filter-row">
        <button
          className={period === "weekly" ? "active secondary" : "secondary"}
          onClick={() => setPeriod("weekly")}
        >
          Weekly
        </button>
        <button
          className={period === "monthly" ? "active secondary" : "secondary"}
          onClick={() => setPeriod("monthly")}
        >
          Monthly
        </button>
      </div>

      <div className="content-grid statistics-grid">
        <Metric
          icon={ClipboardList}
          label="Quest Selesai"
          value={summary.total_quests_completed}
          detail="Total penyelesaian dalam periode ini"
        />
        <Metric
          icon={Timer}
          label="Fokus Total"
          value={`${summary.total_focus_minutes}m`}
          detail="Akumulasi menit fokus"
        />
        <Metric
          icon={Sparkles}
          label="EXP Didapat"
          value={summary.total_exp}
          detail="Akumulasi EXP dalam periode ini"
        />
        <Metric
          icon={Flame}
          label="Longest Streak"
          value={`${summary.longest_streak} hari`}
          detail={`Streak saat ini: ${summary.current_streak} hari`}
        />

        <section className="panel span-2">
          <PanelTitle icon={BarChart3} title="EXP Dari Waktu ke Waktu" />
          {stats.length > 0 ? (
            <MiniChart data={stats} metric="exp" />
          ) : (
            <p className="muted empty-text">Tidak ada data untuk periode ini.</p>
          )}
        </section>

        <section className="panel span-2">
          <PanelTitle icon={Target} title="Quest & Trend Fokus" />
          {stats.length > 0 ? (
            <MiniChart data={stats} metric="quests" />
          ) : (
            <p className="muted empty-text">Tidak ada data untuk periode ini.</p>
          )}
        </section>

        <section className="panel span-4 full-year-heatmap-panel">
          <PanelTitle icon={Flame} title="Full Year Activity Heatmap" />
          <div className="full-year-heatmap-grid">
            {heatmapSlice.map((day, idx) => (
              <span
                key={idx}
                className={`heatmap-cell h${day.intensity}`}
                title={`${day.date}: ${day.exp} EXP`}
              />
            ))}
          </div>
          <div className="heatmap-legend">
            <span>Muted</span>
            <span className="h0" />
            <span className="h1" />
            <span className="h2" />
            <span className="h3" />
            <span className="h4" />
            <span>Active</span>
          </div>
        </section>
      </div>
    </div>
  );
}
