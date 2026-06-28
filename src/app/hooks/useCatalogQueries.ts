import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCompany,
  deleteCompany,
  getCompanyById,
  listCompanies,
  updateCompany,
  type CompanyInput,
} from "../services/companiesService";
import {
  createDye,
  deleteDye,
  getDyeById,
  listDyes,
  updateDye,
  type DyeInput,
} from "../services/dyesService";
import {
  createDesign,
  deleteDesign,
  getDesignById,
  listDesigns,
  updateDesign,
  type DesignInput,
} from "../services/designsService";
import { getDashboardSummary } from "../services/dashboardService";
import { loadSearchIndex } from "../services/searchService";
import { queryKeys } from "../lib/queryClient";
import { useAuth } from "./useAuth";

function useCurrentUserId() {
  return useAuth().user?.id;
}

function useCatalogInvalidation() {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();

  return {
    invalidateCompanies: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.searchIndex(userId) });
    },
    invalidateDyes: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dyes(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.searchIndex(userId) });
    },
    invalidateDesigns: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.designs(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.searchIndex(userId) });
    },
    invalidateCompany: (id?: string) => queryClient.invalidateQueries({ queryKey: queryKeys.company(userId, id) }),
    invalidateDye: (id?: string) => queryClient.invalidateQueries({ queryKey: queryKeys.dye(userId, id) }),
    invalidateDesign: (id?: string) => queryClient.invalidateQueries({ queryKey: queryKeys.design(userId, id) }),
  };
}

export function useCompanies() {
  const userId = useCurrentUserId();
  return useQuery({
    queryKey: queryKeys.companies(userId),
    queryFn: listCompanies,
    enabled: Boolean(userId),
  });
}

export function useCompany(id?: string) {
  const userId = useCurrentUserId();
  return useQuery({
    queryKey: queryKeys.company(userId, id),
    queryFn: () => getCompanyById(id ?? ""),
    enabled: Boolean(userId && id),
  });
}

export function useCreateCompany() {
  const invalidation = useCatalogInvalidation();
  return useMutation({
    mutationFn: (input: CompanyInput) => createCompany(input),
    onSuccess: () => invalidation.invalidateCompanies(),
  });
}

export function useUpdateCompany() {
  const invalidation = useCatalogInvalidation();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CompanyInput }) => updateCompany(id, input),
    onSuccess: (_data, variables) => {
      invalidation.invalidateCompany(variables.id);
      invalidation.invalidateCompanies();
    },
  });
}

export function useDeleteCompany() {
  const invalidation = useCatalogInvalidation();
  return useMutation({
    mutationFn: (id: string) => deleteCompany(id),
    onSuccess: (_data, id) => {
      invalidation.invalidateCompany(id);
      invalidation.invalidateCompanies();
    },
  });
}

export function useDyes() {
  const userId = useCurrentUserId();
  return useQuery({
    queryKey: queryKeys.dyes(userId),
    queryFn: listDyes,
    enabled: Boolean(userId),
  });
}

export function useDye(id?: string) {
  const userId = useCurrentUserId();
  return useQuery({
    queryKey: queryKeys.dye(userId, id),
    queryFn: () => getDyeById(id ?? ""),
    enabled: Boolean(userId && id),
  });
}

export function useCreateDye() {
  const invalidation = useCatalogInvalidation();
  return useMutation({
    mutationFn: ({ input, images }: { input: DyeInput; images: string[] }) => createDye(input, images),
    onSuccess: () => invalidation.invalidateDyes(),
  });
}

export function useUpdateDye() {
  const invalidation = useCatalogInvalidation();
  return useMutation({
    mutationFn: ({ id, input, images }: { id: string; input: DyeInput; images: string[] }) =>
      updateDye(id, input, images),
    onSuccess: (_data, variables) => {
      invalidation.invalidateDye(variables.id);
      invalidation.invalidateDyes();
    },
  });
}

export function useDeleteDye() {
  const invalidation = useCatalogInvalidation();
  return useMutation({
    mutationFn: (id: string) => deleteDye(id),
    onSuccess: (_data, id) => {
      invalidation.invalidateDye(id);
      invalidation.invalidateDyes();
    },
  });
}

export function useDesigns() {
  const userId = useCurrentUserId();
  return useQuery({
    queryKey: queryKeys.designs(userId),
    queryFn: listDesigns,
    enabled: Boolean(userId),
  });
}

export function useDesign(id?: string) {
  const userId = useCurrentUserId();
  return useQuery({
    queryKey: queryKeys.design(userId, id),
    queryFn: () => getDesignById(id ?? ""),
    enabled: Boolean(userId && id),
  });
}

export function useCreateDesign() {
  const invalidation = useCatalogInvalidation();
  return useMutation({
    mutationFn: ({ input, images }: { input: DesignInput; images: string[] }) => createDesign(input, images),
    onSuccess: () => invalidation.invalidateDesigns(),
  });
}

export function useUpdateDesign() {
  const invalidation = useCatalogInvalidation();
  return useMutation({
    mutationFn: ({ id, input, images }: { id: string; input: DesignInput; images: string[] }) =>
      updateDesign(id, input, images),
    onSuccess: (_data, variables) => {
      invalidation.invalidateDesign(variables.id);
      invalidation.invalidateDesigns();
    },
  });
}

export function useDeleteDesign() {
  const invalidation = useCatalogInvalidation();
  return useMutation({
    mutationFn: (id: string) => deleteDesign(id),
    onSuccess: (_data, id) => {
      invalidation.invalidateDesign(id);
      invalidation.invalidateDesigns();
    },
  });
}

export function useDashboardSummary() {
  const userId = useCurrentUserId();
  return useQuery({
    queryKey: queryKeys.dashboard(userId),
    queryFn: getDashboardSummary,
    enabled: Boolean(userId),
  });
}

export function useSearchIndex() {
  const userId = useCurrentUserId();
  return useQuery({
    queryKey: queryKeys.searchIndex(userId),
    queryFn: loadSearchIndex,
    enabled: Boolean(userId),
  });
}
