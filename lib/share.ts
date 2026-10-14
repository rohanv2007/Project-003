// Project 003 · Nivarana — bilingual share-text builders (EN + Tamil)

export function buildSosText(opts: {
  name: string;
  area: string;
  need: string;
  phone: string;
  lang: "en" | "ta";
  coords?: { lat: number; lon: number } | null;
}): string {
  const { name, area, need, phone } = opts;
  const maps = opts.coords
    ? `https://maps.google.com/?q=${opts.coords.lat.toFixed(6)},${opts.coords.lon.toFixed(6)}`
    : "";
  if (opts.lang === "ta") {
    return (
      `🆘 அவசர உதவி தேவை!\n` +
      `பெயர்: ${name}\n` +
      `இடம்: ${area}\n` +
      (maps ? `என் இருப்பிடம்: ${maps}\n` : "") +
      `தேவை: ${need}\n` +
      `தொடர்பு: ${phone}\n\n` +
      `அருகில் இருப்பவர்கள் உடனே உதவவும். — Nivarana`
    );
  }
  return (
    `🆘 EMERGENCY — help needed!\n` +
    `Name: ${name}\n` +
    `Location: ${area}\n` +
    (maps ? `My GPS location: ${maps}\n` : "") +
    `Need: ${need}\n` +
    `Contact: ${phone}\n\n` +
    `If you are nearby, please help immediately. — Nivarana`
  );
}

export function buildSafeText(opts: { name: string; area: string; lang: "en" | "ta" }): string {
  const { name, area } = opts;
  if (opts.lang === "ta") {
    return `✅ நான் பாதுகாப்பாக இருக்கிறேன். ${name} — ${area}. கவலை வேண்டாம். — Nivarana`;
  }
  return `✅ I'm safe. ${name} — ${area}. No need to worry. — Nivarana`;
}

// Coordinator sit-rep: a pasteable WhatsApp dispatch of everything open right
// now, grouped so a group admin can broadcast one message to a volunteer group.
export function buildDispatchText(opts: {
  requests: Array<{ need: string; area: string; people: number; claimedBy?: string }>;
  incidents: Array<{ label: string; severity: string; area: string }>;
  shelterSpace: Array<{ name: string; area: string; occupancy?: string }>;
  when: Date;
}): string {
  const lines: string[] = [`📋 NIVARANA SIT-REP — ${opts.when.toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}`];
  if (opts.requests.length) {
    lines.push("", `🙏 OPEN HELP REQUESTS (${opts.requests.length})`);
    for (const r of opts.requests) {
      lines.push(`• ${r.need} — ${r.area} (${r.people})${r.claimedBy ? ` → ${r.claimedBy} on it` : " → nobody claimed yet"}`);
    }
  } else {
    lines.push("", "🙏 No open help requests. Quiet right now.");
  }
  if (opts.incidents.length) {
    lines.push("", `⚠️ URGENT INCIDENTS (${opts.incidents.length})`);
    for (const i of opts.incidents) lines.push(`• ${i.label} — ${i.area} (${i.severity})`);
  }
  if (opts.shelterSpace.length) {
    lines.push("", `🏕️ SHELTERS WITH ROOM (${opts.shelterSpace.length})`);
    for (const s of opts.shelterSpace) lines.push(`• ${s.name}, ${s.area}`);
  }
  lines.push("", "Volunteers: claim via the app, go in pairs, don't enter fast water. — Nivarana");
  return lines.join("\n");
}

export function buildIncidentText(opts: {
  typeLabel: string;
  severity: string;
  area: string;
  note: string;
  coords?: { lat: number; lon: number } | null;
}): string {
  const maps = opts.coords
    ? `https://maps.google.com/?q=${opts.coords.lat.toFixed(6)},${opts.coords.lon.toFixed(6)}`
    : "";
  return (
    `⚠️ ${opts.typeLabel} reported in ${opts.area} (severity: ${opts.severity}).\n` +
    (opts.note ? `${opts.note}\n` : "") +
    (maps ? `Exact spot: ${maps}\n` : "") +
    `Avoid the area if possible. — Nivarana`
  );
}

// Zone snapshot: a pasteable one-message street report — which areas are
// affected, how deep, whether the water is receding, and how fresh the
// signal is — for sharing in a neighbourhood WhatsApp group at 2 AM.
export function buildZoneSummaryText(zones: Array<{
  area: string;
  worst: string;
  count: number;
  maxDepth: number | null;
  receding: boolean;
  stale: boolean;
}>): string {
  const lines: string[] = ["🗺️ NIVARANA ZONE SNAPSHOT"];
  for (const z of zones) {
    const bits: string[] = [`${z.worst.toUpperCase()}`];
    if (z.maxDepth != null) bits.push(`deepest ≈${z.maxDepth} cm`);
    bits.push(`${z.count} report${z.count === 1 ? "" : "s"}`);
    let line = `• ${z.area}: ${bits.join(" · ")}`;
    if (z.receding) line += " — 🌊 receding";
    if (z.stale) line += " (⚠ signal >24h old — verify before travelling)";
    lines.push(line);
  }
  lines.push("", "Reported by neighbours in Nivarana. Conditions change fast — verify on the ground. — Nivarana");
  return lines.join("\n");
}

export function whatsappUrl(text: string, phone = ""): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function smsUrl(text: string, phone = ""): string {
  return `sms:${phone}?body=${encodeURIComponent(text)}`;
}
