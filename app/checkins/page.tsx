"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { btnGhost, btnPrimary, Card, EmptyState, Field, inputCls, SectionHead, timeAgo } from "@/components/ui";
import { KEYS, uid, useLocalStorage } from "@/lib/store";
import type { Neighbour, NeighbourStatus } from "@/lib/types";

const VULNERABILITIES = [
  "Elderly (65+)",
  "Lives alone",
  "Mobility-limited",
  "Vision/hearing impaired",
  "Chronic illness / daily medication",
  "Medical device dependent (oxygen, CPAP…)",
  "Infant / young children in home",
  "Doesn't speak the local language",
];

const STATUS_BADGE: Record<NeighbourStatus, { label: string; cls: string }> = {
  "unchecked": { label: "Not checked yet", cls: "bg-gold/15 text-gold border-gold/40" },
  "safe": { label: "✓ Safe", cls: "bg-moss/10 text-moss border-moss/40" },
  "needs-help": { label: "⚠ Needs help", cls: "bg-alarm/10 text-alarm border-alarm/40" },
};

// Priority queue: needs-help first, then never-checked, then stale (>12h —
// the "check vulnerable neighbours within the first 12 hours" rule), then the
// rest, newest first within each band.
const TWELVE_HOURS = 12 * 60 * 60 * 1000;
function priorityRank(n: Neighbour): number {
  if (n.status === "needs-help") return 0;
  if (n.lastCheckedAt == null) return 1;
  if (Date.now() - n.lastCheckedAt > TWELVE_HOURS) return 2;
  return 3;
}

export default function Checkins() {
  const [neighbours, setNeighbours] = useLocalStorage<Neighbour[]>(KEYS.checkins, []);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [vulns, setVulns] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const queue = useMemo(
    () => [...neighbours].sort((a, b) => priorityRank(a) - priorityRank(b) || (b.createdAt - a.createdAt)),
    [neighbours]
  );
  const needsHelp = neighbours.filter((n) => n.status === "needs-help").length;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setNeighbours([
      { id: uid("nb"), name: name.trim(), area: area.trim(), phone: phone.trim(), vulnerabilities: vulns, notes: notes.trim(), status: "unchecked", lastCheckedAt: null, createdAt: Date.now() },
      ...neighbours,
    ]);
    setName(""); setArea(""); setPhone(""); setVulns([]); setNotes("");
  }

  function mark(id: string, status: NeighbourStatus) {
    setNeighbours(neighbours.map((n) => (n.id === id ? { ...n, status, lastCheckedAt: status === "unchecked" ? n.lastCheckedAt : Date.now() } : n)));
  }

  function remove(id: string) {
    setNeighbours(neighbours.filter((n) => n.id !== id));
  }

  return (
    <div>
      <SectionHead
        title="Neighbour check-ins"
        sub="The most vulnerable neighbours get missed first in a flood. Register them, then work down the priority queue."
      />
      {needsHelp > 0 && (
        <div className="mb-5 rounded-md border border-alarm/40 bg-alarm/10 px-4 py-3">
          <p className="text-sm font-bold text-alarm">⚠ {needsHelp} neighbour{needsHelp === 1 ? "" : "s"} flagged as needing help — check them first.</p>
          <Link href="/volunteers" className="mt-1 inline-block text-sm font-semibold text-alarm underline">Post a help request for them →</Link>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 h-fit">
          <h3 className="font-display text-lg font-bold text-ink">Add a vulnerable neighbour</h3>
          <p className="mt-1 text-xs text-faint">With their knowledge if possible — or flag someone you can reach.</p>
          <form onSubmit={submit} className="mt-3 space-y-3">
            <Field label="Name *"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mrs. Lakshmi" required /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Area"><input className={inputCls} value={area} onChange={(e) => setArea(e.target.value)} placeholder="Street / flat" /></Field>
              <Field label="Phone"><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            </div>
            <Field label="Why are they vulnerable?">
              <div className="flex flex-wrap gap-2">
                {VULNERABILITIES.map((v) => (
                  <button key={v} type="button"
                    onClick={() => setVulns(vulns.includes(v) ? vulns.filter((x) => x !== v) : [...vulns, v])}
                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${vulns.includes(v) ? "border-signal bg-signal text-white" : "border-line text-soot"}`}>
                    {v}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Notes"><textarea className={inputCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ground floor, two cats, keys with neighbour…" /></Field>
            <button className={`${btnPrimary} w-full`}>Add to check-in list</button>
          </form>
        </Card>
        <div className="lg:col-span-3 space-y-3">
          {queue.length === 0 && (
            <EmptyState
              title="No neighbours registered"
              body="Think of who on your street would struggle to evacuate alone — elderly living alone, mobility-limited, medical-device dependent. Add them before the rain."
            />
          )}
          {queue.map((n) => {
            const badge = STATUS_BADGE[n.status];
            return (
              <Card key={n.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">{n.name} <span className="text-sm font-normal text-faint">· {n.area || "area not set"}</span></p>
                    {n.vulnerabilities.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {n.vulnerabilities.map((v) => (
                          <span key={v} className="rounded-sm bg-sand px-2 py-0.5 text-xs text-soot">{v}</span>
                        ))}
                      </div>
                    )}
                    {n.notes && <p className="mt-1 text-xs text-soot">📝 {n.notes}</p>}
                    <p className="mt-1 text-xs text-faint">
                      {n.lastCheckedAt ? `Last checked ${timeAgo(n.lastCheckedAt)}` : "Never checked"} · added {timeAgo(n.createdAt)}
                    </p>
                    {n.lastCheckedAt && Date.now() - n.lastCheckedAt > 12 * 60 * 60 * 1000 && n.status !== "needs-help" && (
                      <p className="mt-1 text-xs font-semibold text-gold">🕒 Over 12h since the last check — check again, conditions change fast.</p>
                    )}
                  </div>
                  <span className={`rounded-md border px-2.5 py-1 text-xs font-bold ${badge.cls}`}>{badge.label}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {n.phone && <a href={`tel:${n.phone.replace(/\D/g, "")}`} className="rounded-md bg-signal px-3 py-1.5 text-xs font-bold text-white">Call</a>}
                  <button onClick={() => mark(n.id, "safe")} className="rounded-md border border-moss/50 bg-moss/10 px-3 py-1.5 text-xs font-bold text-moss">✓ Checked — safe</button>
                  <button onClick={() => mark(n.id, "needs-help")} className="rounded-md border border-alarm/50 bg-alarm/10 px-3 py-1.5 text-xs font-bold text-alarm">⚠ Needs help</button>
                  <button onClick={() => remove(n.id)} className={`${btnGhost} !px-3 !py-1.5 !text-xs`}>Remove</button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
