import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const queryKeys = {
  companies: (userId?: string) => ["companies", userId] as const,
  company: (userId?: string, id?: string) => ["companies", userId, id] as const,
  dyes: (userId?: string) => ["dyes", userId] as const,
  dye: (userId?: string, id?: string) => ["dyes", userId, id] as const,
  designs: (userId?: string) => ["designs", userId] as const,
  design: (userId?: string, id?: string) => ["designs", userId, id] as const,
  dashboard: (userId?: string) => ["dashboard", userId] as const,
  searchIndex: (userId?: string) => ["search-index", userId] as const,
};

export function invalidateCatalogQueries(userId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(userId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.searchIndex(userId) });
}
