"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, EmptyState, INCIDENT_LABELS, inputCls, SectionHead, SeverityBadge, StaleBadge, isStale, timeAgo } from "@/components/ui";
import { buildIncidentText } from "@/lib/share";
import { KEYS, useLocalStorage } from "@/lib/store";
import type { Incident, IncidentType, Severity } from "@/lib/types";

const TYPES = ["all", ...(Object.keys(INCIDENT_LABELS) as IncidentType[])];
const SEVS: Array<"all" | Severity> = ["all", "low", "moderate", "high", "critical"];
const SEV_RANK: Record<Severity, number> = { critical: 0, high: 1, moderate: 2, low: 3 };

export default function Reports() {
  const [incidents, setIncidents] = useLocalStorage<Incident[]>(KEYS.incidents, []);
  const [type, setType] = useState<string>("all");
  const [sev, setSev] = useState<string>("all");
  const [q, setQ] = useState("");
  const [showResolved, setShowResolved] = useState(false);
  const [sort, setSort] = useState<"newest" | "severe">("newest");

  const filtered = useMemo(() => {
    return incidents
      .filter((i) => (showResolved ? true : i.status === "active"))
      .filter((i) => (type === "all" ? true : i.type === type))
      .filter((i) => (sev === "all" ? true : i.severity === sev))
      .filter((i) => (q ? `${i.area} ${i.ward} ${i.note}`.toLowerCase().includes(q.toLowerCase()) : true))
      .sort((a, b) =>
        sort === "severe" ? SEV_RANK[a.severity] - SEV_RANK[b.severity] || b.createdAt - a.createdAt : b.createdAt - a.createdAt
      );
  }, [incidents, type, sev, q, showResolved, sort]);

  function confirm(id: string) {
    setIncidents(incidents.map((i) => (i.id === id ? { ...i, confirmations: i.confirmations + 1, confirmedAt: Date.now() } : i)));
  }
  function resolve(id: string) {
    setIncidents(incidents.map((i) => (i.id === id ? { ...i, status: i.status === "active" ? "resolved" : "active" } : i)));
  }
  function share(i: Incident) {
    const text = buildIncidentText({ typeLabel: INCIDENT_LABELS[i.type], severity: i.severity, area: i.area, note: i.note });
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
  }

  return (
    <div>
      <SectionHead
        title="Incident board"
        sub="Crowd-sourced flood and hazard reports — newest first"
        action={
          <Link href="/reports/new" className="rounded-md bg-signal px-4 py-2.5 text-sm font-semibold text-white hover:bg-tide">
            + Report
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <input className={`${inputCls} max-w-xs`} placeholder="Search area or keyword…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputCls} style={{ width: "auto" }} value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t === "all" ? "All types" : INCIDENT_LABELS[t as IncidentType]}</option>
          ))}
        </select>
        <select className={inputCls} style={{ width: "auto" }} value={sev} onChange={(e) => setSev(e.target.value)}>
          {SEVS.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All severities" : s}</option>
          ))}
        </select>
        <button
          onClick={() => setShowResolved(!showResolved)}
          className={`rounded-md border px-3 py-2 text-sm font-medium ${showResolved ? "border-ink bg-ink text-cream" : "border-line bg-cream text-soot"}`}
        >
          {showResolved ? "Hiding resolved" : "Show resolved"}
        </button>
        <div className="flex items-center gap-1 rounded-md border border-line bg-cream p-1">
          {(["newest", "severe"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`rounded px-2.5 py-1.5 text-xs font-semibold ${sort === s ? "bg-ink text-cream" : "text-soot"}`}
            >
              {s === "newest" ? "Newest first" : "Most severe first"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No reports match"
          body="Be the first to report what you see — a blocked drain reported early can save a street."
          action={<Link href="/reports/new" className="rounded-md bg-signal px-5 py-2.5 text-sm font-semibold text-white">Report an incident</Link>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((i) => (
            <Card key={i.id} className={i.status === "resolved" ? "opacity-60" : ""}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/reports/${i.id}`} className="font-semibold text-ink hover:text-signal hover:underline">
                    {INCIDENT_LABELS[i.type]} — {i.area}
                    {i.ward && <span className="font-normal text-faint"> · {i.ward}</span>}
                  </Link>
                  <p className="mt-1 text-sm text-soot">{i.note || "No details added."}</p>
                  <p className="mt-1 text-xs text-faint">
                    {i.waterDepthCm != null && `≈${i.waterDepthCm} cm water · `}
                    {i.reporter} · {timeAgo(i.createdAt)} · {i.confirmations} confirmation{i.confirmations === 1 ? "" : "s"}{i.confirmedAt ? ` · latest confirmed ${timeAgo(i.confirmedAt)}` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <SeverityBadge severity={i.severity} />
                  {i.status === "active" && isStale(i.createdAt) && <StaleBadge />}
                </div>
              </div>
              {i.status === "active" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => confirm(i.id)} className="rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-soot hover:bg-sand">
                    ✓ I see this too
                  </button>
                  <button onClick={() => share(i)} className="rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-soot hover:bg-sand">
                    Share on WhatsApp
                  </button>
                  <button onClick={() => resolve(i.id)} className="rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-moss hover:bg-sand">
                    Mark resolved
                  </button>
                </div>
              )}
              {i.status === "resolved" && (
                <button onClick={() => resolve(i.id)} className="mt-3 text-xs font-semibold text-signal hover:underline">
                  Reopen report
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
