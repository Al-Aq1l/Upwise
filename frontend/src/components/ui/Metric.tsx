import React from "react";

type MetricProps = {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  value: string | number;
  detail?: string;
  className?: string;
  variant?: "cyan" | "amber" | "rose" | "purple" | "emerald";
};

export default function Metric({
  icon: Icon,
  label,
  value,
  detail,
  className = "",
  variant = "cyan",
}: MetricProps) {
  return (
    <section className={`metric metric-variant-${variant} ${className}`}>
      <div className="metric-header">
        <Icon size={20} className="metric-icon" />
      </div>
      <div className="metric-info-wrapper">
        <span className="metric-label">{label}</span>
        <strong className="metric-value">{value}</strong>
        {detail && <p className="metric-detail">{detail}</p>}
      </div>
    </section>
  );
}

