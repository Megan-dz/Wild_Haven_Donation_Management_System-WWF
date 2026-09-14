import { useCallback, useMemo } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import type {
  AdoptionApplication,
  AdoptionDashboard,
  CommandCenterData,
  CommandCenterFilters,
  DonationAnalytics,
  InventoryDashboard,
  InventoryItem,
  MedicalItem,
  RescueCase,
  RescueDashboard,
  VolunteerWorkload,
} from "../types";

const request = <T,>(path: string) => customFetch<T>(path);

const buildRescueQuery = (filters: CommandCenterFilters) => {
  const query = new URLSearchParams({ limit: "100", sort: "reportedAt" });
  if (filters.from) query.set("fromDate", filters.from);
  if (filters.to) query.set("toDate", `${filters.to}T23:59:59.999Z`);
  if (filters.rescueStatus !== "all") query.set("status", filters.rescueStatus);
  if (filters.priority !== "all") query.set("priority", filters.priority);
  return query.toString();
};

const buildMedicalQuery = (filters: CommandCenterFilters) => {
  const query = new URLSearchParams();
  if (filters.priority !== "all") query.set("priority", filters.priority);
  return query.toString();
};

const buildDonationQuery = (filters: CommandCenterFilters) => {
  const query = new URLSearchParams();
  if (filters.from) query.set("from", filters.from);
  if (filters.to) query.set("to", `${filters.to}T23:59:59.999Z`);
  return query.toString();
};

export function useCommandCenter(filters: CommandCenterFilters) {
  const queryClient = useQueryClient();
  const rescueQuery = useMemo(() => buildRescueQuery(filters), [filters]);
  const medicalQuery = useMemo(() => buildMedicalQuery(filters), [filters]);
  const donationQuery = useMemo(() => buildDonationQuery(filters), [filters]);
  const queries = useQueries({
    queries: [
      { queryKey: ["command-center", "rescue-dashboard"], queryFn: () => request<RescueDashboard>("/api/rescue-dashboard") },
      { queryKey: ["command-center", "rescue-cases", rescueQuery], queryFn: () => request<RescueCase[]>(`/api/rescue-cases?${rescueQuery}`) },
      { queryKey: ["command-center", "medical", medicalQuery], queryFn: () => request<MedicalItem[]>(`/api/medical-records${medicalQuery ? `?${medicalQuery}` : ""}`) },
      { queryKey: ["command-center", "adoption-dashboard"], queryFn: () => request<AdoptionDashboard>("/api/adoption-dashboard") },
      { queryKey: ["command-center", "adoptions"], queryFn: () => request<AdoptionApplication[]>("/api/adoptions?limit=100") },
      { queryKey: ["command-center", "volunteers"], queryFn: () => request<VolunteerWorkload[]>("/api/rescue-volunteers") },
      { queryKey: ["command-center", "inventory-dashboard"], queryFn: () => request<InventoryDashboard>("/api/inventory/dashboard") },
      { queryKey: ["command-center", "inventory"], queryFn: () => request<InventoryItem[]>("/api/inventory") },
      { queryKey: ["command-center", "donation-analytics", donationQuery], queryFn: () => request<DonationAnalytics>(`/api/donation-analytics${donationQuery ? `?${donationQuery}` : ""}`) },
    ],
  });
  const [rescueDashboard, rescueCases, medical, adoptionDashboard, adoptions, volunteers, inventoryDashboard, inventory, donations] = queries;

  const data = useMemo<CommandCenterData | undefined>(() => {
    if (!rescueDashboard.data || !rescueCases.data || !medical.data || !adoptionDashboard.data || !adoptions.data || !volunteers.data || !inventoryDashboard.data || !inventory.data || !donations.data) return undefined;
    return {
      rescueDashboard: rescueDashboard.data,
      rescueCases: rescueCases.data,
      medicalItems: medical.data,
      adoptionDashboard: adoptionDashboard.data,
      adoptionApplications: adoptions.data,
      volunteers: volunteers.data,
      inventoryDashboard: inventoryDashboard.data,
      inventoryItems: inventory.data,
      donationAnalytics: donations.data,
    };
  }, [rescueDashboard.data, rescueCases.data, medical.data, adoptionDashboard.data, adoptions.data, volunteers.data, inventoryDashboard.data, inventory.data, donations.data]);

  const refresh = useCallback(() => queryClient.refetchQueries({ queryKey: ["command-center"] }), [queryClient]);
  return {
    data,
    isLoading: queries.some((query) => query.isLoading),
    isFetching: queries.some((query) => query.isFetching),
    isError: queries.some((query) => query.isError),
    refresh,
  };
}
