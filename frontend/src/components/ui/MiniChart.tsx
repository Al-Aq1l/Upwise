type MiniChartProps = {
  data: { label: string; exp?: number; quests?: number; focus?: number }[];
  metric: "exp" | "quests" | "focus";
  className?: string;
};

export default function MiniChart({ data, metric, className = "" }: MiniChartProps) {
  const max = Math.max(...data.map((item) => item[metric] ?? 0), 1);

  return (
    <div className={`mini-chart ${className}`}>
      {data.map((item, index) => {
        const value = item[metric] ?? 0;
        const heightPercent = (value / max) * 100;
        return (
          <div key={index} className="mini-chart-bar-container">
            <div className="mini-chart-bar-wrapper">
              <span
                style={{ height: `${heightPercent}%` }}
                title={`${value} ${metric}`}
              />
            </div>
            <b>{item.label}</b>
          </div>
        );
      })}
    </div>
  );
}
