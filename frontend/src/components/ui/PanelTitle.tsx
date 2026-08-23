import React from "react";

type PanelTitleProps = {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
};

export default function PanelTitle({ icon: Icon, title }: PanelTitleProps) {
  return (
    <div className="panel-title">
      <Icon size={19} className="panel-title-icon" />
      <h2>{title}</h2>
    </div>
  );
}
