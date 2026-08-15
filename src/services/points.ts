import type { HelpPoint, VolunteerFilter } from "@/types";
import { fetchSheetPoints } from "@/services/sheetPoints";
import { fetchFoundationRequests } from "@/services/foundationRequests";

export async function loadHelpPoints(): Promise<HelpPoint[]> {
  const [sheetPoints, foundationPoints] = await Promise.all([fetchSheetPoints(), fetchFoundationRequests()]);
  return [...sheetPoints, ...foundationPoints];
}

export function filterPoints(points: HelpPoint[], filter: VolunteerFilter): HelpPoint[] {
  if (filter === "todos") return points;

  const status = (point: HelpPoint): string => point.seNecesitanVoluntarios.trim().toUpperCase();

  if (filter === "necesitan") {
    return points.filter((point) => status(point) === "SI");
  }
  return points.filter((point) => status(point).startsWith("REVISANDO"));
}
