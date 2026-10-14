"use client";
import { useMemo, useState } from "react";
import { btnGhost, btnPrimary, Card, EmptyState, Field, inputCls, SectionHead, timeAgo } from "@/components/ui";
import { KEYS, load, save, uid, useLocalStorage } from "@/lib/store";
import { buildDispatchText } from "@/lib/share";
import type { HelpNeed, HelpRequest, Incident, Shelter, Volunteer } from "@/lib/types";

const NEEDS: Record<HelpNeed, string> = {
  rescue: "Rescue", food: "Food", water: "Drinking water", medical: "Medical", shelter: "Shelter", power: "Power / charging", other: "Other",
};
const SKILLS = ["Boat / vehicle", "First aid", "Cooking", "Driving", "Translation", "Elderly care", "Electrical", "Other"];

// Which volunteer skills are most useful for each kind of help request.
const NEED_SKILLS: Record<HelpNeed, string[]> = {
  rescue: ["Boat / vehicle", "First aid", "Driving"],
  food: ["Cooking", "Driving"],
  water: ["Driving"],
  medical: ["First aid", "Elderly care"],
  shelter: ["Elderly care", "Translation"],
  power: ["Electrical"],
  other: [],
};
function skillFits(need: HelpNeed, skills: string[]): boolean {
  return NEED_SKILLS[need].some((s) => skills.includes(s));
}

// Match volunteers to requests by area, so neighbours can actually find each
// other. Fuzzy on purpose: free-text areas ("Velachery", "velachery main rd").
function normArea(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}
function areaMatches(a: string, b: string): boolean {
  const x = normArea(a), y = normArea(b);
  return x.length > 2 && y.length > 2 && (x.includes(y) || y.includes(x));
}

export default function Volunteers() {
  const [tab, setTab] = useState<"help" | "volunteer">("help");
  const [requests, setRequests] = useLocalStorage<HelpRequest[]>(KEYS.helpRequests, []);
  const [volunteers, setVolunteers] = useLocalStorage<Volunteer[]>(KEYS.volunteers, []);
  const [search, setSearch] = useState("");

  // help-request form
  const [need, setNeed] = useState<HelpNeed>("rescue");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [people, setPeople] = useState("1");
  const [note, setNote] = useState("");
  // volunteer form
  const [vName, setVName] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vArea, setVArea] = useState("");
  const [vSkills, setVSkills] = useState<string[]>([]);

  const open = useMemo(() => requests.filter((r) => r.status !== "resolved").sort((a, b) => b.createdAt - a.createdAt), [requests]);
  const done = useMemo(() => requests.filter((r) => r.status === "resolved").sort((a, b) => b.createdAt - a.createdAt), [requests]);
  const [copiedDispatch, setCopiedDispatch] = useState(false);

  // Coordinator sit-rep: one copyable message for a WhatsApp volunteer group.
  async function copyDispatch() {
    const incidents = load<Incident[]>(KEYS.incidents, []).filter(
      (i) => i.status === "active" && (i.severity === "critical" || i.severity === "high")
    );
    const shelters = load<Shelter[]>(KEYS.shelters, []).filter(
      (s) => (s.occupancy === "space" || s.occupancy === "filling" || !s.occupancy)
    );
    const text = buildDispatchText({
      requests: open.map((r) => ({ need: NEEDS[r.need], area: r.area, people: r.people, claimedBy: r.claimedBy })),
      incidents: incidents.map((i) => ({ label: i.type, severity: i.severity, area: i.area })),
      shelterSpace: shelters.slice(0, 8).map((s) => ({ name: s.name, area: s.area })),
      when: new Date(),
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopiedDispatch(true);
      setTimeout(() => setCopiedDispatch(false), 2000);
    } catch {
      setCopiedDispatch(false);
    }
  }

  // Duplicate-rescue-trip guard (from Houston's uncoordinated-duplicate-response
  // lesson): if a similar open request already covers this area + need, warn
  // before posting so volunteers don't drive to the same house twice.
  const possibleDupes = useMemo(
    () =>
      open.filter(
        (r) => r.need === need && area.trim().length > 2 && areaMatches(area, r.area)
      ),
    [open, need, area]
  );

  function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !area.trim()) return;
    setRequests([{ id: uid("hr"), need, name: name.trim(), phone: phone.trim(), area: area.trim(), people: Math.max(1, parseInt(people, 10) || 1), note: note.trim(), status: "open", createdAt: Date.now() }, ...requests]);
    setName(""); setPhone(""); setArea(""); setPeople("1"); setNote("");
  }
  function setStatus(id: string, status: HelpRequest["status"]) {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status } : r)));
  }
  // Stale requests rot: a 3-day-old "rescue" plea that was quietly handled
  // still sends volunteers to the door. Past 48h, the board asks for a
  // one-tap re-confirm instead of letting it linger.
  function reconfirm(id: string) {
    setRequests(requests.map((r) => (r.id === id ? { ...r, createdAt: Date.now() } : r)));
  }

  // --- Safety-checked claim flow -------------------------------------------
  // From the CrowdSource Rescue lesson: volunteers should NOT self-deploy into
  // tasks they're not trained/equipped for. Every claim requires a safety
  // checklist, and one volunteer can hold at most 2 active assignments.
  const SAFETY_ITEMS = [
    "I am trained and equipped for this task — I won't improvise a rescue",
    "I will NOT enter fast-moving or chest-deep water",
    "Someone knows where I'm going, or I'm going with a buddy",
    "My phone is charged and I'll keep reporting back",
  ];
  const [claimId, setClaimId] = useState<string | null>(null);
  const [claimName, setClaimName] = useState("");
  const [claimPhone, setClaimPhone] = useState("");
  const [claimChecks, setClaimChecks] = useState<string[]>([]);
  const [claimError, setClaimError] = useState("");

  function openClaim(id: string) {
    const saved = load<{ name: string; phone: string } | null>(KEYS.claimIdentity, null);
    if (saved) {
      setClaimName(saved.name);
      setClaimPhone(saved.phone);
    }
    setClaimChecks([]);
    setClaimError("");
    setClaimId(id);
  }

  function confirmClaim() {
    if (!claimId || !claimName.trim() || !claimPhone.trim()) {
      setClaimError("Add your name and phone so the household knows who's coming.");
      return;
    }
    if (claimChecks.length < SAFETY_ITEMS.length) {
      setClaimError("Tick every safety item — they're there to keep you alive.");
      return;
    }
    const active = requests.filter((r) => r.status === "in-progress" && r.claimedPhone === claimPhone.replace(/\D/g, "")).length;
    if (active >= 2) {
      setClaimError("You already hold 2 active assignments. Finish or hand one off before taking another.");
      return;
    }
    setRequests(requests.map((r) =>
      r.id === claimId ? { ...r, status: "in-progress", claimedBy: claimName.trim(), claimedPhone: claimPhone.replace(/\D/g, "") } : r
    ));
    save(KEYS.claimIdentity, { name: claimName.trim(), phone: claimPhone.trim() });
    setClaimId(null);
  }
  function submitVolunteer(e: React.FormEvent) {
    e.preventDefault();
    if (!vName.trim() || !vPhone.trim()) return;
    setVolunteers([{ id: uid("v"), name: vName.trim(), phone: vPhone.trim(), area: vArea.trim(), skills: vSkills, available: true, createdAt: Date.now() }, ...volunteers]);
    setVName(""); setVPhone(""); setVArea(""); setVSkills([]);
  }
  function toggleAvail(id: string) {
    setVolunteers(volunteers.map((v) => (v.id === id ? { ...v, available: !v.available } : v)));
  }

  return (
    <div>
      <SectionHead title="Help & volunteers" sub="Neighbours helping neighbours — the fastest rescue network there is." />
      <div className="mb-5 flex gap-2">
        {(["help", "volunteer"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-4 py-2 text-sm font-semibold ${tab === t ? "bg-ink text-cream" : "border border-line bg-cream text-soot"}`}>
            {t === "help" ? `🙏 Ask for help (${open.length})` : `🤝 Volunteer (${volunteers.filter((v) => v.available).length} available)`}
          </button>
        ))}
        <button onClick={copyDispatch} className="ml-auto rounded-md border border-line bg-cream px-4 py-2 text-sm font-semibold text-soot hover:bg-sand">
          {copiedDispatch ? "✓ Copied sit-rep" : "📋 Copy sit-rep"}
        </button>
      </div>

      {tab === "help" ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2 h-fit">
            <h3 className="font-display text-lg font-bold text-ink">Post a help request</h3>
            {possibleDupes.length > 0 && (
              <div className="mt-3 rounded-md border border-gold/40 bg-gold/10 px-3 py-2.5">
                <p className="text-xs font-bold text-gold">⚠ {possibleDupes.length} similar open request{possibleDupes.length === 1 ? "" : "s"} in this area</p>
                <p className="mt-1 text-xs text-soot">
                  {possibleDupes.map((r) => `${NEEDS[r.need]} in ${r.area} (${timeAgo(r.createdAt)})`).join(" · ")}
                </p>
                <p className="mt-1 text-xs text-soot">If that's the same household, call them instead of posting a duplicate — it keeps volunteers from driving to the same door twice.</p>
              </div>
            )}
            <form onSubmit={submitRequest} className="mt-3 space-y-3">
              <Field label="I need"><select className={inputCls} value={need} onChange={(e) => setNeed(e.target.value as HelpNeed)}>{(Object.keys(NEEDS) as HelpNeed[]).map((n) => <option key={n} value={n}>{NEEDS[n]}</option>)}</select></Field>
              <Field label="Your name *"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone"><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
                <Field label="People"><input className={inputCls} type="number" min={1} value={people} onChange={(e) => setPeople(e.target.value)} /></Field>
              </div>
              <Field label="Area *"><input className={inputCls} value={area} onChange={(e) => setArea(e.target.value)} placeholder="Street, landmark" required /></Field>
              <Field label="Details"><textarea className={inputCls} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Floor, access info, urgency…" /></Field>
              <button className={`${btnPrimary} w-full`}>Post request</button>
            </form>
          </Card>
          <div className="lg:col-span-3 space-y-3">
            {open.length === 0 && <EmptyState title="No open requests" body="Quiet right now. When someone nearby needs help, it'll appear here." />}
            {open.map((r) => (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">{NEEDS[r.need]} — {r.area}</p>
                    <p className="text-sm text-soot">{r.name} · {r.people} {r.people === 1 ? "person" : "people"}{r.note && ` · ${r.note}`}</p>
                    <p className="text-xs text-faint">{timeAgo(r.createdAt)} · {r.status === "open" ? "🟠 open" : r.status === "in-progress" ? `🔵 ${r.claimedBy ? `${r.claimedBy} is on it` : "someone is on it"}` : "resolved"}</p>
                    {Date.now() - r.createdAt > 48 * 3600 * 1000 && (
                      <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-gold">
                        ⏳ {timeAgo(r.createdAt)} old — still needed?
                        <button
                          onClick={() => reconfirm(r.id)}
                          className="rounded-md border border-gold/50 bg-gold/10 px-2 py-0.5 text-xs font-bold text-gold hover:bg-gold/20"
                        >
                          Still needed
                        </button>
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.phone && <a href={`tel:${r.phone.replace(/\D/g, "")}`} className="rounded-md bg-signal px-3 py-1.5 text-xs font-bold text-white">Call</a>}
                  {r.status === "open" && <button onClick={() => openClaim(r.id)} className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold">I'm helping</button>}
                  {r.status === "in-progress" && <button onClick={() => setStatus(r.id, "resolved")} className="rounded-md border border-moss bg-moss/10 px-3 py-1.5 text-xs font-bold text-moss">Mark resolved</button>}
                </div>
                {(() => {
                  const matchVols = volunteers
                    .filter((v) => v.available && areaMatches(v.area, r.area))
                    .sort((a, b) => Number(skillFits(r.need, b.skills)) - Number(skillFits(r.need, a.skills)));
                  return matchVols.length > 0 ? (
                    <div className="mt-3 rounded-md border border-moss/30 bg-moss/10 px-3 py-2">
                      <p className="text-xs font-bold text-moss">🤝 {matchVols.length} volunteer{matchVols.length === 1 ? "" : "s"} in the same area — call directly</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {matchVols.map((v) => (
                          <a key={v.id} href={`tel:${v.phone.replace(/\D/g, "")}`} className="rounded-md border border-moss/40 bg-cream px-2.5 py-1 text-xs font-semibold text-ink hover:bg-sand">
                            📞 {v.name}{skillFits(r.need, v.skills) ? " ⭐" : ""}{v.skills.length > 0 ? ` · ${v.skills.slice(0, 2).join(", ")}` : ""}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </Card>
            ))}
            {done.length > 0 && <p className="pt-2 text-xs text-faint">✓ {done.length} request{done.length === 1 ? "" : "s"} resolved by neighbours.</p>}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2 h-fit">
            <h3 className="font-display text-lg font-bold text-ink">Register as volunteer</h3>
            <form onSubmit={submitVolunteer} className="mt-3 space-y-3">
              <Field label="Your name *"><input className={inputCls} value={vName} onChange={(e) => setVName(e.target.value)} required /></Field>
              <Field label="Phone *"><input className={inputCls} value={vPhone} onChange={(e) => setVPhone(e.target.value)} required /></Field>
              <Field label="Area"><input className={inputCls} value={vArea} onChange={(e) => setVArea(e.target.value)} placeholder="Where can you help?" /></Field>
              <Field label="Skills">
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((s) => (
                    <button key={s} type="button" onClick={() => setVSkills(vSkills.includes(s) ? vSkills.filter((x) => x !== s) : [...vSkills, s])}
                      className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${vSkills.includes(s) ? "border-signal bg-signal text-white" : "border-line text-soot"}`}>{s}</button>
                  ))}
                </div>
              </Field>
              <button className={`${btnPrimary} w-full`}>Join as volunteer</button>
            </form>
          </Card>
          <div className="lg:col-span-3 space-y-3">
            {/* When water is at the door you need the boat owner on your street,
                not a scroll through every volunteer — search name, area, skill. */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔎 Search volunteers — name, area or skill…"
              className={inputCls}
            />
            {volunteers.length === 0 && <EmptyState title="No volunteers yet" body="Be the first. In 2015, neighbour boats rescued more people than any agency." />}
            {(() => {
              const q = search.trim().toLowerCase();
              const shown = q
                ? volunteers.filter((v) => [v.name, v.area, v.phone, ...v.skills].join(" ").toLowerCase().includes(q))
                : volunteers;
              return (
                <>
                  {q && (
                    <p className="text-xs text-faint">
                      {shown.length} of {volunteers.length} volunteers match “{search.trim()}”
                      {shown.length === 0 && " — try an area or a skill like “boat”."}
                    </p>
                  )}
                  {shown.map((v) => (
              <Card key={v.id} className={v.available ? "" : "opacity-60"}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">{v.name} {v.available ? <span className="text-xs font-bold text-moss">· available</span> : <span className="text-xs text-faint">· unavailable</span>}</p>
                    <p className="text-sm text-faint">{v.area || "Area not set"}</p>
                    {v.skills.length > 0 && <div className="mt-1 flex flex-wrap gap-1.5">{v.skills.map((s) => <span key={s} className="rounded-sm bg-sand px-2 py-0.5 text-xs text-soot">{s}</span>)}</div>}
                  </div>
                  <div className="flex gap-2">
                    {v.available && <a href={`tel:${v.phone.replace(/\D/g, "")}`} className="rounded-md bg-signal px-3 py-1.5 text-xs font-bold text-white">Call</a>}
                    <button onClick={() => toggleAvail(v.id)} className={btnGhost + " !px-3 !py-1.5 !text-xs"}>{v.available ? "Go offline" : "Go available"}</button>
                  </div>
                </div>
                {(() => {
                  const matchReqs = open.filter((r) => areaMatches(v.area, r.area));
                  return matchReqs.length > 0 ? (
                    <div className="mt-2.5 rounded-md border border-gold/30 bg-gold/10 px-3 py-2">
                      <p className="text-xs font-bold text-gold">🙏 {matchReqs.length} open request{matchReqs.length === 1 ? "" : "s"} in {v.area || "this area"} need{v.area ? "" : "s"} you</p>
                      <p className="mt-0.5 text-xs text-soot">{matchReqs.map((r) => `${NEEDS[r.need]} (${r.people})`).join(" · ")}</p>
                    </div>
                  ) : null;
                })()}
              </Card>
                  ))}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {claimId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Claim this request">
          <Card className="w-full max-w-md">
            <h3 className="font-display text-lg font-bold text-ink">Safety check before you go</h3>
            <p className="mt-1 text-sm text-soot">
              Taking this on means a household counts on you. Confirm you're going as a coordinated volunteer — not a self-deployed risk.
            </p>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Your name *"><input className={inputCls} value={claimName} onChange={(e) => setClaimName(e.target.value)} /></Field>
                <Field label="Your phone *"><input className={inputCls} value={claimPhone} onChange={(e) => setClaimPhone(e.target.value)} /></Field>
              </div>
              <div className="space-y-2">
                {SAFETY_ITEMS.map((item) => (
                  <label key={item} className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-paper px-3 py-2.5">
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 accent-signal"
                      checked={claimChecks.includes(item)}
                      onChange={() => setClaimChecks(claimChecks.includes(item) ? claimChecks.filter((x) => x !== item) : [...claimChecks, item])}
                    />
                    <span className="text-sm text-ink">{item}</span>
                  </label>
                ))}
              </div>
              {claimError && <p className="rounded-md border border-alarm/40 bg-alarm/10 px-3 py-2 text-sm font-semibold text-alarm">{claimError}</p>}
              <div className="flex gap-2">
                <button onClick={() => setClaimId(null)} className={`${btnGhost} flex-1`}>Cancel</button>
                <button onClick={confirmClaim} className={`${btnPrimary} flex-1`}>Confirm — I'm helping</button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
