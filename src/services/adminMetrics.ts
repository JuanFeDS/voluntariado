import type { RequestStatus } from "@/types";
import { supabase } from "@/services/supabaseClient";

export interface AdminMetrics {
  sheetPointsCount: number;
  lastSheetSync: string | null;
  foundationCounts: Record<RequestStatus, number>;
  victimCounts: Record<RequestStatus, number>;
}

async function countByStatus(table: "foundation_requests" | "victim_requests"): Promise<Record<RequestStatus, number>> {
  const statuses: RequestStatus[] = ["pendiente", "aprobado", "rechazado"];
  const counts = await Promise.all(
    statuses.map(async (status) => {
      const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true }).eq("status", status);
      if (error) throw error;
      return [status, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(counts) as Record<RequestStatus, number>;
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const [sheetPointsResult, lastSyncResult, foundationCounts, victimCounts] = await Promise.all([
    supabase.from("sheet_points").select("*", { count: "exact", head: true }),
    supabase.from("sheet_points").select("synced_at").order("synced_at", { ascending: false }).limit(1).maybeSingle(),
    countByStatus("foundation_requests"),
    countByStatus("victim_requests"),
  ]);

  if (sheetPointsResult.error) throw sheetPointsResult.error;
  if (lastSyncResult.error) throw lastSyncResult.error;

  return {
    sheetPointsCount: sheetPointsResult.count ?? 0,
    lastSheetSync: lastSyncResult.data?.synced_at ?? null,
    foundationCounts,
    victimCounts,
  };
}
