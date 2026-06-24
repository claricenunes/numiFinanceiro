import { createClient } from "@/lib/supabase/server";
import type { GoalWithProgress } from "@/types/app";
import type { Goal, GoalContribution } from "@/types/database";

export async function getGoals(): Promise<GoalWithProgress[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const results = await Promise.all([
    supabase.from("goals").select("*").eq("user_id", user.id).is("deleted_at", null).order("created_at"),
    supabase.from("goal_contributions").select("*").eq("user_id", user.id).is("deleted_at", null),
  ]);

  const goals   = (results[0].data as Goal[] | null) ?? [];
  const contribs = (results[1].data as GoalContribution[] | null) ?? [];

  const sumByGoal = new Map<string, number>();
  for (const c of contribs) sumByGoal.set(c.goal_id, (sumByGoal.get(c.goal_id) ?? 0) + +c.amount);

  const today = new Date();

  return goals.map((g) => {
    const current  = sumByGoal.get(g.id) ?? 0;
    const target   = +g.target_amount;
    const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    const deadline = g.deadline ? new Date(g.deadline + "T12:00:00") : null;
    const daysRemaining = deadline
      ? Math.max(0, Math.ceil((deadline.getTime() - today.getTime()) / 86400000))
      : null;
    const remaining     = Math.max(target - current, 0);
    const monthsLeft    = daysRemaining ? daysRemaining / 30 : null;
    const monthlyNeeded = monthsLeft && monthsLeft > 0 && remaining > 0
      ? Math.ceil(remaining / monthsLeft)
      : null;

    return {
      id: g.id, name: g.name, icon: g.icon,
      targetAmount: target, currentAmount: current, progressPercent: progress,
      deadline: g.deadline, daysRemaining, monthlyNeeded,
      status: g.status, isOnTrack: monthlyNeeded === null || monthlyNeeded <= 0,
    };
  });
}
