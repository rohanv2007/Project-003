"use client";
import { useMemo, useState } from "react";
import { btnGhost, btnPrimary, Card, EmptyState, Field, inputCls, SectionHead, timeAgo } from "@/components/ui";
import { SHELTER_SEED } from "@/lib/data";
import { KEYS, uid, useLocalStorage } from "@/lib/store";
import type { Shelter } from "@/lib/types";

const OCCUPANCY: Array<{ key: NonNullable<Shelter["occupancy"]>; label: string; cls: string }> = [
  { key: "space", label: "🟢 Has space", cls: "bg-moss/10 text-moss border-moss/30" },
  { key: "filling", label: "🟡 Filling up", cls: "bg-gold/10 text-gold border-gold/30" },
  { key: "full", label: "🔴 Full", cls: "bg-alarm/10 text-alarm border-alarm/30" },
];

function seed(): Shelter[] {
  return SHELTER_SEED.map((s, i) => ({ ...s, id: `seed-${i}` }));
}

export default function Shelters() {
  const [shelters, setShelters] = useLocalStorage<Shelter[]>(KEYS.shelters, seed);
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [capacity, setCapacity] = useState("");
  const [contact, setContact] = useState("");
  const [facilities, setFacilities] = useState("");
  const [note, setNote] = useState("");
  const [reach, setReach] = useState("");

  const filtered = useMemo(
    () => shelters.filter((s) => (q ? `${s.name} ${s.area} ${s.facilities.join(" ")} ${s.reach ?? ""}`.toLowerCase().includes(q.toLowerCase()) : true)),
    [shelters, q]
  );

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !area.trim()) return;
    setShelters([
      {
        id: uid("sh"),
        name: name.trim(),
        area: area.trim(),
        capacity: capacity ? parseInt(capacity, 10) : null,
        facilities: facilities.split(",").map((f) => f.trim()).filter(Boolean),
        contact: contact.trim(),
        note: note.trim(),
        reach: reach.trim(),
        source: "user",
      },
      ...shelters,
    ]);
    setName(""); setArea(""); setCapacity(""); setContact(""); setFacilities(""); setNote(""); setReach("");
    setAdding(false);
  }

  function remove(id: string) {
    if (window.confirm("Remove this shelter from your list?")) setShelters(shelters.filter((s) => s.id !== id));
  }

  function setOccupancy(id: string, occupancy: Shelter["occupancy"]) {
    setShelters(shelters.map((s) => (s.id === id ? { ...s, occupancy, occupancyAt: Date.now() } : s)));
  }

  return (
    <div>
      <SectionHead
        title="Relief shelters"
        sub="Where to go when home isn't safe. Confirm a camp's status by phone before heading out."
        action={<button onClick={() => setAdding(!adding)} className={btnPrimary}>+ Add shelter</button>}
      />

      {adding && (
        <Card className="mb-4">
          <form onSubmit={add} className="grid gap-4 sm:grid-cols-2">
            <Field label="Shelter name *"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Corporation school, Kotturpuram" required /></Field>
            <Field label="Area *"><input className={inputCls} value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Kotturpuram" required /></Field>
            <Field label="Capacity (people)"><input className={inputCls} type="number" min={0} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 400" /></Field>
            <Field label="Contact number"><input className={inputCls} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="e.g. 044-XXXXXXXX" /></Field>
            <div className="sm:col-span-2">
              <Field label="Facilities (comma separated)"><input className={inputCls} value={facilities} onChange={(e) => setFacilities(e.target.value)} placeholder="Drinking water, Food, Medical desk, Toilets" /></Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Note"><input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Entry from the back gate; pets allowed" /></Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="🧭 How to reach (landmark route — works without GPS)">
                <input className={inputCls} value={reach} onChange={(e) => setReach(e.target.value)} placeholder="e.g. From Kotturpuram MRTS: walk past the lake, 2nd left after the petrol bunk" />
              </Field>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className={btnPrimary}>Save shelter</button>
              <button type="button" onClick={() => setAdding(false)} className={btnGhost}>Cancel</button>
            </div>
          </form>
        </Card>
      )}

      <input className={`${inputCls} mb-4 max-w-sm`} placeholder="Search by name, area, facility…" value={q} onChange={(e) => setQ(e.target.value)} />

      {filtered.length === 0 ? (
        <EmptyState title="No shelters found" body="Add your ward's relief camp now — during a flood you won't have time to look it up." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((s) => (
            <Card key={s.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-lg font-bold text-ink">{s.name}</p>
                  <p className="text-sm text-faint">{s.area}{s.capacity != null && ` · fits ~${s.capacity}`}</p>
                  <div className="mt-1.5">
                    {s.occupancy ? (
                      <>
                        <span className={`inline-block rounded-sm border px-2 py-0.5 text-xs font-bold ${OCCUPANCY.find((o) => o.key === s.occupancy)!.cls}`}>
                          {OCCUPANCY.find((o) => o.key === s.occupancy)!.label}
                        </span>
                        {s.occupancyAt ? (
                          Date.now() - s.occupancyAt < 24 * 3600 * 1000 ? (
                            <p className="mt-1 text-[11px] text-faint">Reported {timeAgo(s.occupancyAt)}</p>
                          ) : (
                            <p className="mt-1 text-[11px] font-semibold text-gold">⚠ Reported {timeAgo(s.occupancyAt)} — call ahead, rooms may be full now</p>
                          )
                        ) : null}
                      </>
                    ) : (
                      <span className="inline-block rounded-sm border border-line bg-paper px-2 py-0.5 text-xs font-medium text-faint">
                        ⚪ Status unknown
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => remove(s.id)} className="text-xs font-semibold text-faint hover:text-alarm" title="Remove">Remove</button>
              </div>
              {s.facilities.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.facilities.map((f) => (
                    <span key={f} className="rounded-sm bg-sand px-2 py-0.5 text-xs font-medium text-soot">{f}</span>
                  ))}
                </div>
              )}
              {s.note && <p className="mt-2 text-sm text-soot">{s.note}</p>}
              {s.reach && (
                <p className="mt-2 rounded-md bg-paper px-3 py-2 text-sm text-soot">
                  <span className="font-semibold text-ink">🧭 How to reach:</span> {s.reach}
                </p>
              )}
              {s.contact && s.contact !== "—" && (
                <a href={`tel:${s.contact.replace(/\D/g, "")}`} className="mt-3 inline-block rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-bold text-ink hover:bg-sand">
                  📞 {s.contact}
                </a>
              )}
              {/* Crowdsourced room status — know before you walk there in the rain. */}
              <div className="mt-3 border-t border-line pt-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Update room status</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {OCCUPANCY.map((o) => (
                    <button
                      key={o.key}
                      onClick={() => setOccupancy(s.id, o.key)}
                      className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold ${s.occupancy === o.key ? o.cls : "border-line text-soot"}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              {s.source === "seed" && (
                <p className="mt-2 text-[11px] italic text-faint">Sample entry — verify and replace with your ward's real camp.</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
