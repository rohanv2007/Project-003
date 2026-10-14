"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Card, EmptyState, INCIDENT_LABELS, SectionHead, SeverityBadge, StaleBadge, isStale, timeAgo } from "@/components/ui";
import { buildIncidentText } from "@/lib/share";
import { KEYS, useLocalStorage } from "@/lib/store";
import type { Incident } from "@/lib/types";

const DETAIL_ROWS: Array<{ key: keyof Incident; label: string }> = [
  { key: "area", label: "Area" },
  { key: "ward", label: "Ward / locality" },
  { key: "waterDepthCm", label: "Water depth" },
  { key: "reporter", label: "Reported by" },
  { key: "createdAt", label: "Reported" },
  { key: "confirmations", label: "Confirmations" },
  { key: "status", label: "Status" },
];

function fullDate(ts: number): string {
  return new Date(ts).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function normArea(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}
function areaMatches(a: string, b: string): boolean {
  const x = normArea(a), y = normArea(b);
  return x.length > 2 && y.length > 2 && (x.includes(y) || y.includes(x));
}

// Other active reports whose area fuzzy-matches this one — the neighbourhood
// cluster around the same flood, so a reader sees it whole.
function NearbyReports({ current, incidents }: { current: Incident; incidents: Incident[] }) {
  const nearby = incidents
    .filter((x) => x.id !== current.id && x.status === "active" && areaMatches(x.area, current.area))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);
  if (nearby.length === 0) return null;
  return (
    <section className="mt-6">
      <h2 className="mb-3 font-display text-lg font-bold text-ink">📍 Other reports in this area</h2>
      <div className="space-y-2">
        {nearby.map((x) => (
          <Link key={x.id} href={`/reports/${x.id}`}>
            <Card className="flex items-center justify-between gap-3 hover:border-signal">
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{INCIDENT_LABELS[x.type]} — {x.area}</p>
                <p className="text-xs text-faint">{x.note ? `${x.note.slice(0, 80)}${x.note.length > 80 ? "…" : ""}` : "No details"} · {timeAgo(x.createdAt)} · {x.confirmations} confirmed</p>
              </div>
              <SeverityBadge severity={x.severity} />
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function IncidentDetail() {
  const params = useParams<{ id: string }>();
  const [incidents, setIncidents] = useLocalStorage<Incident[]>(KEYS.incidents, []);
  const incident = useMemo(
    () => incidents.find((i) => i.id === params.id),
    [incidents, params.id]
  );

  if (!incident) {
    return (
      <EmptyState
        title="Report not found"
        body="This report may have been cleared from this browser, or the link is incomplete."
        action={
          <Link href="/reports" className="rounded-md bg-signal px-5 py-2.5 text-sm font-semibold text-white">
            Back to incident board
          </Link>
        }
      />
    );
  }

  const i = incident;
  const hasCoords = typeof i.lat === "number" && typeof i.lon === "number";
  const mapsUrl = hasCoords ? `https://maps.google.com/?q=${i.lat!.toFixed(6)},${i.lon!.toFixed(6)}` : null;
  const values: Record<string, string> = {
    area: i.area || "—",
    ward: i.ward || "—",
    waterDepthCm: i.waterDepthCm != null ? `≈${i.waterDepthCm} cm` : "—",
    reporter: i.reporter || "Anonymous",
    createdAt: `${fullDate(i.createdAt)} (${timeAgo(i.createdAt)})`,
    confirmations: `${i.confirmations} neighbour${i.confirmations === 1 ? "" : "s"} confirmed${i.confirmedAt ? ` · latest ${timeAgo(i.confirmedAt)}` : ""}`,
    status: i.status === "active" ? "Active" : "Resolved",
  };

  function confirm() {
    setIncidents(incidents.map((x) => (x.id === i.id ? { ...x, confirmations: x.confirmations + 1, confirmedAt: Date.now() } : x)));
  }
  function toggleResolved() {
    setIncidents(incidents.map((x) => (x.id === i.id ? { ...x, status: x.status === "active" ? "resolved" : "active" } : x)));
  }
  function share() {
    const text = buildIncidentText({
      typeLabel: INCIDENT_LABELS[i.type],
      severity: i.severity,
      area: i.area,
      note: i.note,
      coords: hasCoords ? { lat: i.lat!, lon: i.lon! } : null,
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  return (
    <div>
      <Link href="/reports" className="text-sm font-semibold text-signal hover:underline">
        ← Back to incident board
      </Link>
      <div className="mt-3">
        <SectionHead
          title={`${INCIDENT_LABELS[i.type]} — ${i.area}`}
          sub={i.ward ? `Ward / locality: ${i.ward}` : "Incident report"}
          action={
            <div className="flex flex-col items-end gap-1.5">
              <SeverityBadge severity={i.severity} />
              {i.status === "active" && isStale(i.createdAt) && <StaleBadge />}
            </div>
          }
        />
      </div>

      <Card className={i.status === "resolved" ? "opacity-70" : ""}>
        <p className="text-sm leading-relaxed text-soot">{i.note || "No details added."}</p>
        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {DETAIL_ROWS.map((row) => (
            <div key={row.key}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-faint">{row.label}</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink">{values[row.key]}</dd>
            </div>
          ))}
        </dl>
        {mapsUrl && (
          <p className="mt-3 text-sm">
            📍 <a href={mapsUrl} target="_blank" rel="noopener" className="font-semibold text-signal hover:underline">
              Open exact location in Maps
            </a>{" "}
            <span className="text-faint">({i.lat!.toFixed(5)}, {i.lon!.toFixed(5)})</span>
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {i.status === "active" && (
            <>
              <button onClick={confirm} className="rounded-md bg-signal px-4 py-2.5 text-sm font-semibold text-white hover:bg-tide">
                ✓ I see this too ({i.confirmations})
              </button>
              <button onClick={share} className="rounded-md border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-ink hover:bg-sand">
                Share on WhatsApp
              </button>
              <button onClick={toggleResolved} className="rounded-md border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-moss hover:bg-sand">
                Mark resolved
              </button>
            </>
          )}
          {i.status === "resolved" && (
            <button onClick={toggleResolved} className="rounded-md border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-ink hover:bg-sand">
              Reopen report
            </button>
          )}
        </div>
      </Card>

      {/* Nearby reports: same flood rarely produces a single report — show the
          cluster so neighbours read the whole picture, not one pin. */}
      <NearbyReports current={i} incidents={incidents} />

      <p className="mt-4 text-xs text-faint">
        Tip: share this page's link with neighbours — every confirmation makes the report more trustworthy.
      </p>
    </div>
  );
}
