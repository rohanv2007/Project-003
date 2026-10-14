"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, Field, inputCls, SectionHead } from "@/components/ui";
import { GO_BAG_SEED, EVAC_DRILL_STEPS, MONSOON_CALENDAR, RECOVERY_CHECKLIST } from "@/lib/data";
import { KEYS, load, uid, useLocalStorage } from "@/lib/store";
import type { EmergencyContact, EmergencyId, FamilyPlan, GoBagItem } from "@/lib/types";

export interface DrillRun {
  id: string;
  seconds: number;
  completedAt: number;
}

// The NE monsoon runs Oct–Dec in Chennai; preparedness is a season, not a
// single checklist. Month-by-month tasks, checkable, stored offline.
function MonsoonCalendar() {
  const [done, setDone] = useLocalStorage<Record<string, boolean>>("nivarana.monsoon-calendar.v1", {});
  const currentMonth = new Date().getMonth(); // 0-based: Oct=9, Nov=10, Dec=11

  function toggle(month: string, i: number) {
    const key = `${month}:${i}`;
    setDone({ ...done, [key]: !done[key] });
  }

  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-bold text-ink">🗓️ Monsoon calendar</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {MONSOON_CALENDAR.map((m, mi) => {
          const isCurrent = currentMonth === 9 + mi;
          return (
            <Card key={m.month} className={isCurrent ? "border-signal" : ""}>
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-bold text-ink">{m.month}</p>
                {isCurrent && (
                  <span className="rounded-sm bg-signal px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                    Now
                  </span>
                )}
              </div>
              <p className="text-xs text-faint">{m.window}</p>
              <ul className="mt-2 space-y-1.5">
                {m.tasks.map((t, i) => {
                  const key = `${m.month}:${i}`;
                  return (
                    <li key={i}>
                      <label className="flex cursor-pointer items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!done[key]}
                          onChange={() => toggle(m.month, i)}
                          className="mt-0.5 h-4 w-4 shrink-0"
                        />
                        <span className={done[key] ? "text-faint line-through" : "text-soot"}>{t}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function seedBag(): GoBagItem[] {
  return GO_BAG_SEED.map((s) => ({ ...s, done: false }));
}

// A guided 60-second evacuation drill: one step at a time, timed, logged.
// Red Cross's "step-by-step actionable training modules" idea — rehearsed
// calm replaces panicked improvisation when water enters the home.
function EvacDrill() {
  const [runs, setRuns] = useLocalStorage<DrillRun[]>(KEYS.drills, []);
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [startTs, setStartTs] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - startTs) / 1000)), 500);
    return () => window.clearInterval(id);
  }, [active, startTs]);

  function start() {
    setStartTs(Date.now());
    setElapsed(0);
    setStep(0);
    setActive(true);
  }

  function next() {
    if (step + 1 >= EVAC_DRILL_STEPS.length) {
      const seconds = Math.floor((Date.now() - startTs) / 1000);
      const runsNow = load<DrillRun[]>(KEYS.drills, []);
      setRuns([{ id: uid("drill"), seconds, completedAt: Date.now() }, ...runsNow].slice(0, 10));
      setActive(false);
    } else {
      setStep(step + 1);
    }
  }

  const best = runs.length ? Math.min(...runs.map((r) => r.seconds)) : null;

  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-bold text-ink">⏱️ Evacuation drill</h2>
      <Card>
        {!active ? (
          <>
            <p className="text-sm text-faint">
              Rehearse leaving your home in under a minute — {EVAC_DRILL_STEPS.length} calm steps, timed.
              Do this once a month before the monsoon; the family that has rehearsed doesn't panic.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button onClick={start} className="rounded-md bg-signal px-4 py-2.5 text-sm font-semibold text-white">
                ▶ Start 60-second drill
              </button>
              {runs.length > 0 && (
                <span className="text-xs text-faint">
                  Last: {runs[0].seconds}s · Best: {best}s · {runs.length} drill{runs.length > 1 ? "s" : ""} done
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-faint">
                Step {step + 1} of {EVAC_DRILL_STEPS.length}
              </p>
              <p className={`font-display text-2xl font-bold ${elapsed > 60 ? "text-alarm" : "text-ink"}`}>
                {elapsed}s
              </p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand">
              <div className="h-full rounded-full bg-signal" style={{ width: `${((step + 1) / EVAC_DRILL_STEPS.length) * 100}%` }} />
            </div>
            <p className="mt-3 font-display text-xl font-bold text-ink">{EVAC_DRILL_STEPS[step].step}</p>
            <p className="mt-1 text-sm text-soot">{EVAC_DRILL_STEPS[step].why}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={next} className="rounded-md bg-signal px-5 py-2.5 text-sm font-semibold text-white">
                {step + 1 >= EVAC_DRILL_STEPS.length ? "✓ Done — evacuated" : "Done — next step →"}
              </button>
              <button onClick={() => setActive(false)} className="rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-faint">
                Stop drill
              </button>
            </div>
          </>
        )}
      </Card>
    </section>
  );
}

// The second disaster: what to do after the water recedes. Ordered — safety
// (electrics, gas) before cleanup, cleanup before paperwork — stored offline.
function RecoveryChecklist() {
  const [done, setDone] = useLocalStorage<Record<number, boolean>>("nivarana.recovery.v1", {});
  const doneCount = RECOVERY_CHECKLIST.filter((_, i) => done[i]).length;

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-bold text-ink">🧹 After the water recedes</h2>
        <p className="text-xs text-faint">{doneCount}/{RECOVERY_CHECKLIST.length} done</p>
      </div>
      <Card>
        <ol className="space-y-2.5">
          {RECOVERY_CHECKLIST.map((r, i) => (
            <li key={i}>
              <label className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 ${done[i] ? "border-moss/40 bg-moss/5" : "border-line bg-paper"}`}>
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-signal"
                  checked={!!done[i]}
                  onChange={() => setDone({ ...done, [i]: !done[i] })}
                />
                <span className="flex-1">
                  <span className={`text-sm font-semibold ${done[i] ? "text-faint line-through" : "text-ink"}`}>
                    {r.danger ? "⛔ " : ""}{r.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-soot">{r.detail}</span>
                </span>
              </label>
            </li>
          ))}
        </ol>
      </Card>
    </section>
  );
}

export default function Prepare() {
  const [bag, setBag] = useLocalStorage<GoBagItem[]>(KEYS.goBag, seedBag);
  const [reviewedAt, setReviewedAt] = useLocalStorage<number | null>(KEYS.goBagReviewed, null);
  const daysSinceReview = reviewedAt ? Math.floor((Date.now() - reviewedAt) / (24 * 3600 * 1000)) : null;
  const [plan, setPlan] = useLocalStorage<FamilyPlan>(KEYS.familyPlan, {
    meetingPointHome: "", meetingPointOutside: "", outOfTownContact: "", notes: "",
    petNames: "", petPlan: "", evacRoute: "", evacRouteChecked: false, updatedAt: 0,
  });
  const [saved, setSaved] = useState(false);
  const [contacts] = useLocalStorage<EmergencyContact[]>(KEYS.contacts, []);
  const [emergencyId] = useLocalStorage<EmergencyId | null>(KEYS.emergencyId, null);

  const done = useMemo(() => bag.filter((i) => i.done).length, [bag]);
  const pct = bag.length ? Math.round((done / bag.length) * 100) : 0;

  function toggle(id: string) {
    setBag(bag.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  }
  function resetBag() {
    if (window.confirm("Uncheck every go-bag item?")) setBag(seedBag());
  }
  function shareMissing() {
    const missing = bag.filter((i) => !i.done);
    const text = missing.length
      ? `🎒 Go-bag still missing (${missing.length}):\n${missing.map((i, n) => `${n + 1}. ${i.label}`).join("\n")}\n— from Nivarana`
      : `🎒 Go-bag complete (${bag.length}/${bag.length})! Stored near the main door. — from Nivarana`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }
  function savePlan(e: React.FormEvent) {
    e.preventDefault();
    setPlan({ ...plan, updatedAt: Date.now() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <SectionHead
        title="Prepare your household"
        sub="Twenty calm minutes now beats a frantic hour when the water is at your door."
      />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ink">🎒 Go-bag checklist</h2>
          <div className="flex gap-3">
            <button onClick={shareMissing} className="text-xs font-semibold text-signal hover:underline">Share missing</button>
            <button onClick={resetBag} className="text-xs font-semibold text-faint hover:text-ink">Reset</button>
          </div>
        </div>
        <Card>
          {/* A packed go-bag goes stale: medicines expire, documents change, kids
              outgrow clothes. Nudge a 2-minute review every 30 days. */}
          {daysSinceReview === null || daysSinceReview > 30 ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-gold/40 bg-gold/10 px-3 py-2.5">
              <p className="text-sm text-ink">
                {daysSinceReview === null
                  ? "🎒 This go-bag has never been reviewed."
                  : `🎒 Go-bag not reviewed in ${daysSinceReview} days.`}{" "}
                <span className="text-soot">Medicines expire, documents change — give it a 2-minute once-over.</span>
              </p>
              <button
                onClick={() => setReviewedAt(Date.now())}
                className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-cream"
              >
                ✓ Mark as reviewed
              </button>
            </div>
          ) : (
            <p className="mb-4 text-xs text-faint">
              ✓ Go-bag reviewed {daysSinceReview === 0 ? "today" : `${daysSinceReview} day${daysSinceReview === 1 ? "" : "s"} ago`} — review again in 30 days.
            </p>
          )}
          <div className="mb-4 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-sand">
              <div className="h-full rounded-full bg-signal transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm font-bold text-ink">{done}/{bag.length}</span>
          </div>
          <ul className="divide-y divide-line">
            {bag.map((item) => {
              // FEMA/Ready Together: rotate meds and check batteries before
              // every monsoon — a packed bag with expired contents is false
              // readiness. Optional per-item re-check date, set by the user.
              const daysLeft = item.expiry
                ? Math.ceil((new Date(item.expiry + "T00:00:00").getTime() - Date.now()) / 86400000)
                : null;
              return (
                <li key={item.id} className="flex items-start justify-between gap-3 py-2.5">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggle(item.id)}
                      className="mt-1 h-5 w-5 shrink-0"
                    />
                    <span className={item.done ? "text-faint line-through" : ""}>
                      <span className="block text-sm font-semibold text-ink">{item.label}</span>
                      <span className="block text-xs text-faint">{item.detail}</span>
                      {daysLeft != null && daysLeft < 0 && (
                        <span className="mt-0.5 block text-xs font-bold text-alarm">⚠ Expired — replace this item</span>
                      )}
                      {daysLeft != null && daysLeft >= 0 && daysLeft <= 30 && (
                        <span className="mt-0.5 block text-xs font-semibold text-gold">
                          ⚠ Re-check {daysLeft === 0 ? "today" : `in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                        </span>
                      )}
                    </span>
                  </label>
                  <input
                    type="date"
                    title="Re-check by (optional) — medicines, food, batteries expire"
                    value={item.expiry ?? ""}
                    onChange={(e) =>
                      setBag(bag.map((x) => (x.id === item.id ? { ...x, expiry: e.target.value || undefined } : x)))
                    }
                    className="mt-0.5 w-32 shrink-0 rounded-md border border-line bg-paper px-1.5 py-1 text-[11px] text-faint"
                  />
                </li>
              );
            })}
          </ul>
          {pct === 100 && (
            <p className="mt-3 rounded-md bg-moss/10 px-3 py-2 text-sm font-semibold text-moss">
              Go-bag complete. Store it near your main door, above likely water level.
            </p>
          )}
        </Card>
      </section>

      <EvacDrill />

      <MonsoonCalendar />

      <RecoveryChecklist />

      <section>
        <h2 className="mb-3 font-display text-xl font-bold text-ink">👨‍👩‍👧 Family emergency plan</h2>
        <Card>
          <form onSubmit={savePlan} className="space-y-4">
            <Field label="Meeting point — right outside home">
              <input className={inputCls} value={plan.meetingPointHome}
                onChange={(e) => setPlan({ ...plan, meetingPointHome: e.target.value })}
                placeholder="e.g. the bus stop at the end of our street" />
            </Field>
            <Field label="Meeting point — outside the neighbourhood">
              <input className={inputCls} value={plan.meetingPointOutside}
                onChange={(e) => setPlan({ ...plan, meetingPointOutside: e.target.value })}
                placeholder="e.g. Guindy railway station entrance" />
            </Field>
            <Field label="Out-of-town contact (name + phone)">
              <input className={inputCls} value={plan.outOfTownContact}
                onChange={(e) => setPlan({ ...plan, outOfTownContact: e.target.value })}
                placeholder="e.g. Aunt Meena, 98XXXXXXXX" />
            </Field>
            <Field label="🛣️ Evacuation route — how do we walk out?">
              <input className={inputCls} value={plan.evacRoute ?? ""}
                onChange={(e) => setPlan({ ...plan, evacRoute: e.target.value })}
                placeholder="e.g. Left on 5th Cross, past the temple, up Mount Road — never the subway under the bridge" />
            </Field>
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-paper px-3 py-2.5">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 accent-signal"
                checked={!!plan.evacRouteChecked}
                onChange={(e) => setPlan({ ...plan, evacRouteChecked: e.target.checked })}
              />
              <span className="text-sm text-ink">I've checked this route avoids flood-prone roads, subways and low underpasses — the obvious route floods first, so we don't take it.</span>
            </label>
            <Field label="Notes (medical needs, elderly)">
              <textarea className={inputCls} rows={3} value={plan.notes}
                onChange={(e) => setPlan({ ...plan, notes: e.target.value })}
                placeholder="e.g. Grandfather needs insulin — kept in fridge door" />
            </Field>
            <Field label="🐾 Pets — names & species">
              <input className={inputCls} value={plan.petNames ?? ""}
                onChange={(e) => setPlan({ ...plan, petNames: e.target.value })}
                placeholder="e.g. Bruno (dog), Mithu (parrot)" />
            </Field>
            <Field label="🐾 Pet evacuation plan">
              <textarea className={inputCls} rows={2} value={plan.petPlan ?? ""}
                onChange={(e) => setPlan({ ...plan, petPlan: e.target.value })}
                placeholder="e.g. Carrier box in storeroom, 2 days' food in go-bag side pocket, Bruno's leash on the hook" />
            </Field>
            <div className="no-print flex flex-wrap items-center gap-3">
              <button type="submit" className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-cream">
                {saved ? "✓ Saved" : "Save plan"}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-md border border-line bg-paper px-5 py-2.5 text-sm font-semibold text-ink hover:bg-sand"
              >
                🖨 Print plan
              </button>
            </div>
            <p className="no-print text-xs text-faint">
              Red Cross guidance: pick TWO meeting places and one out-of-town contact everyone memorises.
              The printout includes a ✂ wallet card at the bottom — cut it out and keep it on paper, because a flat phone can't call anyone.
              {plan.updatedAt > 0 && ` Last updated ${new Date(plan.updatedAt).toLocaleDateString("en-IN")}.`}
            </p>
          </form>
        </Card>

        {/* Print-only summary: a one-page plan to stick on the fridge. */}
        <div className="print-only mt-6 rounded-lg border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-bold text-ink">Nivarana — Family Emergency Plan</h2>
          <p className="mt-1 text-sm text-faint">
            {plan.updatedAt > 0 ? `Saved ${new Date(plan.updatedAt).toLocaleDateString("en-IN")}` : "Not saved yet"} · Go-bag {done}/{bag.length} packed
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div><dt className="font-semibold text-ink">Meeting point — outside home</dt><dd className="mt-0.5">{plan.meetingPointHome || "—"}</dd></div>
            <div><dt className="font-semibold text-ink">Meeting point — outside neighbourhood</dt><dd className="mt-0.5">{plan.meetingPointOutside || "—"}</dd></div>
            <div><dt className="font-semibold text-ink">Evacuation route</dt><dd className="mt-0.5">{plan.evacRoute ? `${plan.evacRoute}${plan.evacRouteChecked ? " ✓ (checked — avoids flood-prone roads)" : ""}` : "—"}</dd></div>
            <div><dt className="font-semibold text-ink">Out-of-town contact</dt><dd className="mt-0.5">{plan.outOfTownContact || "—"}</dd></div>
            <div><dt className="font-semibold text-ink">Notes (medical, elderly)</dt><dd className="mt-0.5">{plan.notes || "—"}</dd></div>
            <div><dt className="font-semibold text-ink">Pets</dt><dd className="mt-0.5">{plan.petNames ? `${plan.petNames}${plan.petPlan ? ` — ${plan.petPlan}` : ""}` : "—"}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-faint">Emergency: 112 · Ambulance: 108 · Disaster helpline: 1077</p>

          {/* Paper wallet card: cut along the dashed line, keep in purse/wallet.
              Ready Together's rule — paper works when the phone is flat or dead. */}
          <div className="mt-6 border-t-2 border-dashed border-ink pt-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-faint">✂ Cut here — wallet card</p>
            <h3 className="mt-2 font-display text-xl font-bold text-ink">Nivarana — Emergency card</h3>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-ink">Family contacts</p>
                <ul className="mt-1 space-y-1">
                  {contacts.slice(0, 3).map((c) => (
                    <li key={c.id}>{c.name} — {c.phone}</li>
                  ))}
                  {contacts.length === 0 && <li className="text-faint">Add contacts in SOS → Emergency contacts</li>}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-ink">Meet here</p>
                <ul className="mt-1 space-y-1">
                  <li>Home: {plan.meetingPointHome || "—"}</li>
                  <li>Away: {plan.meetingPointOutside || "—"}</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-ink">Helplines</p>
                <p className="mt-1">112 · 108 · 1077 · 100 · 101</p>
              </div>
              <div>
                <p className="font-semibold text-ink">Blood group</p>
                <p className="mt-1">{emergencyId?.bloodGroup || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
