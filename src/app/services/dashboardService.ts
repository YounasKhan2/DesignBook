import { listCompanies } from "./companiesService";
import { listDesigns, type DesignWithRelations } from "./designsService";
import { listDyes } from "./dyesService";

export interface DashboardSummary {
  counts: {
    designs: number;
    companies: number;
    dyes: number;
  };
  recentDesigns: DesignWithRelations[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [designs, companies, dyes] = await Promise.all([
    listDesigns(),
    listCompanies(),
    listDyes(),
  ]);

  return {
    counts: {
      designs: designs.length,
      companies: companies.length,
      dyes: dyes.length,
    },
    recentDesigns: designs.slice(0, 6),
  };
}
