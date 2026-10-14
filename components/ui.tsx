"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { AlertItem, IncidentType, Severity } from "@/lib/types";
import { KEYS, load } from "@/lib/store";

export function SiteHeader() {
  const path = usePathname();
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const refreshUnread = useCallback(() => {
    setUnreadAlerts(load<AlertItem[]>(KEYS.alerts, []).filter((a) => !a.read).length);
  }, []);
  useEffect(() => {
    refreshUnread();
    window.addEventListener("focus", refreshUnread);
    window.addEventListener("storage", refreshUnread);
    return () => {
      window.removeEventListener("focus", refreshUnread);
      window.removeEventListener("storage", refreshUnread);
    };
  }, [refreshUnread]);
  const links = [
    { href: "/", label: "Home" },
    { href: "/reports", label: "Reports" },
    { href: "/zones", label: "Zones" },
    { href: "/prepare", label: "Prepare" },
    { href: "/shelters", label: "Shelters" },
    { href: "/volunteers", label: "Volunteers" },
    { href: "/checkins", label: "Neighbours" },
    { href: "/alerts", label: "Alerts" },
    { href: "/firstaid", label: "First Aid" },
    { href: "/docs", label: "Documents" },
    { href: "/settings", label: "Settings" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold tracking-tight text-ink">Nivarana</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                path === l.href ? "bg-ink text-cream" : "text-soot hover:bg-sand"
              }`}
            >
              {l.label}
              {l.href === "/alerts" && unreadAlerts > 0 && (
                <span className="ml-1.5 inline-block min-w-5 rounded-full bg-alarm px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">
                  {unreadAlerts}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <Link
          href="/sos"
          className="rounded-md bg-alarm px-4 py-2 text-sm font-bold text-white"
        >
          SOS
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-line bg-cream px-3 py-2 md:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
              path === l.href ? "bg-ink text-cream" : "text-soot"
            }`}
          >
            {l.label}
            {l.href === "/alerts" && unreadAlerts > 0 && (
              <span className="ml-1.5 inline-block min-w-5 rounded-full bg-alarm px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">
                {unreadAlerts}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SectionHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
        {sub && <p className="mt-1 text-sm text-faint">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-line bg-cream p-4 shadow-[0_1px_0_rgba(28,26,20,0.06)] ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-paper px-6 py-10 text-center">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-faint">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const SEVERITY_STYLE: Record<Severity, string> = {
  low: "bg-moss/10 text-moss border-moss/30",
  moderate: "bg-gold/10 text-gold border-gold/30",
  high: "bg-alarm/10 text-alarm border-alarm/30",
  critical: "bg-alarm text-white border-alarm",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-block rounded-sm border px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${SEVERITY_STYLE[severity]}`}>
      {severity}
    </span>
  );
}

export const INCIDENT_LABELS: Record<IncidentType, string> = {
  flood: "Flooding",
  waterlogging: "Waterlogging",
  "blocked-drain": "Blocked drain",
  "open-manhole": "Open manhole",
  "fallen-tree": "Fallen tree",
  "power-outage": "Power outage",
  receding: "Water receding",
  other: "Other",
};

export const INCIDENT_LABELS_TA: Record<IncidentType, string> = {
  flood: "வெள்ளம்",
  waterlogging: "நீர் தேங்கல்",
  "blocked-drain": "அடைபட்ட வடிகால்",
  "open-manhole": "திறந்த மேன்ஹோல்",
  "fallen-tree": "விழுந்த மரம்",
  "power-outage": "மின் தடை",
  receding: "நீர் வடிகிறது",
  other: "மற்றவை",
};

export function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// Flood conditions change fast: a report older than 6h may no longer reflect
// what's on the street. Stale reports get flagged rather than hidden.
export const STALE_AFTER_MS = 6 * 60 * 60 * 1000;
export function isStale(ts: number): boolean {
  return Date.now() - ts > STALE_AFTER_MS;
}
export function StaleBadge() {
  return (
    <span
      title="This report is more than 6 hours old — conditions may have changed. Confirm it only if you see it now."
      className="inline-block rounded-sm border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold"
    >
      ⚠ May be outdated
    </span>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-faint">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-faint/70 focus:border-signal focus:outline-none";

export const btnPrimary =
  "rounded-md bg-signal px-4 py-2.5 text-sm font-semibold text-white hover:bg-tide disabled:opacity-50";
export const btnGhost =
  "rounded-md border border-line bg-cream px-4 py-2.5 text-sm font-semibold text-ink hover:bg-sand";
