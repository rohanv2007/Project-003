"use client";
import { useEffect, useState } from "react";
import { btnGhost, btnPrimary, Card, Field, inputCls, SectionHead } from "@/components/ui";
import { HELPLINES } from "@/lib/data";
import { buildSafeText, buildSosText, smsUrl, whatsappUrl } from "@/lib/share";
import { KEYS, uid, useLocalStorage } from "@/lib/store";
import type { EmergencyContact, EmergencyId, FamilySafetyMark, FamilySafetyStatus, SafePing, SosSend } from "@/lib/types";

export default function Sos() {
  const [contacts, setContacts] = useLocalStorage<EmergencyContact[]>(KEYS.contacts, []);
  const [pings, setPings] = useLocalStorage<SafePing[]>(KEYS.safePings, []);
  const [sends, setSends] = useLocalStorage<SosSend[]>(KEYS.sosSends, []);
  const [profile, setProfile] = useLocalStorage(KEYS.profile, { name: "", phone: "", area: "" });
  const [need, setNeed] = useState("Rescue — water entering home");
  const [lang, setLang] = useLocalStorage<"en" | "ta">(KEYS.lang, "en");
  const [cName, setCName] = useState("");
  const [cRelation, setCRelation] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");

  const sosText = buildSosText({ name: profile.name || "—", area: profile.area || "—", need, phone: profile.phone || "—", lang, coords });
  const safeText = buildSafeText({ name: profile.name || "—", area: profile.area || "—", lang });

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
        setLocError("Location permission denied — coordinates won't be attached.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
  }

  function buzz() {
    try { navigator.vibrate?.(150); } catch { /* no-op */ }
  }

  function sendSos(channel: "whatsapp" | "sms") {
    setSends([{ id: uid("sos"), need, channel, createdAt: Date.now() }, ...sends].slice(0, 10));
    buzz();
    if (channel === "whatsapp") window.open(whatsappUrl(sosText), "_blank", "noopener");
    else window.open(smsUrl(sosText), "_self");
  }

  function sendSafe() {
    setPings([{ id: uid("ping"), name: profile.name || "Me", message: safeText, createdAt: Date.now() }, ...pings].slice(0, 20));
    buzz();
    window.open(whatsappUrl(safeText), "_blank", "noopener");
  }

  function addContact(e: React.FormEvent) {
    e.preventDefault();
    if (!cName.trim() || !cPhone.trim()) return;
    setContacts([...contacts, { id: uid("c"), name: cName.trim(), relation: cRelation.trim(), phone: cPhone.trim() }]);
    setCName(""); setCRelation(""); setCPhone("");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <SectionHead title="SOS & safety" sub="In a real emergency call 112 first. Then broadcast here." />

      <Card className="border-alarm">
        <h2 className="font-display text-xl font-bold text-alarm">🆘 Send distress signal</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Your name"><input className={inputCls} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Full name" /></Field>
          <Field label="Your area"><input className={inputCls} value={profile.area} onChange={(e) => setProfile({ ...profile, area: e.target.value })} placeholder="Street, area" /></Field>
          <Field label="Phone"><input className={inputCls} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="10-digit mobile" /></Field>
        </div>
        <div className="mt-3">
          <Field label="What do you need?">
            <select className={inputCls} value={need} onChange={(e) => setNeed(e.target.value)}>
              {["Rescue — water entering home", "Rescue — stranded", "Medical emergency", "Food / drinking water", "Boat / transport", "Electricity hazard"].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-3 flex gap-2">
          {(["en", "ta"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${lang === l ? "border-ink bg-ink text-cream" : "border-line text-soot"}`}>
              {l === "en" ? "English" : "தமிழ்"}
            </button>
          ))}
        </div>
        <pre className="mt-3 whitespace-pre-wrap rounded-md bg-paper p-3 text-sm text-ink">{sosText}</pre>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={locate}
            disabled={locating}
            className="rounded-md border border-line bg-paper px-3 py-2.5 text-sm font-semibold text-ink hover:bg-sand disabled:opacity-50"
          >
            {locating ? "Getting location…" : coords ? "📍 Location attached — refresh" : "📍 Attach my GPS location"}
          </button>
          {coords && (
            <span className="text-xs text-faint">
              {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)} · GPS works even without mobile data
            </span>
          )}
        </div>
        {locError && <p className="mt-2 text-xs text-alarm">{locError}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => sendSos("whatsapp")} className="rounded-md bg-moss px-4 py-2.5 text-sm font-bold text-white">Share on WhatsApp</button>
          <button onClick={() => sendSos("sms")} className={btnGhost}>Send as SMS</button>
          <button onClick={() => copy(sosText)} className={btnGhost}>Copy text</button>
        </div>
        {sends.length > 0 && (
          <div className="mt-4 border-t border-line pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-faint">Recent distress signals</p>
            <ul className="mt-2 space-y-1 text-sm text-soot">
              {sends.slice(0, 5).map((s) => (
                <li key={s.id}>
                  🆘 {s.need} — via {s.channel === "whatsapp" ? "WhatsApp" : "SMS"} ·{" "}
                  {new Date(s.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card className="border-moss">
        <h2 className="font-display text-xl font-bold text-moss">✅ I'm safe</h2>
        <p className="mt-1 text-sm text-faint">One tap tells your family you're okay — the Red Cross "I'm Safe" idea, bilingual.</p>
        <pre className="mt-3 whitespace-pre-wrap rounded-md bg-paper p-3 text-sm text-ink">{safeText}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={sendSafe} className="rounded-md bg-moss px-4 py-2.5 text-sm font-bold text-white">Broadcast I'm safe</button>
          <button onClick={() => copy(safeText)} className={btnGhost}>Copy text</button>
        </div>
        {pings.length > 0 && (
          <div className="mt-4 border-t border-line pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-faint">Recent safety pings</p>
            <ul className="mt-2 space-y-1 text-sm text-soot">
              {pings.slice(0, 5).map((p) => (
                <li key={p.id}>✅ {p.name} — {new Date(p.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Toolkit />

      <section>
        <h2 className="mb-3 font-display text-xl font-bold text-ink">📞 Helplines</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {HELPLINES.map((h) => (
            <a key={h.number} href={`tel:${h.number}`} className="flex items-center justify-between rounded-md border border-line bg-cream px-4 py-3 hover:border-signal">
              <span>
                <span className="block text-sm font-bold text-ink">{h.label} <span className="font-normal text-faint">· {h.labelTa}</span></span>
                <span className="block text-xs text-faint">{h.detail}</span>
              </span>
              <span className="font-display text-xl font-bold text-signal">{h.number}</span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-bold text-ink">🪪 My emergency ID</h2>
        <EmergencyIdCard profile={profile} />
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-bold text-ink">{lang === "ta" ? "👪 குடும்ப பாதுகாப்பு பலகை" : "👪 Family safety board"}</h2>
        <FamilySafetyBoard contacts={contacts} lang={lang} />
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-bold text-ink">👥 My emergency contacts</h2>
        <Card>
          <form onSubmit={addContact} className="grid gap-3 sm:grid-cols-4">
            <Field label="Name *"><input className={inputCls} value={cName} onChange={(e) => setCName(e.target.value)} required /></Field>
            <Field label="Relation"><input className={inputCls} value={cRelation} onChange={(e) => setCRelation(e.target.value)} placeholder="Father, neighbour…" /></Field>
            <Field label="Phone *"><input className={inputCls} value={cPhone} onChange={(e) => setCPhone(e.target.value)} required /></Field>
            <div className="flex items-end"><button type="submit" className={btnPrimary}>Add</button></div>
          </form>
          {contacts.length > 0 && (
            <ul className="mt-4 divide-y divide-line">
              {contacts.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2">
                  <span className="text-sm"><span className="font-semibold text-ink">{c.name}</span> <span className="text-faint">{c.relation && `· ${c.relation}`}</span></span>
                  <span className="flex gap-2">
                    <a href={`tel:${c.phone.replace(/\D/g, "")}`} className="rounded-md bg-signal px-3 py-1.5 text-xs font-bold text-white">Call</a>
                    <a href={whatsappUrl("", c.phone.replace(/\D/g, ""))} target="_blank" rel="noopener" className="rounded-md border border-line px-3 py-1.5 text-xs font-bold text-ink">WhatsApp</a>
                    <button onClick={() => setContacts(contacts.filter((x) => x.id !== c.id))} className="text-xs font-semibold text-faint hover:text-alarm">Remove</button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}

// A medical-profile ID card for first responders: blood group, allergies,
// medication and conditions. Pre-filled where known, shareable as text.
function EmergencyIdCard({ profile }: { profile: { name: string; phone: string; area: string } }) {
  const [eid, setEid] = useLocalStorage<EmergencyId>(KEYS.emergencyId, {
    bloodGroup: "",
    allergies: "",
    medications: "",
    conditions: "",
  });

  const cardText = [
    "🪪 EMERGENCY MEDICAL ID — Nivarana",
    `Name: ${profile.name || "—"}`,
    `Blood group: ${eid.bloodGroup || "—"}`,
    `Allergies: ${eid.allergies || "—"}`,
    `Current medication: ${eid.medications || "—"}`,
    `Conditions (diabetes, asthma…): ${eid.conditions || "—"}`,
    `Area: ${profile.area || "—"} · Phone: ${profile.phone || "—"}`,
  ].join("\n");

  return (
    <Card>
      <p className="text-sm text-faint">
        Fill this once — if you're hurt or unconscious, rescuers and hospitals get the details that matter.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Blood group">
          <select className={inputCls} value={eid.bloodGroup} onChange={(e) => setEid({ ...eid, bloodGroup: e.target.value })}>
            <option value="">Not set</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </Field>
        <Field label="Allergies"><input className={inputCls} value={eid.allergies} onChange={(e) => setEid({ ...eid, allergies: e.target.value })} placeholder="Penicillin, peanuts…" /></Field>
        <Field label="Current medication"><input className={inputCls} value={eid.medications} onChange={(e) => setEid({ ...eid, medications: e.target.value })} placeholder="Insulin, BP tablets…" /></Field>
        <Field label="Medical conditions"><input className={inputCls} value={eid.conditions} onChange={(e) => setEid({ ...eid, conditions: e.target.value })} placeholder="Diabetes, asthma…" /></Field>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => window.open(whatsappUrl(cardText), "_blank", "noopener")} className={btnGhost}>
          Share my emergency ID on WhatsApp
        </button>
        <button onClick={() => navigator.clipboard?.writeText(cardText).catch(() => {})} className={btnGhost}>
          Copy ID text
        </button>
      </div>
    </Card>
  );
}
function Toolkit() {
  const [sirenOn, setSirenOn] = useState(false);
  const [strobeOn, setStrobeOn] = useState(false);
  const [strobeWhite, setStrobeWhite] = useState(false);

  useEffect(() => {
    if (!strobeOn) return;
    // Reduced-motion users get a slow 1.5s pulse instead of a fast strobe —
    // a rapid flash can be harmful; a slow pulse still signals at night.
    const calm = typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const id = window.setInterval(() => setStrobeWhite((w) => !w), calm ? 1500 : 400);
    return () => window.clearInterval(id);
  }, [strobeOn]);

  function toggleSiren() {
    if (sirenOn) {
      stopSiren();
      setSirenOn(false);
    } else {
      startSiren();
      setSirenOn(true);
    }
  }

  return (
    <Card className="border-gold">
      <h2 className="font-display text-xl font-bold text-ink">🔦 Emergency toolkit</h2>
      <p className="mt-1 text-sm text-faint">
        Stranded on a roof or in a dark room? Signal rescuers — works fully offline, no torch hardware needed.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={toggleSiren} className={sirenOn ? "rounded-md bg-alarm px-4 py-2.5 text-sm font-bold text-white" : btnPrimary}>
          {sirenOn ? "⏹ Stop siren" : "📢 Sound siren alarm"}
        </button>
        <button
          onClick={() => setStrobeOn((v) => !v)}
          className={strobeOn ? "rounded-md bg-alarm px-4 py-2.5 text-sm font-bold text-white" : btnGhost}
          aria-pressed={strobeOn}
        >
          {strobeOn ? "⏹ Stop strobe" : "💡 Strobe light signal"}
        </button>
      </div>
      <p className="mt-2 text-xs text-faint">
        The siren cycles loud high–low tones; the strobe flashes the whole screen white so a rescue boat can spot you. Stop either with one tap.
      </p>
      {strobeOn && (
        <div
          className="fixed inset-0 z-50"
          style={{ backgroundColor: strobeWhite ? "#ffffff" : "#0b0b0b" }}
          onClick={() => setStrobeOn(false)}
          role="button"
          aria-label="Stop strobe light"
        />
      )}
    </Card>
  );
}

let sirenNodes: { ctx: AudioContext; osc: OscillatorNode; lfo: OscillatorNode; gain: GainNode } | null = null;

function startSiren() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    osc.type = "sine";
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.9; // classic two-tone emergency wail
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 320;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.frequency.value = 940;
    const gain = ctx.createGain();
    gain.gain.value = 0.28;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    lfo.start();
    sirenNodes = { ctx, osc, lfo, gain };
  } catch {
    /* audio unavailable on this device */
  }
}

function stopSiren() {
  try {
    sirenNodes?.osc.stop();
    sirenNodes?.lfo.stop();
    void sirenNodes?.ctx.close();
  } catch {
    /* already stopped */
  }
  sirenNodes = null;
}

// The reunification gap: during a flood, the hardest question isn't "is there
// water?" but "where is everyone?" — a household Safety-Check board where
// each family member is marked safe / unaccounted / unknown, shareable as
// plain text to the family WhatsApp group.
function FamilySafetyBoard({ contacts, lang }: { contacts: EmergencyContact[]; lang: "en" | "ta" }) {
  const [marks, setMarks] = useLocalStorage<Record<string, FamilySafetyMark>>(KEYS.familySafety, {});
  const [copied, setCopied] = useState(false);

  // Emergency flows are bilingual end-to-end: a panicking family member must
  // read this board in their own language, not translate under stress.
  const T = lang === "ta" ? {
    empty: "உங்கள் அவசர தொடர்புகளை கீழே சேர்த்து, நிகழ்வின் போது யார் பாதுகாப்பாக இருக்கிறார்கள் என்பதை இங்கே குறிக்கவும் — மிக மோசமான நேரத்தில் யாரும் 'யார் எங்கே?' என்று கவலைப்பட வேண்டாம்.",
    intro: "நிகழ்வின் போது, ஒவ்வொருவரிடமிருந்தும் செய்தி கிடைத்ததும் குறிக்கவும். சுருக்கத்தை ஒரே தட்டில் குடும்ப WhatsApp குழுவில் ஒட்டலாம்.",
    safe: "✅ பாதுகாப்பாக", unacc: "⚠ தொடர்பு இல்லை", unknown: "○ தெரியவில்லை",
    btnSafe: "✅ நலம்", btnLost: "⚠ இல்லை", btnUnknown: "○ ?",
    marked: "குறிக்கப்பட்டது",
    summary: (s: number, u: number, k: number) => `✅ ${s} பாதுகாப்பு · ⚠ ${u} தொடர்பு இல்லை · ○ ${k} தெரியவில்லை`,
    copy: "📋 குடும்ப நிலையை WhatsApp-க்கு நகலெடு", copied: "✓ நகலெடுக்கப்பட்டது",
  } : {
    empty: "Add your emergency contacts below, then come back here during an event to mark who's safe — so no one wonders \"where is everyone?\" at the worst moment.",
    intro: "During an event, mark each person as you hear from them. The summary copies into your family WhatsApp group in one tap.",
    safe: "✅ Safe", unacc: "⚠ Unaccounted", unknown: "○ Unknown",
    btnSafe: "✅ Safe", btnLost: "⚠ Lost", btnUnknown: "○ ?",
    marked: "marked",
    summary: (s: number, u: number, k: number) => `✅ ${s} safe · ⚠ ${u} unaccounted · ○ ${k} unknown`,
    copy: "📋 Copy family status for WhatsApp", copied: "✓ Copied",
  };

  function mark(id: string, status: FamilySafetyStatus) {
    setMarks((prev) => ({ ...prev, [id]: { status, at: Date.now() } }));
    try { navigator.vibrate?.(40); } catch { /* no-op */ }
  }

  const statusOf = (c: EmergencyContact): FamilySafetyStatus => marks[c.id]?.status ?? "unknown";
  const counts = contacts.reduce(
    (acc, c) => { acc[statusOf(c)] += 1; return acc; },
    { safe: 0, unaccounted: 0, unknown: 0 } as Record<FamilySafetyStatus, number>
  );

  function statusLabel(s: FamilySafetyStatus) {
    return s === "safe" ? T.safe : s === "unaccounted" ? T.unacc : T.unknown;
  }

  function copyStatus() {
    const head = lang === "ta" ? "👪 குடும்ப பாதுகாப்பு நிலை — Nivarana" : "👪 FAMILY SAFETY STATUS — Nivarana";
    const when = lang === "ta" ? "சரிபார்க்கப்பட்டது" : "Checked";
    const lines = contacts.map((c) => `${statusLabel(statusOf(c))} — ${c.name}${c.relation ? ` (${c.relation})` : ""}`);
    const text = [head, `${when} ${new Date().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}`, "", ...lines].join("\n");
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  if (contacts.length === 0) {
    return (
      <Card>
        <p className="text-sm text-soot">
          {T.empty}
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <p className="text-sm text-faint">
        {T.intro}
      </p>
      <p className="mt-2 text-sm font-semibold text-ink">
        {T.summary(counts.safe, counts.unaccounted, counts.unknown)}
      </p>
      <ul className="mt-3 divide-y divide-line">
        {contacts.map((c) => {
          const s = statusOf(c);
          const at = marks[c.id]?.at;
          return (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div>
                <p className="text-sm font-semibold text-ink">{c.name} <span className="font-normal text-faint">{c.relation && `· ${c.relation}`}</span></p>
                <p className="text-xs text-faint">
                  {statusLabel(s)}{at ? ` · ${T.marked} ${new Date(at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}` : ""}
                </p>
              </div>
              <div className="flex gap-1.5">
                {(["safe", "unaccounted", "unknown"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => mark(c.id, opt)}
                    aria-pressed={s === opt}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-bold ${
                      s === opt
                        ? opt === "safe" ? "bg-moss text-white" : opt === "unaccounted" ? "bg-alarm text-white" : "bg-ink text-cream"
                        : "border border-line bg-paper text-soot hover:border-ink"
                    }`}
                  >
                    {opt === "safe" ? T.btnSafe : opt === "unaccounted" ? T.btnLost : T.btnUnknown}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <button onClick={copyStatus} className={btnGhost + " mt-3"}>
        {copied ? T.copied : T.copy}
      </button>
    </Card>
  );
}
