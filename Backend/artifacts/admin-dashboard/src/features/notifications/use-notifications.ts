import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import type {
  AdoptionNotificationRecord,
  DonationAnalytics,
  InventoryNotificationRecord,
  MedicalNotificationRecord,
  NotificationPreferences,
  NotificationSourceData,
  Notification,
  RescueNotificationRecord,
  StaffProfile,
  SystemActivity,
  VolunteerNotificationRecord,
} from "./notification-types";
import { defaultNotificationPreferences, deriveNotifications } from "./notification-utils";

const fetcher = <T,>(path: string) => customFetch<T>(path);
const storageKey = (staffId: string, name: "read" | "preferences") => `wild-haven:notifications:${name}:${staffId}`;
const readStorage = (key: string) => {
  try { const value = window.localStorage.getItem(key); return value ? JSON.parse(value) : undefined; } catch { return undefined; }
};
const writeStorage = (key: string, value: unknown) => { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage is optional; the active session still works. */ } };

function useNotificationData() {
  const queryClient = useQueryClient();
  const queries = useQueries({ queries: [
    { queryKey: ["notifications", "staff"], queryFn: () => fetcher<StaffProfile>("/api/auth/me") },
    { queryKey: ["notifications", "activity"], queryFn: () => fetcher<SystemActivity[]>("/api/activity?limit=50") },
    { queryKey: ["notifications", "rescue-cases"], queryFn: () => fetcher<RescueNotificationRecord[]>("/api/rescue-cases?limit=100&sort=reportedAt") },
    { queryKey: ["notifications", "medical"], queryFn: () => fetcher<MedicalNotificationRecord[]>("/api/medical-records") },
    { queryKey: ["notifications", "adoptions"], queryFn: () => fetcher<AdoptionNotificationRecord[]>("/api/adoptions?limit=100") },
    { queryKey: ["notifications", "volunteers"], queryFn: () => fetcher<VolunteerNotificationRecord[]>("/api/rescue-volunteers") },
    { queryKey: ["notifications", "inventory"], queryFn: () => fetcher<InventoryNotificationRecord[]>("/api/inventory") },
    { queryKey: ["notifications", "donations"], queryFn: () => fetcher<DonationAnalytics>("/api/donation-analytics") },
  ] });
  const [staff, activity, rescueCases, medicalRecords, adoptions, volunteers, inventory, donations] = queries;
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences);
  const [hydratedFor, setHydratedFor] = useState<string>();
  const staffId = staff.data?.id;

  useEffect(() => {
    if (!staffId || hydratedFor === staffId) return;
    const storedRead = readStorage(storageKey(staffId, "read"));
    const storedPreferences = readStorage(storageKey(staffId, "preferences"));
    setReadIds(new Set(Array.isArray(storedRead) ? storedRead.filter((item): item is string => typeof item === "string") : []));
    setPreferences(storedPreferences && typeof storedPreferences === "object" ? { ...defaultNotificationPreferences, ...storedPreferences, categories: { ...defaultNotificationPreferences.categories, ...(storedPreferences as NotificationPreferences).categories } } : defaultNotificationPreferences);
    setHydratedFor(staffId);
  }, [staffId, hydratedFor]);

  useEffect(() => { if (staffId && hydratedFor === staffId) writeStorage(storageKey(staffId, "read"), [...readIds]); }, [staffId, hydratedFor, readIds]);
  useEffect(() => { if (staffId && hydratedFor === staffId) writeStorage(storageKey(staffId, "preferences"), preferences); }, [staffId, hydratedFor, preferences]);

  const source = useMemo<NotificationSourceData | undefined>(() => {
    if (!activity.data || !rescueCases.data || !medicalRecords.data || !adoptions.data || !volunteers.data || !inventory.data || !donations.data) return undefined;
    return { systemActivity: activity.data, rescueCases: rescueCases.data, medicalRecords: medicalRecords.data, adoptions: adoptions.data, volunteers: volunteers.data, inventory: inventory.data, donations: donations.data };
  }, [activity.data, rescueCases.data, medicalRecords.data, adoptions.data, volunteers.data, inventory.data, donations.data]);
  const notifications = useMemo(() => source ? deriveNotifications(source) : [], [source]);
  const markAsRead = useCallback((id: string) => setReadIds((current) => new Set(current).add(id)), []);
  const markAsUnread = useCallback((id: string) => setReadIds((current) => { const next = new Set(current); next.delete(id); return next; }), []);
  const markAllAsRead = useCallback((ids: string[]) => setReadIds((current) => new Set([...current, ...ids])), []);
  const updatePreferences = useCallback((next: Partial<NotificationPreferences>) => setPreferences((current) => ({ ...current, ...next, categories: next.categories ? { ...current.categories, ...next.categories } : current.categories })), []);
  const refresh = useCallback(() => queryClient.refetchQueries({ queryKey: ["notifications"] }), [queryClient]);
  return { staff: staff.data, notifications, preferences, readIds, isLoading: queries.some((query) => query.isLoading), isFetching: queries.some((query) => query.isFetching), isError: queries.some((query) => query.isError), markAsRead, markAsUnread, markAllAsRead, updatePreferences, refresh };
}

type NotificationsContextValue = Omit<ReturnType<typeof useNotificationData>, "notifications"> & { notifications: Notification[] };

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const value = useNotificationData();
  return createElement(NotificationsContext.Provider, { value }, children);
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used within NotificationsProvider");
  return context;
}
