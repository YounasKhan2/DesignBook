import React, { createContext, useContext, useState } from "react";
import type { Company, Design, Dye } from "../types";
import { MOCK_COMPANIES, MOCK_DESIGNS, MOCK_DYES } from "../data/mockData";

interface StoreContextType {
  designs: Design[];
  companies: Company[];
  dyes: Dye[];
  addDesign: (d: Omit<Design, "id" | "createdAt" | "updatedAt">) => string;
  updateDesign: (id: string, d: Partial<Design>) => void;
  deleteDesign: (id: string) => void;
  addCompany: (c: Omit<Company, "id" | "createdAt" | "updatedAt">) => string;
  updateCompany: (id: string, c: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  addDye: (d: Omit<Dye, "id" | "createdAt" | "updatedAt">) => string;
  updateDye: (id: string, d: Partial<Dye>) => void;
  deleteDye: (id: string) => void;
  getCompanyById: (id: string) => Company | undefined;
  getDyeById: (id: string) => Dye | undefined;
  getDesignById: (id: string) => Design | undefined;
  getDesignsByCompany: (companyId: string) => Design[];
  getDesignsByDye: (dyeId: string) => Design[];
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [designs, setDesigns] = useState<Design[]>(MOCK_DESIGNS);
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [dyes, setDyes] = useState<Dye[]>(MOCK_DYES);

  const now = () => new Date().toISOString().split("T")[0];

  const addDesign = (d: Omit<Design, "id" | "createdAt" | "updatedAt">) => {
    const id = crypto.randomUUID();
    setDesigns((prev) => [
      { ...d, id, createdAt: now(), updatedAt: now() },
      ...prev,
    ]);
    return id;
  };

  const updateDesign = (id: string, d: Partial<Design>) => {
    setDesigns((prev) =>
      prev.map((x) => (x.id === id ? { ...x, ...d, updatedAt: now() } : x))
    );
  };

  const deleteDesign = (id: string) => {
    setDesigns((prev) => prev.filter((x) => x.id !== id));
  };

  const addCompany = (c: Omit<Company, "id" | "createdAt" | "updatedAt">) => {
    const id = crypto.randomUUID();
    setCompanies((prev) => [
      { ...c, id, createdAt: now(), updatedAt: now() },
      ...prev,
    ]);
    return id;
  };

  const updateCompany = (id: string, c: Partial<Company>) => {
    setCompanies((prev) =>
      prev.map((x) => (x.id === id ? { ...x, ...c, updatedAt: now() } : x))
    );
  };

  const deleteCompany = (id: string) => {
    setCompanies((prev) => prev.filter((x) => x.id !== id));
  };

  const addDye = (d: Omit<Dye, "id" | "createdAt" | "updatedAt">) => {
    const id = crypto.randomUUID();
    setDyes((prev) => [
      { ...d, id, createdAt: now(), updatedAt: now() },
      ...prev,
    ]);
    return id;
  };

  const updateDye = (id: string, d: Partial<Dye>) => {
    setDyes((prev) =>
      prev.map((x) => (x.id === id ? { ...x, ...d, updatedAt: now() } : x))
    );
  };

  const deleteDye = (id: string) => {
    setDyes((prev) => prev.filter((x) => x.id !== id));
  };

  const getCompanyById = (id: string) => companies.find((c) => c.id === id);
  const getDyeById = (id: string) => dyes.find((d) => d.id === id);
  const getDesignById = (id: string) => designs.find((d) => d.id === id);
  const getDesignsByCompany = (companyId: string) =>
    designs.filter((d) => d.companyId === companyId);
  const getDesignsByDye = (dyeId: string) =>
    designs.filter((d) => d.dyeId === dyeId);

  return (
    <StoreContext.Provider
      value={{
        designs,
        companies,
        dyes,
        addDesign,
        updateDesign,
        deleteDesign,
        addCompany,
        updateCompany,
        deleteCompany,
        addDye,
        updateDye,
        deleteDye,
        getCompanyById,
        getDyeById,
        getDesignById,
        getDesignsByCompany,
        getDesignsByDye,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
