import { supabase } from "@/lib/supabaseClient";

export type NotifType = "message" | "status_update" | "booking" | "system";

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  read: boolean;
  timestamp: string;
  href?: string;
  userType: "retailer" | "landlord";
}

const STORAGE_KEY = "ptg_notifications_v2";
const USER_ID_KEY = "ptg_user_id";

// ─── Field mapping helpers ────────────────────────────────────────────────────

interface DbNotification {
  id: string;
  user_id: string | null;
  user_role: "retailer" | "landlord";
  type: NotifType;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  created_at: string;
}

function dbToLocal(row: DbNotification): Notification {
  return {
    id:        row.id,
    type:      row.type,
    title:     row.title,
    body:      row.body,
    read:      row.read,
    timestamp: row.created_at,
    href:      row.href ?? undefined,
    userType:  row.user_role,
  };
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

function readCache(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Notification[];
  } catch {
    return [];
  }
}

function writeCache(items: Notification[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function currentUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY);
}

// ─── Public sync API ──────────────────────────────────────────────────────────

export function getNotifications(userType: "retailer" | "landlord"): Notification[] {
  const all = readCache();
  return all
    .filter(n => n.userType === userType)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function markRead(id: string): void {
  if (typeof window === "undefined") return;

  // Sync update to localStorage
  const all = readCache();
  writeCache(all.map(n => (n.id === id ? { ...n, read: true } : n)));

  // Fire-and-forget DB update
  const userId = currentUserId();
  if (!userId) return;
  supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", userId)
    .then(() => {/* ignore */});
}

export function markAllRead(userType: "retailer" | "landlord"): void {
  if (typeof window === "undefined") return;

  // Sync update to localStorage
  const all = readCache();
  writeCache(all.map(n => (n.userType === userType ? { ...n, read: true } : n)));

  // Fire-and-forget DB update
  const userId = currentUserId();
  if (!userId) return;
  supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("user_role", userType)
    .eq("read", false)
    .then(() => {/* ignore */});
}

export function addNotification(n: Omit<Notification, "id" | "read">): void {
  if (typeof window === "undefined") return;

  // Generate a UUID client-side so both localStorage and DB share the same id
  const id = crypto.randomUUID();
  const newN: Notification = { ...n, id, read: false };

  // Sync write to localStorage for instant UI update
  const all = readCache();
  writeCache([newN, ...all]);

  // Fire-and-forget DB insert
  const userId = currentUserId();
  if (!userId) return;
  supabase
    .from("notifications")
    .insert({
      id,
      user_id:   userId,
      user_role: n.userType,
      type:      n.type,
      title:     n.title,
      body:      n.body,
      href:      n.href ?? null,
      read:      false,
      created_at: n.timestamp,
    })
    .then(() => {/* ignore */});
}

// ─── Async fetch from DB (source of truth) ────────────────────────────────────

export async function getNotificationsAsync(
  userType: "retailer" | "landlord"
): Promise<Notification[]> {
  if (typeof window === "undefined") return [];

  const userId = currentUserId();
  if (!userId) {
    // No user — fall back to whatever is cached
    return getNotifications(userType);
  }

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("user_role", userType)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return getNotifications(userType);
    }

    const rows = (data as DbNotification[]).map(dbToLocal);

    // Overwrite cache with authoritative DB data (clears any stale seed data)
    const otherUserType = userType === "retailer" ? "landlord" : "retailer";
    const otherItems = readCache().filter(n => n.userType === otherUserType);
    writeCache([...rows, ...otherItems]);

    return rows.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch {
    return getNotifications(userType);
  }
}

// ─── timeAgo — kept exactly as-is ────────────────────────────────────────────

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
}
