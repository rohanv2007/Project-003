"use client";
import { useState } from "react";
import { btnGhost, btnPrimary, Card, EmptyState, Field, inputCls, SectionHead } from "@/components/ui";
import { KEYS, uid, useLocalStorage } from "@/lib/store";
import type { DocEntry } from "@/lib/types";

const COMMON = ["Aadhaar card", "PAN card", "Passport", "Voter ID", "Driving licence", "Property documents", "Insurance policy", "Bank passbook", "Birth certificate", "Medical prescriptions"];

export default function Docs() {
  const [docs, setDocs] = useLocalStorage<DocEntry[]>(KEYS.docs, []);
  const [name, setName] = useState("");
  const [keptAt, setKeptAt] = useState("");
  const [expiry, setExpiry] = useState("");
  const [note, setNote] = useState("");

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setDocs([...docs, { id: uid("doc"), name: name.trim(), keptAt: keptAt.trim(), expiry, note: note.trim() }]);
    setName(""); setKeptAt(""); setExpiry(""); setNote("");
  }

  function daysLeft(expiry: string): number | null {
    if (!expiry) return null;
    return Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <SectionHead
        title="Document vault"
        sub="Not the documents themselves — where they are, and when they expire. After a flood, this list is gold."
      />
      <Card className="mb-5">
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-2">
          <Field label="Document *">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Insurance policy" list="common-docs" required />
            <datalist id="common-docs">{COMMON.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label="Kept at">
            <input className={inputCls} value={keptAt} onChange={(e) => setKeptAt(e.target.value)} placeholder="e.g. Blue folder, bedroom shelf" />
          </Field>
          <Field label="Expiry date"><input className={inputCls} type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} /></Field>
          <Field label="Note"><input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Renew online at…" /></Field>
          <div className="sm:col-span-2"><button className={btnPrimary}>Add document</button></div>
        </form>
      </Card>

      {docs.length === 0 ? (
        <EmptyState
          title="No documents tracked"
          body="Floods destroy paper. List where every critical document lives — and keep photocopies in your go-bag's zip-lock pouch."
        />
      ) : (
        <div className="space-y-2">
          {docs.map((d) => {
            const left = daysLeft(d.expiry);
            return (
              <Card key={d.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{d.name}</p>
                  <p className="text-sm text-faint">{d.keptAt || "Location not noted"}{d.note && ` · ${d.note}`}</p>
                  {left != null && (
                    <p className={`mt-1 text-xs font-bold ${left < 0 ? "text-alarm" : left < 90 ? "text-gold" : "text-moss"}`}>
                      {left < 0 ? `Expired ${Math.abs(left)} days ago` : left === 0 ? "Expires today" : `Expires in ${left} days`}
                    </p>
                  )}
                </div>
                <button onClick={() => setDocs(docs.filter((x) => x.id !== d.id))} className={btnGhost + " !px-3 !py-1.5 !text-xs"}>Remove</button>
              </Card>
            );
          })}
        </div>
      )}
      <p className="mt-4 rounded-md bg-paper p-3 text-xs text-faint">
        Tip: photograph every document and keep the photos in a separate phone or cloud folder — paper originals stay in the zip-lock pouch in your go-bag.
      </p>
    </div>
  );
}
