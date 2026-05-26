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

const SEED: Notification[] = [
  // ── Retailer ──────────────────────────────────────────────────────────────
  {
    id: "r-001", type: "status_update", userType: "retailer", read: false,
    title: "Application Approved",
    body: "Your application PTG-APP-2025-8821 for PTG Rama IX — Unit A-02 has been approved by the landlord.",
    href: "/retailer_backoffice/myApplicationsPage",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "r-002", type: "message", userType: "retailer", read: false,
    title: "New message from Kanya S.",
    body: "Hi! Your application looks great. I've confirmed a walkthrough slot for you this Thursday at 14:00.",
    href: "/retailer_backoffice/scheduleBookingPage?appId=PTG-APP-2025-8821",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "r-003", type: "status_update", userType: "retailer", read: true,
    title: "Application Under Review",
    body: "PTG-APP-2025-6174 for PTG Sukhumvit 62 is now being reviewed by the landlord team.",
    href: "/retailer_backoffice/myApplicationsPage",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "r-004", type: "system", userType: "retailer", read: true,
    title: "Application Not Approved",
    body: "PTG-APP-2025-3302 for PTG Lat Phrao 71 was not approved at this time. The unit may have been leased.",
    href: "/retailer_backoffice/myApplicationsPage",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  // ── Landlord ──────────────────────────────────────────────────────────────
  {
    id: "l-001", type: "status_update", userType: "landlord", read: false,
    title: "New Application Received",
    body: "Coffee Corner Co., Ltd. has applied for Unit A-02 at PTG Rama IX. Review required.",
    href: "/landlord_backoffice/landlordApplicationsPage",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "l-002", type: "message", userType: "landlord", read: false,
    title: "New message from retailer",
    body: "Quick Mart is asking about the lease duration flexibility for Unit B-01 at PTG Bang Na.",
    href: "/landlord_backoffice/landlordApplicationsPage",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
  {
    id: "l-003", type: "booking", userType: "landlord", read: false,
    title: "Booking Request",
    body: "Lumina Artisan Roastery has requested to schedule a site walkthrough for Unit C-01 at PTG Sukhumvit.",
    href: "/landlord_backoffice/landlordApplicationsPage",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "l-004", type: "system", userType: "landlord", read: true,
    title: "New Application Received",
    body: "A new application for Unit F-02 at PTG Lat Phrao 71 was submitted.",
    href: "/landlord_backoffice/landlordApplicationsPage",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];

function seedIfEmpty(): void {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
  }
}

export function getNotifications(userType: "retailer" | "landlord"): Notification[] {
  if (typeof window === "undefined") return [];
  seedIfEmpty();
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Notification[];
    return all.filter(n => n.userType === userType).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch { return []; }
}

export function markRead(id: string): void {
  if (typeof window === "undefined") return;
  seedIfEmpty();
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Notification[];
    const updated = all.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function markAllRead(userType: "retailer" | "landlord"): void {
  if (typeof window === "undefined") return;
  seedIfEmpty();
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Notification[];
    const updated = all.map(n => n.userType === userType ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function addNotification(n: Omit<Notification, "id" | "read">): void {
  if (typeof window === "undefined") return;
  seedIfEmpty();
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Notification[];
    const newN: Notification = { ...n, id: `notif-${Date.now()}`, read: false };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newN, ...all]));
  } catch {}
}

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
