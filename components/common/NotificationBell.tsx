"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";
import {
  getNotifications,
  getNotificationsAsync,
  markRead,
  markAllRead,
  timeAgo,
  type Notification,
} from "@/lib/notificationStore";

const TYPE_ICON: Record<Notification["type"], string> = {
  message:       "chat",
  status_update: "notifications",
  booking:       "calendar_month",
  system:        "info",
};
const TYPE_BG: Record<Notification["type"], string> = {
  message:       "bg-blue-50 text-blue-600",
  status_update: "bg-primary/10 text-primary",
  booking:       "bg-amber-50 text-amber-600",
  system:        "bg-surface-container-high text-on-surface-variant",
};

export default function NotificationBell() {
  const { user } = useAuth();
  const router   = useRouter();
  const ref      = useRef<HTMLDivElement>(null);

  const [open, setOpen]       = useState(false);
  const [items, setItems]     = useState<Notification[]>([]);
  const [tick, setTick]       = useState(0); // force re-read

  const userType = user?.type === "landlord" ? "landlord" : "retailer";

  // Sync read from localStorage cache (instant, for initial render)
  useEffect(() => {
    if (!user) return;
    setItems(getNotifications(userType));
  }, [user, tick, userType]);

  // Async refresh from Supabase (source of truth)
  useEffect(() => {
    if (!user) return;
    getNotificationsAsync(userType).then(fresh => {
      setItems(fresh);
    });
  }, [user, userType]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const unread = items.filter(n => !n.read).length;

  function handleOpen() {
    setTick(t => t + 1);
    setOpen(o => !o);
  }

  function handleClick(n: Notification) {
    markRead(n.id);
    setTick(t => t + 1);
    setOpen(false);
    if (n.href) router.push(n.href);
  }

  function handleMarkAll() {
    markAllRead(userType);
    setTick(t => t + 1);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-full bg-[#F5F2EB] flex items-center justify-center cursor-pointer hover:bg-outline-variant/20 transition-colors border-0"
      >
        <span className="material-symbols-outlined text-[20px] text-on-surface-variant">notifications</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[52px] w-80 bg-white rounded-2xl shadow-2xl border border-outline-variant/10 z-[60] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/10">
            <span className="text-sm font-bold text-on-surface">
              Notifications
              {unread > 0 && (
                <span className="ml-2 text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{unread} new</span>
              )}
            </span>
            {unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-[10px] font-bold text-primary hover:underline bg-transparent border-0 cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-10 text-center">
                <span className="material-symbols-outlined text-outline text-[32px] block mb-2">notifications_none</span>
                <p className="text-sm text-on-surface-variant">No notifications yet</p>
              </div>
            ) : (
              items.slice(0, 10).map(n => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-outline-variant/5 hover:bg-[#F5F2EB] transition-colors cursor-pointer border-x-0 border-t-0 ${!n.read ? "bg-primary/[0.03]" : "bg-white"}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${TYPE_BG[n.type]}`}>
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {TYPE_ICON[n.type]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <span className={`text-xs font-semibold leading-snug ${!n.read ? "text-on-surface" : "text-on-surface-variant"}`}>
                        {n.title}
                      </span>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-snug mt-0.5 line-clamp-2">{n.body}</p>
                    <span className="text-[10px] text-outline mt-1 block">{timeAgo(n.timestamp)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
