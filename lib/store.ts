"use client";
import { useCallback, useEffect, useState } from "react";

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — fail silently */
  }
}

export function useLocalStorage<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() =>
    typeof initial === "function" ? (initial as () => T)() : initial
  );
  useEffect(() => {
    setValue(load(key, typeof initial === "function" ? (initial as () => T)() : initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        save(key, v);
        return v;
      });
    },
    [key]
  );
  return [value, set] as const;
}

export const KEYS = {
  incidents: "nivarana.incidents.v1",
  shelters: "nivarana.shelters.v1",
  helpRequests: "nivarana.help-requests.v1",
  volunteers: "nivarana.volunteers.v1",
  contacts: "nivarana.contacts.v1",
  familyPlan: "nivarana.family-plan.v1",
  goBag: "nivarana.go-bag.v1",
  goBagReviewed: "nivarana.go-bag-reviewed.v1",
  docs: "nivarana.docs.v1",
  alerts: "nivarana.alerts.v1",
  watches: "nivarana.watches.v1",
  safePings: "nivarana.safe-pings.v1",
  sosSends: "nivarana.sos-sends.v1",
  lang: "nivarana.lang.v1",
  uiSimple: "nivarana.ui.simple.v1",
  profile: "nivarana.profile.v1",
  emergencyId: "nivarana.emergency-id.v1",
  badges: "nivarana.badges.v1",
  drills: "nivarana.drills.v1",
  checkins: "nivarana.checkins.v1",
  claimIdentity: "nivarana.claim-identity.v1",
  alertTested: "nivarana.alert-tested.v1",
  alertConfirms: "nivarana.alert-confirms.v1",
  familySafety: "nivarana.family-safety.v1",
  // Timestamp of the last backup download — a backup that was never taken (or
  // taken months ago) is no protection against losing the phone in a flood.
  backupTaken: "nivarana.backup-taken.v1",
} as const;
