"use client";
import Link from "next/link";
import { useMemo } from "react";
import { Card, EmptyState, INCIDENT_LABELS, isStale, SectionHead, SeverityBadge, StaleBadge, timeAgo } from "@/components/ui";
import { GO_BAG_SEED } from "@/lib/data";
import { KEYS, load } from "@/lib/store";
import type { AlertItem, DocEntry, EmergencyContact, FamilyPlan, FamilySafetyMark, GoBagItem, HelpRequest, Incident, Neighbour } from "@/lib/types";

const QUICK_DIALS = [
  { num: "112", label: "Emergency" },
  { num: "108", label: "Ambulance" },
  { num: "1077", label: "Disaster helpline" },
  { num: "100", label: "Police" },
  { num: "101", label: "Fire & rescue" },
];

const QUICK = [
  { href: "/reports/new", title: "Report incident", body: "Flood, blocked drain, fallen tree…", icon: "⚠️" },
  { href: "/sos", title: "SOS / I'm safe", body: "One-tap distress or safety ping", icon: "🆘" },
  { href: "/shelters", title: "Find shelter", body: "Relief camps near you", icon: "🏠" },
  { href: "/prepare", title: "Get prepared", body: "Go-bag checklist & family plan", icon: "🎒" },
  { href: "/volunteers", title: "Help & volunteer", body: "Ask for or offer help", icon: "🤝" },
  { href: "/firstaid", title: "First aid", body: "Flood, shock, bleeding guides", icon: "⛑️" },
];

const PHASES = [
  {
    phase: "01",
    title: "Before the rains",
    items: [
      { label: "Pack your go-bag while it is still calm", href: "/prepare" },
      { label: "Fix two meeting points and an out-of-town contact", href: "/prepare" },
      { label: "Log where your documents are, with expiry dates", href: "/docs" },
      { label: "Add a watch area for your street", href: "/alerts" },
      { label: "Save emergency contacts you can call in one tap", href: "/sos" },
    ],
  },
  {
    phase: "02",
    title: "When water is rising",
    items: [
      { label: "Move valuables and documents to higher ground" },
      { label: "Switch off mains power if water enters the house" },
      { label: "Report what you see — flood, drain, manhole", href: "/reports/new" },
      { label: "Move to a relief camp if asked to evacuate", href: "/shelters" },
      { label: "Send an SOS or an “I'm Safe” ping to family", href: "/sos" },
    ],
  },
  {
    phase: "03",
    title: "After the water recedes",
    items: [
      { label: "Do not drink tap water until authorities clear it" },
      { label: "Watch for open manholes and live wires — report them", href: "/reports/new" },
      { label: "Mark your resolved reports so neighbours see the all-clear", href: "/reports" },
      { label: "Restock the go-bag and re-check document expiries", href: "/docs" },
      { label: "Offer help or register as a volunteer", href: "/volunteers" },
    ],
  },
];

export default function Home() {
  const readiness = useMemo(() => {
    const bag = load<GoBagItem[]>(KEYS.goBag, []);
    const bagDone = bag.length ? bag.filter((i) => i.done).length / bag.length : 0;
    const plan = load<FamilyPlan | null>(KEYS.familyPlan, null);
    // Plan = ½ meeting points + ½ confirmed flood-safe evacuation route.
    const planDone = plan
      ? ((plan.meetingPointHome || plan.meetingPointOutside) ? 0.5 : 0) + (plan.evacRoute && plan.evacRouteChecked ? 0.5 : 0)
      : 0;
    const contacts = load<unknown[]>(KEYS.contacts, []);
    const contactDone = Math.min(contacts.length / 2, 1);
    const watches = load<unknown[]>(KEYS.watches, []);
    const watchDone = watches.length ? 1 : 0;
    // Documents are phase-01 prep ("log where your documents are, with expiry
    // dates") but the score ignored them — vault coverage earns its pillar.
    const docsCount = load<unknown[]>(KEYS.docs, []).length;
    const docsDone = Math.min(docsCount / 3, 1);
    // An untested warning channel is not readiness: the alert dry-run is
    // phase-01 prep too — "a warning only saves lives if it reaches the phone".
    const alertTest = load<{ at: number | null; seen: boolean }>(KEYS.alertTested, { at: null, seen: false });
    const alertDone = alertTest.at != null ? 1 : 0;
    const score = Math.round(((bagDone + planDone + contactDone + watchDone + docsDone + alertDone) / 6) * 100);
    const planPct = Math.round(planDone * 100);
    return { score, bagPct: Math.round(bagDone * 100), planDone, planPct, contacts: contacts.length, watches: watches.length, docs: docsCount, alertTested: alertDone === 1 };
  }, []);

  const urgent = useMemo(() => {
    const incidents = load<Incident[]>(KEYS.incidents, []);
    return incidents
      .filter((i) => i.status === "active" && (i.severity === "critical" || i.severity === "high"))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3);
  }, []);

  const firstContact = useMemo(() => {
    const contacts = load<EmergencyContact[]>(KEYS.contacts, []);
    return contacts.length ? contacts[0] : null;
  }, []);

  const unreadAlerts = useMemo(() => {
    const alerts = load<AlertItem[]>(KEYS.alerts, []);
    return alerts.filter((a) => !a.read).length;
  }, []);

  // The people layer: unclaimed help requests + neighbours flagged needs-help.
  const peopleNeedingHelp = useMemo(() => {
    const requests = load<HelpRequest[]>(KEYS.helpRequests, []);
    const unclaimed = requests.filter((r) => r.status === "open").length;
    const neighbours = load<Neighbour[]>(KEYS.checkins, []);
    const neighbourSOS = neighbours.filter((n) => n.status === "needs-help").length;
    return { unclaimed, neighbourSOS };
  }, []);

  // Safety reminders: surface tonight's new safety layers on the dashboard —
  // the alert-setup dry-run (worthless if undiscovered) and any family member
  // marked unaccounted (worthless if buried two screens deep).
  const safetyNudges = useMemo(() => {
    // Nudges need stable unique ids — several of them point at the same
    // page (/prepare), and keying by href alone would silently drop cards.
    const out: Array<{ id: string; icon: string; text: string; href: string }> = [];
    const tested = load<{ at: number | null; seen: boolean }>(KEYS.alertTested, { at: null, seen: false });
    if (tested.at == null) {
      out.push({
        id: "alert-test",
        icon: "🔔",
        text: "You haven't tested your alert setup yet — a 30-second dry-run so your phone actually warns you at 2 AM.",
        href: "/alerts",
      });
    } else if (!tested.seen) {
      // The dry-run was run but the alert was missed: the warning channel is
      // known-broken and the phone is no safer than before the test.
      out.push({
        id: "alert-missed",
        icon: "🔔",
        text: "Your last alert test says you couldn't see the alert clearly — check your notification & battery settings, then re-test so a real warning reaches you.",
        href: "/alerts",
      });
    }
    const marks = load<Record<string, FamilySafetyMark>>(KEYS.familySafety, {});
    const unacc = Object.values(marks).filter((m) => m.status === "unaccounted").length;
    if (unacc > 0) {
      out.push({
        id: "family-unaccounted",
        icon: "⚠",
        text: `${unacc} family member${unacc === 1 ? " is" : "s are"} marked unaccounted on your safety board.`,
        href: "/sos",
      });
    }
    // The document vault is useless if an expiry slips by silently — an
    // expired insurance policy discovered after a flood is a second disaster.
    const docs = load<DocEntry[]>(KEYS.docs, []);
    const now = Date.now();
    const expiring = docs.filter((d) => {
      if (!d.expiry) return false;
      const days = Math.ceil((new Date(d.expiry).getTime() - now) / 86400000);
      return days <= 30;
    });
    if (expiring.length > 0) {
      const expired = expiring.filter((d) => Math.ceil((new Date(d.expiry).getTime() - now) / 86400000) < 0).length;
      out.push({
        id: "docs-expiry",
        icon: "📄",
        text: expired > 0
          ? `${expired} document${expired === 1 ? " has" : "s have"} expired${expiring.length > expired ? `, and ${expiring.length - expired} more expire${expiring.length - expired === 1 ? "s" : ""} within 30 days` : ""} — renew them before the flood finds the gap.`
          : `${expiring.length} document${expiring.length === 1 ? " expires" : "s expire"} within 30 days — check your vault.`,
        href: "/docs",
      });
    }
    // Go-bag contents rot too — medicines expire, batteries die, dry food
    // goes stale. Surface items past (or near) their re-check date so a
    // "packed" bag doesn't fail exactly when it's needed.
    const bag = load<GoBagItem[]>(KEYS.goBag, []);
    const bagStale = bag.filter((i) => {
      if (!i.expiry) return false;
      return Math.ceil((new Date(i.expiry + "T00:00:00").getTime() - now) / 86400000) <= 30;
    });
    if (bagStale.length > 0) {
      const bagExpired = bagStale.filter((i) => Math.ceil((new Date((i.expiry as string) + "T00:00:00").getTime() - now) / 86400000) < 0).length;
      out.push({
        id: "gobag-expiry",
        icon: "🎒",
        text: bagExpired > 0
          ? `${bagExpired} go-bag item${bagExpired === 1 ? "" : "s"} past ${bagExpired === 1 ? "its" : "their"} re-check date${bagStale.length > bagExpired ? `, ${bagStale.length - bagExpired} more due within 30 days` : ""} — rotate meds, check batteries, replace stale food.`
          : `${bagStale.length} go-bag item${bagStale.length === 1 ? "" : "s"} due for a re-check within 30 days — medicines, batteries and dry food go stale silently.`,
        href: "/prepare",
      });
    }
    // Evacuation drills rot: the /prepare copy asks for one a month before the
    // monsoon — a family that rehearsed months ago will improvise in panic.
    const runs = load<Array<{ completedAt: number }>>(KEYS.drills, []);
    const lastDrill = runs.length ? Math.max(...runs.map((r) => r.completedAt)) : null;
    if (lastDrill == null) {
      out.push({
        id: "drill-never",
        icon: "⏱️",
        text: "You've never run the 60-second evacuation drill — rehearsed calm beats panicked improvisation when water enters the home.",
        href: "/prepare",
      });
    } else {
      const drillDays = Math.floor((Date.now() - lastDrill) / 86400000);
      if (drillDays > 30) {
        out.push({
          id: "drill-stale",
          icon: "⏱️",
          text: `Your last evacuation drill was ${drillDays} days ago — the monthly rhythm has slipped. Re-run the 60-second drill so it stays muscle memory.`,
          href: "/prepare",
        });
      }
    }
    // Backups rot too: a backup from last monsoon doesn't know this year's
    // contacts, routes and medical notes. Everything is on-device — if the
    // phone is lost in the water with no recent backup, the plan is gone.
    const backup = load<{ at: number | null }>(KEYS.backupTaken, { at: null });
    if (backup.at == null) {
      out.push({
        id: "backup-never",
        icon: "💾",
        text: "You've never downloaded a backup — everything Nivarana knows is on this phone. One lost phone in floodwater and it's gone; take 10 seconds in Settings.",
        href: "/settings",
      });
    } else {
      const backupDays = Math.floor((Date.now() - backup.at) / 86400000);
      if (backupDays > 30) {
        out.push({
          id: "backup-stale",
          icon: "💾",
          text: `Your last backup was ${backupDays} days ago — it doesn't know your newest contacts, routes or plans. Re-download it in Settings so a lost phone doesn't take everything.`,
          href: "/settings",
        });
      }
    }
    return out;
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-line bg-cream p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal">Flood & disaster resilience</p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Be ready before the water rises.
        </h1>
        <p className="mt-3 max-w-2xl text-soot">
          Nivarana helps your household prepare for floods and disasters, report what you see in real
          time, find shelter, and call for help — all offline, in English and தமிழ்.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/reports/new" className="rounded-md bg-signal px-5 py-2.5 text-sm font-semibold text-white hover:bg-tide">
            Report an incident
          </Link>
          <Link href="/prepare" className="rounded-md border border-line bg-paper px-5 py-2.5 text-sm font-semibold text-ink hover:bg-sand">
            Check my readiness
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-alarm/25 bg-cream p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-alarm">Get help now</p>
          <Link href="/sos" className="text-xs font-semibold text-signal hover:underline">Full SOS tools →</Link>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {QUICK_DIALS.map((d) => (
            <a
              key={d.num}
              href={`tel:${d.num}`}
              className="flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-md bg-alarm px-2 py-3 text-center text-white"
            >
              <span className="font-display text-xl font-bold leading-none">{d.num}</span>
              <span className="text-[11px] font-medium leading-tight opacity-90">{d.label}</span>
            </a>
          ))}
        </div>
        {firstContact && (
          <a
            href={`tel:${firstContact.phone}`}
            className="mt-2 flex items-center justify-between rounded-md border border-line bg-paper px-4 py-3 hover:border-signal"
          >
            <span>
              <span className="block text-sm font-bold text-ink">📞 {firstContact.name}</span>
              <span className="block text-xs text-faint">{firstContact.relation || "Emergency contact"}</span>
            </span>
            <span className="text-sm font-semibold text-signal">Call</span>
          </a>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/prepare" className="block">
          <Card className="h-full hover:border-signal">
            <p className="text-xs font-semibold uppercase tracking-wide text-faint">Readiness score</p>
            <p className="mt-1 font-display text-4xl font-bold text-ink">{readiness.score}<span className="text-lg text-faint">/100</span></p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand">
              <div className="h-full rounded-full bg-signal" style={{ width: `${readiness.score}%` }} />
            </div>
            <p className="mt-2 text-xs text-faint">
              Go-bag {readiness.bagPct}% · Family plan {readiness.planPct}% · {readiness.contacts} contacts · {readiness.watches} watch areas · {readiness.docs} docs logged · Alerts {readiness.alertTested ? "tested ✓" : "untested"}
            </p>
            <p className="mt-2 text-xs font-semibold text-signal">Improve my score →</p>
          </Card>
        </Link>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-faint">Unread alerts</p>
          <p className="mt-1 font-display text-4xl font-bold text-ink">{unreadAlerts}</p>
          <Link href="/alerts" className="mt-2 inline-block text-sm font-semibold text-signal hover:underline">
            View alerts →
          </Link>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-faint">Urgent incidents</p>
          <p className="mt-1 font-display text-4xl font-bold text-ink">{urgent.length}</p>
          <Link href="/reports" className="mt-2 inline-block text-sm font-semibold text-signal hover:underline">
            View incident board →
          </Link>
        </Card>
      </section>

      {urgent.length > 0 && (
        <section>
          <SectionHead title="Needs attention now" sub="High and critical severity reports, newest first" />
          <div className="space-y-3">
            {urgent.map((i) => (
              <Link key={i.id} href={`/reports/${i.id}`}>
                <Card className="flex items-center justify-between gap-3 hover:border-signal">
                  <div>
                    <p className="font-semibold text-ink">{INCIDENT_LABELS[i.type]} — {i.area}</p>
                    {/* The board flags 6h-old reports as possibly outdated —
                        the home cards are the ones read at 2 AM, so they
                        carry the same warning: don't panic over stale news. */}
                    {isStale(i.createdAt) && <div className="mt-1"><StaleBadge /></div>}
                    <p className="text-sm text-faint">{i.waterDepthCm != null && `≈${i.waterDepthCm} cm water · `}{i.note || "No details"} · {timeAgo(i.createdAt)}</p>
                  </div>
                  <SeverityBadge severity={i.severity} />
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(peopleNeedingHelp.unclaimed > 0 || peopleNeedingHelp.neighbourSOS > 0) && (
        <section>
          <Link href="/volunteers">
            <Card className="border-alarm/40 bg-alarm/5 hover:border-alarm">
              <p className="text-xs font-bold uppercase tracking-wide text-alarm">People need you now</p>
              <p className="mt-1 text-sm text-ink">
                {peopleNeedingHelp.unclaimed > 0 && (
                  <>🙏 <strong>{peopleNeedingHelp.unclaimed}</strong> help request{peopleNeedingHelp.unclaimed === 1 ? "" : "s"} nobody has claimed{peopleNeedingHelp.neighbourSOS > 0 && " · "}</>
                )}
                {peopleNeedingHelp.neighbourSOS > 0 && (
                  <>⚠ <strong>{peopleNeedingHelp.neighbourSOS}</strong> neighbour{peopleNeedingHelp.neighbourSOS === 1 ? "" : "s"} flagged as needing help</>
                )}
              </p>
              <p className="mt-1 text-sm font-semibold text-signal">See how you can help →</p>
            </Card>
          </Link>
        </section>
      )}

      {safetyNudges.length > 0 && (
        <section className="space-y-3">
          {safetyNudges.map((n) => (
            <Link key={n.id} href={n.href}>
              <Card className="border-gold/50 bg-gold/10 hover:border-gold">
                <p className="text-xs font-bold uppercase tracking-wide text-gold">Safety reminder</p>
                <p className="mt-1 text-sm text-ink"><span className="mr-1">{n.icon}</span>{n.text}</p>
                <p className="mt-1 text-sm font-semibold text-signal">Open it now →</p>
              </Card>
            </Link>
          ))}
        </section>
      )}

      <section>
        <SectionHead title="What do you need?" sub="Everything works offline — your data never leaves this browser" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK.map((q) => (
            <Link key={q.href} href={q.href}>
              <Card className="h-full hover:border-signal">
                <p className="text-2xl">{q.icon}</p>
                <p className="mt-2 font-semibold text-ink">{q.title}</p>
                <p className="text-sm text-faint">{q.body}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHead title="Offline by design" sub="No signal? No problem. Everything runs on this device." />
        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { t: "Reports & zones", b: "Every flood, drain and outage report lives in local storage — report and browse with zero signal." },
              { t: "Plans & contacts", b: "Go-bag, family plan, emergency contacts and documents are on-device, so they load when you need them most." },
              { t: "First aid & SOS tools", b: "Guides, quizzes, the SOS beacon and distress composer are all preloaded — no network call involved." },
              { t: "Backup anytime", b: "Settings → Download backup gives you a JSON copy of everything, in case the phone is lost." },
            ].map((f) => (
              <div key={f.t} className="rounded-md border border-line bg-paper p-3">
                <p className="text-sm font-semibold text-ink">✓ {f.t}</p>
                <p className="mt-1 text-sm text-faint">{f.b}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <EmptyState
          title="Monsoon is the deadline"
          body="Chennai's northeast monsoon arrives every October–December. A go-bag packed in 20 calm minutes beats a frantic hour when the water is at your door."
          action={
            <Link href="/prepare" className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-cream">
              Start preparing
            </Link>
          }
        />
      </section>

      <section>
        <SectionHead title="Know the phases" sub="What to do before, during, and after the water comes" />
        <div className="grid gap-3 md:grid-cols-3">
          {PHASES.map((p) => (
            <Card key={p.phase} className="flex flex-col">
              <p className="font-display text-4xl font-bold text-signal/20">{p.phase}</p>
              <p className="mt-1 font-display text-lg font-bold text-ink">{p.title}</p>
              <ul className="mt-3 space-y-2">
                {p.items.map((it) => (
                  <li key={it.label} className="flex gap-2 text-sm text-soot">
                    <span className="mt-0.5 text-signal">✓</span>
                    <span>
                      {it.label}
                      {it.href && (
                        <Link href={it.href} className="ml-1 font-semibold text-signal hover:underline">
                          →
                        </Link>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
