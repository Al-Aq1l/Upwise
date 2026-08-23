type ProgressProps = {
  value: number;
  className?: string;
};

export default function Progress({ value, className = "" }: ProgressProps) {
  const percent = Math.min(100, Math.max(0, value));
  return (
    <div className={`progress ${className}`}>
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}
