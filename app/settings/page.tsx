"use client";
import { useRef, useState } from "react";
import { btnGhost, btnPrimary, Card, SectionHead } from "@/components/ui";
import { applySimpleMode } from "@/components/simple-mode";
import { KEYS, useLocalStorage } from "@/lib/store";

export default function Settings() {
  const [msg, setMsg] = useState("");
  const [langPref, setLangPref] = useLocalStorage<"en" | "ta">(KEYS.lang, "en");
  const [simple, setSimple] = useLocalStorage<boolean>(KEYS.uiSimple, false);
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleSimple() {
    const next = !simple;
    setSimple(next);
    applySimpleMode(next);
    setMsg(next
      ? "Simple mode on — the whole app is now bigger and easier to tap. Turn it off here any time."
      : "Simple mode off.");
  }

  function exportData() {
    // Stamp first: the exported backup itself must include the fresh timestamp.
    try { localStorage.setItem(KEYS.backupTaken, JSON.stringify({ at: Date.now() })); } catch { /* storage unavailable */ }
    const data: Record<string, unknown> = {};
    for (const k of Object.values(KEYS)) {
      try { data[k] = JSON.parse(localStorage.getItem(k) ?? "null"); } catch { data[k] = null; }
    }
    const blob = new Blob([JSON.stringify({ app: "nivarana", project: "003", exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nivarana-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg("Backup downloaded. Keep it somewhere safe — ideally off this phone.");
  }

  // Keys whose values must be JSON arrays, and keys whose values must be plain
  // objects — used to reject corrupt or mismatched backup sections on import.
  const ARRAY_KEYS: string[] = [
    KEYS.incidents, KEYS.shelters, KEYS.helpRequests, KEYS.volunteers,
    KEYS.contacts, KEYS.safePings, KEYS.docs, KEYS.alerts, KEYS.watches, KEYS.goBag,
    KEYS.sosSends, KEYS.badges, KEYS.drills, KEYS.checkins,
  ];
  const OBJECT_KEYS: string[] = [KEYS.familyPlan, KEYS.profile, KEYS.emergencyId, KEYS.claimIdentity, KEYS.alertTested, KEYS.alertConfirms, KEYS.familySafety, KEYS.backupTaken];

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(String(r.result));
        const data = parsed.data ?? parsed;
        // Reject files that aren't Nivarana backups at all.
        const looksLikeData = typeof data === "object" && data !== null &&
          Object.values(KEYS).some((k) => data[k] !== undefined && data[k] !== null);
        if (parsed.data !== undefined && parsed.app !== "nivarana") throw new Error("not a Nivarana backup");
        if (!looksLikeData) throw new Error("not a Nivarana backup");
        let restored = 0;
        let skipped = 0;
        for (const k of Object.values(KEYS)) {
          const v = data[k];
          if (v === undefined || v === null) continue;
          let ok = true;
          if (ARRAY_KEYS.includes(k)) ok = Array.isArray(v);
          else if (OBJECT_KEYS.includes(k)) ok = typeof v === "object" && !Array.isArray(v);
          else if (k === KEYS.lang) ok = v === "en" || v === "ta";
          else if (k === KEYS.uiSimple) ok = typeof v === "boolean";
          if (ok) { localStorage.setItem(k, JSON.stringify(v)); restored++; }
          else skipped++;
        }
        setMsg(
          restored > 0
            ? `Restored ${restored} section${restored === 1 ? "" : "s"}.${skipped > 0 ? ` Skipped ${skipped} damaged section${skipped === 1 ? "" : "s"}.` : ""} Reload the app to see everything.`
            : "That file is a Nivarana backup, but none of its sections were usable."
        );
      } catch {
        setMsg("That file doesn't look like a Nivarana backup — nothing was changed.");
      }
    };
    r.readAsText(f);
    e.target.value = "";
  }

  function resetAll() {
    if (!window.confirm("Delete ALL Nivarana data in this browser? This cannot be undone.")) return;
    for (const k of Object.values(KEYS)) localStorage.removeItem(k);
    setMsg("All data cleared.");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <SectionHead title="Settings" sub="Your data lives only in this browser. Back it up before you need it." />
      <div className="space-y-4">
        <Card>
          <h3 className="font-display text-lg font-bold text-ink">🌐 Language · மொழி</h3>
          <p className="mt-1 text-sm text-faint">Your preferred language for SOS and safety messages. It sticks across visits.</p>
          <div className="mt-3 flex gap-2">
            {(["en", "ta"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLangPref(l)}
                className={`rounded-md border px-4 py-2 text-sm font-semibold ${langPref === l ? "border-ink bg-ink text-cream" : "border-line text-soot hover:bg-sand"}`}
              >
                {l === "en" ? "English" : "தமிழ்"}
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-ink">🔎 Simple mode</h3>
              <p className="mt-1 text-sm text-faint">
                Bigger text and larger tap targets — built for elders and anyone
                who struggles with small print. Stays on until you switch it off.
              </p>
            </div>
            <button
              onClick={toggleSimple}
              role="switch"
              aria-checked={simple}
              className={`mt-1 w-14 shrink-0 rounded-full p-1 transition-colors ${simple ? "bg-signal" : "bg-line"}`}
            >
              <span className={`block h-6 w-6 rounded-full bg-white shadow transition-transform ${simple ? "translate-x-6" : ""}`} />
            </button>
          </div>
        </Card>
        <Card>
          <h3 className="font-display text-lg font-bold text-ink">💾 Backup & restore</h3>
          <p className="mt-1 text-sm text-faint">Export everything — reports, plans, contacts, shelters, volunteers — as one JSON file.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={exportData} className={btnPrimary}>Download backup</button>
            <button onClick={() => fileRef.current?.click()} className={btnGhost}>Restore from file</button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importData} />
          </div>
          {msg && <p className="mt-3 rounded-md bg-sand px-3 py-2 text-sm text-soot">{msg}</p>}
        </Card>
        <Card>
          <h3 className="font-display text-lg font-bold text-alarm">Danger zone</h3>
          <p className="mt-1 text-sm text-faint">Wipe every report, plan, contact and checklist stored in this browser.</p>
          <button onClick={resetAll} className="mt-3 rounded-md border border-alarm px-4 py-2 text-sm font-bold text-alarm hover:bg-alarm hover:text-white">
            Delete all my data
          </button>
        </Card>
        <Card>
          <h3 className="font-display text-lg font-bold text-ink">About</h3>
          <p className="mt-1 text-sm text-soot">
            <strong>Nivarana.</strong> A local-first flood & disaster resilience companion —
            prepare, report, find shelter, call for help. No accounts, no servers, no tracking.
            Works offline once loaded. In a real emergency, always call <a href="tel:112" className="font-bold text-signal">112</a>.
          </p>
        </Card>
      </div>
    </div>
  );
}
