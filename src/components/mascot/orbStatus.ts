export type OrbStatus = "good" | "warning" | "alert";

export function getOrbStatus(savingsRate: number): OrbStatus {
  if (savingsRate >= 20) return "good";
  if (savingsRate >= 10) return "warning";
  return "alert";
}
