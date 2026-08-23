/**
 * Client-side gamification utilities (for display only — real calc is on backend).
 */

export function levelFromExp(exp: number, multiplier = 120): number {
  return Math.floor(Math.sqrt(exp / multiplier)) + 1;
}

export function expForLevel(level: number, multiplier = 120): number {
  return level * level * multiplier;
}

export function levelProgress(exp: number, multiplier = 120) {
  const level = levelFromExp(exp, multiplier);
  const current = expForLevel(level - 1, multiplier);
  const next = expForLevel(level, multiplier);
  const progress = next > current ? Math.round(((exp - current) / (next - current)) * 100) : 0;
  return { level, current, next, progress: Math.min(100, Math.max(0, progress)) };
}

export function rankLabel(rank: string): string {
  const labels: Record<string, string> = {
    S: "S-Rank",
    A: "A-Rank",
    B: "B-Rank",
    C: "C-Rank",
    D: "D-Rank",
    E: "E-Rank",
  };
  return labels[rank] || `${rank}-Rank`;
}
