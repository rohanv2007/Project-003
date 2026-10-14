"use client";
import { useMemo, useState } from "react";
import { btnGhost, btnPrimary, Card, EmptyState, Field, inputCls, SectionHead, SeverityBadge, timeAgo } from "@/components/ui";
import { FLOOD_PRONE_AREAS, BROADCAST_TEMPLATES } from "@/lib/data";
import { KEYS, uid, useLocalStorage } from "@/lib/store";
import type { AlertItem, Severity, WatchArea } from "@/lib/types";

// Copy-paste bilingual broadcast templates for WhatsApp group admins.
// In a real event the admin is the trusted coordinator — pre-written messages
// keep the information consistent across groups instead of panic forwards.
function BroadcastTemplates() {
  const [area, setArea] = useState("");
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(id: string, text: string) {
    const filled = area.trim() ? text.replaceAll("[AREA]", area.trim()) : text;
    try {
      await navigator.clipboard.writeText(filled);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-bold text-ink">📣 Broadcast templates</h2>
      <p className="mb-3 text-sm text-soot">For street/ward WhatsApp group admins: type your area once, then copy a ready bilingual message. Calm, consistent words beat panic forwards.</p>
      <Card>
        <div className="mb-4 flex flex-wrap gap-2">
          <input className={inputCls + " max-w-xs"} value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area to fill in (e.g. Velachery)" list="prone" />
          <div className="flex rounded-md border border-line">
            {(["en", "ta"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-3 py-1.5 text-xs font-bold ${lang === l ? "bg-ink text-cream" : "text-soot"}`}>
                {l === "en" ? "English" : "தமிழ்"}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {BROADCAST_TEMPLATES.map((t) => {
            const text = lang === "en" ? t.en : t.ta;
            return (
              <div key={t.id} className="rounded-md border border-line bg-paper px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-ink">{t.title}</p>
                  <button onClick={() => copy(t.id, text)} className="rounded-md border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink hover:bg-sand">
                    {copied === t.id ? "✓ Copied" : "Copy"}
                  </button>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-xs text-soot">
                  {area.trim() ? text.replaceAll("[AREA]", area.trim()) : text}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}

// A warning app helps only if its alerts actually reach your phone —
// power-saving modes can delay notifications, and most people discover
// their setup is broken only when the water is rising. This dry-run fires
// a simulated critical alert in the real visual language and records
// whether you saw it, on a calm day when there is time to fix things.
function AlertSelfTest() {
  const [tested, setTested] = useLocalStorage<{ at: number | null; seen: boolean }>(
    KEYS.alertTested, { at: null, seen: false }
  );
  const [fired, setFired] = useState(false);

  function runTest() {
    setFired(true);
    try { navigator.vibrate?.([120, 60, 120]); } catch { /* no-op */ }
  }
  function answer(seen: boolean) {
    setTested({ at: Date.now(), seen });
    setFired(false);
  }

  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-bold text-ink">🔔 Test your alert setup</h2>
      <Card>
        <p className="text-sm text-soot">
          A warning only saves lives if it reaches you. Power-saving modes can delay notifications —
          run this dry-run <em>today</em>, while it's calm, so you know your phone will actually alert you at 2 AM.
        </p>
        {tested.at == null ? (
          <p className="mt-2 rounded-md bg-gold/20 px-3 py-2 text-sm font-semibold text-ink">
            ⚠ Never tested — your alerts might be silently blocked. Tap below.
          </p>
        ) : (
          <p className="mt-2 text-sm text-soot">
            Last tested <span className="font-semibold text-ink">{timeAgo(tested.at)}</span>
            {tested.seen ? " — you saw it clearly ✓" : " — ⚠ you couldn't see it clearly. Check your phone's notification & battery settings, then re-test."}
          </p>
        )}
        {!fired ? (
          <button onClick={runTest} className={btnPrimary + " mt-3"}>Run test alert</button>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="rounded-md border-l-4 border-l-alarm bg-cream px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-ink">⚠️ TEST — critical flood warning</p>
                <SeverityBadge severity="critical" />
              </div>
              <p className="mt-1 text-sm text-soot">
                This is what a real critical alert will look like on this device. If it scrolled past
                unnoticed, turn on notifications and add Nivarana to your battery "unrestricted" list.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink">Did you see it clearly?</span>
              <button onClick={() => answer(true)} className={btnPrimary}>Yes, loud and clear</button>
              <button onClick={() => answer(false)} className={btnGhost}>No — I missed it</button>
            </div>
          </div>
        )}
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-faint">
          <li>Keep your phone charged overnight during heavy rain.</li>
          <li>Make sure one family member's phone is always reachable.</li>
          <li>If you share this device, show everyone what a real alert looks like.</li>
        </ul>
      </Card>
    </section>
  );
}

function seedAlerts(): AlertItem[] {  const now = Date.now();
  return [
    {
      id: "seed-a1", title: "Heavy rainfall warning — Chennai", severity: "high" as Severity, area: "Chennai district",
      body: "IMD forecasts heavy to very heavy rainfall in the next 24 hours. Avoid low-lying areas; keep valuables above ground level.",
      source: "IMD (sample)", issuedAt: now - 2 * 3600 * 1000, read: false,
    },
    {
      id: "seed-a2", title: "Waterlogging reported — Velachery", severity: "moderate" as Severity, area: "Velachery",
      body: "Multiple citizen reports of 20–30 cm waterlogging near 100 Feet Road. Two-wheelers advised to avoid.",
      source: "Nivarana reports (sample)", issuedAt: now - 5 * 3600 * 1000, read: false,
    },
  ];
}

export default function Alerts() {
  const [alerts, setAlerts] = useLocalStorage<AlertItem[]>(KEYS.alerts, seedAlerts);
  const [watches, setWatches] = useLocalStorage<WatchArea[]>(KEYS.watches, []);
  const [confirms, setConfirms] = useLocalStorage<Record<string, number>>(KEYS.alertConfirms, {});
  const [newWatch, setNewWatch] = useState("");

  const unread = useMemo(() => alerts.filter((a) => !a.read), [alerts]);
  const matched = useMemo(
    () => alerts.filter((a) => watches.some((w) => a.area.toLowerCase().includes(w.area.toLowerCase()) || w.area.toLowerCase().includes(a.area.toLowerCase()))),
    [alerts, watches]
  );

  function addWatch(e: React.FormEvent) {
    e.preventDefault();
    const area = newWatch.trim();
    if (!area || watches.some((w) => w.area.toLowerCase() === area.toLowerCase())) return;
    setWatches([...watches, { id: uid("w"), area }]);
    setNewWatch("");
  }
  function markRead(id: string) {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }
  function confirmAlert(id: string) {
    setConfirms((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    try { navigator.vibrate?.(60); } catch { /* no-op */ }
  }
  function markAll() {
    setAlerts(alerts.map((a) => ({ ...a, read: true })));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <SectionHead
        title="Alerts"
        sub="Warnings for the areas you watch. Sample IMD-style alerts are preloaded — replace with real ones during monsoon."
        action={unread.length > 0 ? <button onClick={markAll} className={btnGhost}>Mark all read</button> : undefined}
      />

      <section>
        <h2 className="mb-3 font-display text-xl font-bold text-ink">👁️ Watch areas</h2>
        <Card>
          <form onSubmit={addWatch} className="flex gap-2">
            <input className={inputCls} value={newWatch} onChange={(e) => setNewWatch(e.target.value)} placeholder="e.g. Velachery" list="prone" />
            <datalist id="prone">{FLOOD_PRONE_AREAS.map((a) => <option key={a} value={a} />)}</datalist>
            <button className={btnPrimary}>Watch</button>
          </form>
          {watches.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {watches.map((w) => (
                <span key={w.id} className="flex items-center gap-2 rounded-md bg-sand px-3 py-1.5 text-sm font-medium text-ink">
                  {w.area}
                  <button onClick={() => setWatches(watches.filter((x) => x.id !== w.id))} className="font-bold text-faint hover:text-alarm">×</button>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-faint">No watch areas yet. Add your home and office areas to get matched alerts.</p>
          )}
        </Card>
      </section>

      <AlertSelfTest />

      {matched.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-xl font-bold text-alarm">⚠️ Matching your watches</h2>          <div className="space-y-3">
            {matched.map((a) => <AlertCard key={a.id} a={a} onRead={markRead} confirmCount={confirms[a.id] ?? 0} onConfirm={confirmAlert} highlight />)}
          </div>
        </section>
      )}

      <BroadcastTemplates />

      <section>
        <h2 className="mb-3 font-display text-xl font-bold text-ink">All alerts {unread.length > 0 && <span className="text-sm font-sans font-semibold text-alarm">({unread.length} unread)</span>}</h2>
        {alerts.length === 0 ? (
          <EmptyState title="No alerts" body="When a warning is issued for your watched areas, it will appear here." />
        ) : (
          <div className="space-y-3">
            {[...alerts].sort((a, b) => b.issuedAt - a.issuedAt).map((a) => <AlertCard key={a.id} a={a} onRead={markRead} confirmCount={confirms[a.id] ?? 0} onConfirm={confirmAlert} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function AlertCard({ a, onRead, confirmCount, onConfirm, highlight = false }: {
  a: AlertItem; onRead: (id: string) => void; confirmCount: number; onConfirm: (id: string) => void; highlight?: boolean;
}) {
  return (
    <Card className={`${!a.read ? "border-l-4 border-l-alarm" : ""} ${highlight ? "border-signal" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`font-semibold ${a.read ? "text-soot" : "text-ink"}`}>{a.title}</p>
          <p className="mt-1 text-sm text-soot">{a.body}</p>
          <p className="mt-1 text-xs text-faint">{a.area} · {a.source} · {timeAgo(a.issuedAt)}</p>
          {confirmCount > 0 && (
            <p className="mt-1 text-xs font-semibold text-signal">👁 {confirmCount} neighbour{confirmCount === 1 ? "" : "s"} confirming this locally</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {alertActions(a).map((x) => (
              <a key={x.href + x.label} href={x.href} className="rounded-md border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-signal hover:border-signal">
                {x.label}
              </a>
            ))}
            <button onClick={() => onConfirm(a.id)} className="rounded-md border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-ink hover:border-ink">
              👁 I see this too
            </button>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <SeverityBadge severity={a.severity} />
          {!a.read && <button onClick={() => onRead(a.id)} className="text-xs font-semibold text-signal hover:underline">Mark read</button>}
        </div>
      </div>
    </Card>
  );
}

// Turn an alert into concrete next steps: keyword-matched deep links so a
// rainfall warning points at the go-bag, a flood alert at shelters.
function alertActions(a: AlertItem): Array<{ label: string; href: string }> {
  const t = `${a.title} ${a.body}`.toLowerCase();
  const out: Array<{ label: string; href: string }> = [];
  if (/rain|storm|cyclone|monsoon|warning/.test(t)) out.push({ label: "🎒 Check go-bag & family plan", href: "/prepare" });
  if (/flood|waterlog|inundat|evacuat/.test(t)) out.push({ label: "🏠 Find relief shelters", href: "/shelters" });
  if (/power|electric|wire/.test(t)) out.push({ label: "⚠️ Report the hazard", href: "/reports/new" });
  if (/medical|health|disease/.test(t)) out.push({ label: "⛑️ First-aid guides", href: "/firstaid" });
  if (!out.length) out.push({ label: "📋 Review your readiness", href: "/prepare" });
  return out.slice(0, 2);
}
