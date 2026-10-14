"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, Field, INCIDENT_LABELS, inputCls, SectionHead } from "@/components/ui";
import { KEYS, uid, useLocalStorage } from "@/lib/store";
import type { Incident, IncidentType, Severity } from "@/lib/types";

const TYPES = Object.keys(INCIDENT_LABELS) as IncidentType[];
const SEVERITIES: Severity[] = ["low", "moderate", "high", "critical"];

export default function NewReport() {
  const router = useRouter();
  const [incidents, setIncidents] = useLocalStorage<Incident[]>(KEYS.incidents, []);
  const [type, setType] = useState<IncidentType>("waterlogging");
  const [severity, setSeverity] = useState<Severity>("moderate");
  const [area, setArea] = useState("");
  const [ward, setWard] = useState("");
  const [depth, setDepth] = useState("");
  const [note, setNote] = useState("");
  const [reporter, setReporter] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");

  function locate() {
    if (!("geolocation" in navigator)) {
      setLocError("This device can't provide a location.");
      return;
    }
    setLocating(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocError("Location permission denied — the report will save without coordinates.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!area.trim()) return;
    const incident: Incident = {
      id: uid("inc"),
      type,
      severity,
      area: area.trim(),
      ward: ward.trim(),
      note: note.trim(),
      waterDepthCm: depth ? Math.max(0, parseInt(depth, 10) || 0) : null,
      reporter: reporter.trim() || "Anonymous",
      createdAt: Date.now(),
      confirmations: 0,
      confirmedAt: null,
      status: "active",
      lat: coords?.lat ?? null,
      lon: coords?.lon ?? null,
    };
    setIncidents([incident, ...incidents]);
    router.push("/reports");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <SectionHead title="Report an incident" sub="Takes under a minute. Reports appear on the board instantly." />
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Field label="What happened?">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-md border px-2 py-2.5 text-sm font-medium ${
                    type === t ? "border-signal bg-signal text-white" : "border-line bg-paper text-soot hover:bg-sand"
                  }`}
                >
                  {INCIDENT_LABELS[t]}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Severity">
            <div className="grid grid-cols-4 gap-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`rounded-md border px-2 py-2 text-sm font-bold uppercase ${
                    severity === s ? "border-ink bg-ink text-cream" : "border-line bg-paper text-soot hover:bg-sand"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Area / street *">
              <input className={inputCls} value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. 100 Feet Road, Velachery" required />
            </Field>
            <Field label="Ward (optional)">
              <input className={inputCls} value={ward} onChange={(e) => setWard(e.target.value)} placeholder="e.g. Ward 172" />
            </Field>
          </div>
          {(type === "flood" || type === "waterlogging") && (
            <Field label="Water depth (cm, approx)">
              <input className={inputCls} type="number" min={0} value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="e.g. 30" />
            </Field>
          )}
          <Field label="Details">
            <textarea className={inputCls} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What's happening? Is it getting worse? Any blocked road?" />
          </Field>
          <Field label="Your name (optional)">
            <input className={inputCls} value={reporter} onChange={(e) => setReporter(e.target.value)} placeholder="Anonymous" />
          </Field>
          <div>
            <button
              type="button"
              onClick={locate}
              disabled={locating}
              className="rounded-md border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-ink hover:bg-sand disabled:opacity-50"
            >
              {locating ? "Getting location…" : coords ? "📍 Location attached — refresh" : "📍 Attach my GPS location (optional)"}
            </button>
            {coords && (
              <p className="mt-1.5 text-xs text-faint">
                {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)} · GPS works even without mobile data
              </p>
            )}
            {locError && <p className="mt-1.5 text-xs text-alarm">{locError}</p>}
          </div>
          <button type="submit" className="w-full rounded-md bg-signal px-4 py-3 text-sm font-bold text-white hover:bg-tide">
            Publish report
          </button>
          <p className="text-center text-xs text-faint">For life-threatening situations, call 112 first — then report here.</p>
        </form>
      </Card>
    </div>
  );
}
