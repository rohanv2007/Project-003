"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, EmptyState, INCIDENT_LABELS, SectionHead, SeverityBadge, timeAgo } from "@/components/ui";
import { FLOOD_PRONE_AREAS } from "@/lib/data";
import { buildZoneSummaryText } from "@/lib/share";
import { KEYS, load, uid, useLocalStorage } from "@/lib/store";
import type { Incident, Severity, WatchArea } from "@/lib/types";

const SEV_RANK: Record<Severity, number> = { low: 0, moderate: 1, high: 2, critical: 3 };

export default function Zones() {
  const [watches, setWatches] = useLocalStorage<WatchArea[]>(KEYS.watches, []);
  const [copied, setCopied] = useState(false);

  function isWatched(area: string) {
    return watches.some((w) => w.area.toLowerCase() === area.trim().toLowerCase());
  }
  // One tap from a zone card adds it to the /alerts watchlist — the alerts
  // page already matches incoming alerts against watched areas, so this
  // closes the watch → warn loop without a second screen.
  function toggleWatch(area: string) {
    const a = area.trim();
    if (!a) return;
    if (isWatched(a)) setWatches(watches.filter((w) => w.area.toLowerCase() !== a.toLowerCase()));
    else setWatches([...watches, { id: uid("w"), area: a }]);
  }

  const zones = useMemo(() => {
    const incidents = load<Incident[]>(KEYS.incidents, []).filter((i) => i.status === "active");
    const byArea = new Map<string, Incident[]>();
    for (const i of incidents) {
      const key = i.area.trim().toLowerCase();
      if (!byArea.has(key)) byArea.set(key, []);
      byArea.get(key)!.push(i);
    }
    return [...byArea.entries()]
      .map(([key, list]) => {
        const worst = list.reduce<Severity>((w, i) => (SEV_RANK[i.severity] > SEV_RANK[w] ? i.severity : w), "low");
        const latest = Math.max(...list.map((i) => i.createdAt));
        // Flood truth rots fast: the freshest crowd signal is a confirmation
        // as much as a report — a "critical" badge from a 3-day-old sighting is
        // history, not a warning. Anything older than 24h gets flagged stale.
        const freshAt = Math.max(...list.map((i) => Math.max(i.createdAt, i.confirmedAt ?? 0)));
        const stale = Date.now() - freshAt > 24 * 3600 * 1000;
        const depths = list.map((i) => i.waterDepthCm).filter((d): d is number => d != null);
        const maxDepth = depths.length ? Math.max(...depths) : null;
        const receding = list.some((i) => i.type === "receding");
        return { area: list[0].area, key, list, worst, latest, freshAt, stale, count: list.length, maxDepth, receding };
      })
      .sort((a, b) => SEV_RANK[b.worst] - SEV_RANK[a.worst] || b.latest - a.latest);
  }, []);

  const quietAreas = useMemo(
    () => FLOOD_PRONE_AREAS.filter((a) => !zones.some((z) => z.key === a.toLowerCase())),
    [zones]
  );

  // One message, every affected street: severity, depth, receding and signal
  // freshness — for a neighbourhood WhatsApp group when someone asks "how is
  // our area?". The sit-rep builder on /volunteers does coordinators; this
  // one does neighbours.
  function copyZoneSummary() {
    const text = buildZoneSummaryText(
      zones.map((z) => ({ area: z.area, worst: z.worst, count: z.count, maxDepth: z.maxDepth, receding: z.receding, stale: z.stale }))
    );
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <div>
      <SectionHead
        title="Zone severity"
        sub="Every reported area, coloured by its worst active incident. Check before you travel."
        action={zones.length > 0 ? (
          <button
            onClick={copyZoneSummary}
            className="shrink-0 rounded-md border border-line bg-paper px-3 py-2 text-xs font-semibold text-soot hover:border-signal hover:text-signal"
          >
            {copied ? "✓ Copied" : "📋 Copy zone summary"}
          </button>
        ) : undefined}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border border-line bg-cream px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-faint">Legend</span>
        <span className="rounded-sm border border-alarm bg-alarm px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">Critical</span>
        <span className="rounded-sm border border-alarm/30 bg-alarm/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-alarm">High</span>
        <span className="rounded-sm border border-gold/30 bg-gold/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-gold">Moderate</span>
        <span className="rounded-sm border border-moss/30 bg-moss/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-moss">Low</span>
        <span className="text-xs text-faint">= worst active incident in that zone</span>
      </div>
      {zones.length === 0 ? (
        <EmptyState
          title="No active reports"
          body="No incidents have been reported yet. Historically flood-prone areas are listed below — if you live in one, set a watch and pack your go-bag."
          action={<Link href="/reports/new" className="rounded-md bg-signal px-5 py-2.5 text-sm font-semibold text-white">Report an incident</Link>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {zones.map((z) => (
            <Card key={z.key}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-lg font-bold text-ink">{z.area}</p>
                  <p className="text-xs text-faint">
                    {z.count} active report{z.count === 1 ? "" : "s"} · latest {timeAgo(z.latest)}
                    {z.maxDepth != null && ` · deepest ≈${z.maxDepth} cm`}
                  </p>
                  {z.receding && (
                    <p className="mt-1 inline-block rounded-sm bg-moss/10 px-2 py-0.5 text-xs font-semibold text-moss">
                      🌊 Water reported receding here — check the latest reports before travelling
                    </p>
                  )}
                  {z.stale && (
                    <p className="mt-1 text-xs font-semibold text-gold">
                      ⚠ Freshest signal {timeAgo(z.freshAt)} — treat this severity as history, verify conditions before travelling
                    </p>
                  )}
                </div>
                <SeverityBadge severity={z.worst} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[...new Set(z.list.map((i) => i.type))].map((t) => (
                  <span key={t} className="rounded-sm bg-sand px-2 py-0.5 text-xs font-medium text-soot">
                    {INCIDENT_LABELS[t]}
                  </span>
                ))}
              </div>
              <Link href="/reports" className="mt-3 inline-block text-sm font-semibold text-signal hover:underline">
                View reports →
              </Link>
              <button
                onClick={() => toggleWatch(z.area)}
                className={`ml-3 mt-3 rounded-md px-2.5 py-1 text-xs font-semibold ${
                  isWatched(z.area) ? "bg-signal/10 text-signal" : "border border-line bg-paper text-soot hover:bg-sand"
                }`}
              >
                {isWatched(z.area) ? "✓ Watching" : "👁 Watch this area"}
              </button>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <SectionHead title="Historically flood-prone" sub="Areas that flooded in 2015 / 2023 — no active reports right now" />
        <div className="flex flex-wrap gap-2">
          {quietAreas.map((a) => (
            <button
              key={a}
              onClick={() => toggleWatch(a)}
              title={isWatched(a) ? "Remove from watchlist" : "Watch this area for alerts"}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                isWatched(a) ? "border-signal bg-signal/10 font-semibold text-signal" : "border-line bg-cream text-soot hover:bg-sand"
              }`}
            >
              {isWatched(a) ? "✓ " : "👁 "}{a}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-faint">
          Living in one of these? <Link href="/alerts" className="font-semibold text-signal hover:underline">Set a watch alert</Link> and{" "}
          <Link href="/prepare" className="font-semibold text-signal hover:underline">pack your go-bag</Link>.
        </p>
      </div>
    </div>
  );
}
