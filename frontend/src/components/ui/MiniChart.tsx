import { useState, useRef, useEffect } from "react";

type MiniChartProps = {
  data: {
    label: string;
    date?: string;
    exp?: number;
    quests?: number;
    focus?: number;
    quests_completed?: number;
    quests_total?: number;
  }[];
  metric: "exp" | "quests" | "focus";
  className?: string;
  unit?: string;
};

export default function MiniChart({ data, metric, className = "", unit }: MiniChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const values = data.map((item) => item[metric] ?? 0);
  const max = Math.max(...values, 1);

  const defaultUnit = metric === "exp" ? "EXP" : metric === "quests" ? "%" : "m";
  const displayUnit = unit || defaultUnit;

  // Auto-scroll to end (most recent day) on mount or data change
  useEffect(() => {
    if (scrollRef.current && data.length > 7) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [data.length]);

  const selectedItem = selectedIndex !== null ? data[selectedIndex] : null;

  return (
    <div className={`mini-chart-container ${className}`}>
      {/* Selected Item Detail Banner (Especially valuable on Mobile touch) */}
      {selectedItem ? (
        <div className="mini-chart-tooltip-banner">
          <span className="tooltip-date">{selectedItem.date || selectedItem.label}</span>
          <strong className="tooltip-val">
            {selectedItem[metric] ?? 0} {displayUnit}
          </strong>
          {selectedItem.exp !== undefined && metric !== "exp" && (
            <span className="tooltip-sub">+{selectedItem.exp} EXP</span>
          )}
          {selectedItem.focus !== undefined && metric !== "focus" && (
            <span className="tooltip-sub">{selectedItem.focus}m fokus</span>
          )}
        </div>
      ) : (
        <div className="mini-chart-tooltip-placeholder">
          <small>Ketuk batang grafik untuk melihat detail harian</small>
        </div>
      )}

      <div
        className={`mini-chart-scroll-wrapper ${data.length > 7 ? "has-scroll" : ""}`}
        ref={scrollRef}
      >
        <div
          className="mini-chart-track"
          style={{
            gridTemplateColumns:
              data.length > 7
                ? `repeat(${data.length}, minmax(32px, 1fr))`
                : `repeat(${data.length}, minmax(0, 1fr))`,
          }}
        >
          {data.map((item, index) => {
            const value = item[metric] ?? 0;
            const heightPercent = Math.max((value / max) * 100, 6);
            const isSelected = selectedIndex === index;

            return (
              <div
                key={index}
                className={`mini-chart-bar-container ${isSelected ? "selected" : ""}`}
                onClick={() => setSelectedIndex(index)}
              >
                {/* Numeric label on top of bar */}
                <span className="mini-chart-val-label">
                  {value > 0 ? (value > 999 ? `${Math.round(value / 1000)}k` : value) : ""}
                </span>

                <div className="mini-chart-bar-wrapper">
                  <span
                    className={`bar-fill ${value > 0 ? "has-data" : "zero-data"}`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                <b className="mini-chart-date-label">{item.label}</b>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
