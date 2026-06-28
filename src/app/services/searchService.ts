import type { Company, Dye } from "../types";
import { listCompanies } from "./companiesService";
import { listDesigns, type DesignWithRelations } from "./designsService";
import { listDyes } from "./dyesService";

export interface SearchIndex {
  designs: DesignWithRelations[];
  companies: Company[];
  dyes: Dye[];
}

export interface SearchResults {
  designs: DesignWithRelations[];
  companies: Company[];
  dyes: Dye[];
}

export async function loadSearchIndex(): Promise<SearchIndex> {
  const [designs, companies, dyes] = await Promise.all([
    listDesigns(),
    listCompanies(),
    listDyes(),
  ]);

  return { designs, companies, dyes };
}

export function searchIndex(index: SearchIndex, query: string): SearchResults {
  const q = query.toLowerCase().trim();
  if (!q) return { designs: [], companies: [], dyes: [] };

  return {
    designs: index.designs.filter(
      (d) =>
        d.designName.toLowerCase().includes(q) ||
        d.designNumber.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        (d.companyName ?? "").toLowerCase().includes(q) ||
        d.dyeName.toLowerCase().includes(q) ||
        d.dyeNumber.toLowerCase().includes(q)
    ),
    companies: index.companies.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.companyNumber.toLowerCase().includes(q) ||
        (c.contactPerson ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q)
    ),
    dyes: index.dyes.filter(
      (d) =>
        d.dyeName.toLowerCase().includes(q) ||
        d.dyeNumber.toLowerCase().includes(q) ||
        (d.description ?? "").toLowerCase().includes(q)
    ),
  };
}
