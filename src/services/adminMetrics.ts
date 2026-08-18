import type { RequestStatus } from "@/types";
import { supabase } from "@/services/supabaseClient";

export interface AdminMetrics {
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
  const [foundationCounts, victimCounts] = await Promise.all([
    countByStatus("foundation_requests"),
    countByStatus("victim_requests"),
  ]);

  return { foundationCounts, victimCounts };
}
