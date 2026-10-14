# CYCLES.md — Project 003 · Nivarana (append-only build log)

## Cycle 1 — 23:20 IST
- Kickoff scaffold: Next.js 15 + React 19 + TypeScript + Tailwind 3 in `~/workspace/nightly-builds/2026-10-13/`; FixMyCampus editorial theme (paper/cream/sand, Fraunces display + Space Grotesk, deep teal accent); SiteHeader with mobile nav, home dashboard with computed readiness score (go-bag + family plan + contacts + watches), unread alerts + urgent incidents cards, quick-action grid, monsoon CTA. Core lib: types, localStorage store + hooks, curated data (helplines, go-bag, first-aid, shelters), bilingual share-text builders (EN/தமிழ்). PROJECT_BRIEF.md + CYCLES.md written; project number 003 confirmed from tracker (max was 2).
- Deployed: no

## Cycle 2 — 23:28 IST
- Incident reporting system: `/reports/new` form with RiskMap-style category picker (flood, waterlogging, blocked drain, open manhole, fallen tree, power outage, receding, other), 4-level severity, area/ward, water-depth field for flood types, reporter name; `/reports` board with type/severity/search filters, show-resolved toggle, per-report "I see this too" confirmations, mark resolved/reopen, WhatsApp share via bilingual-ready text. Empty state with CTA.
- Deployed: no

## Cycle 3 — 23:36 IST
- Zone severity view `/zones`: aggregates active incidents by area, colours each zone card by its worst severity, shows type chips + latest timestamp; historically flood-prone areas (2015/2023) listed with "no active reports" state and CTAs to set watches / pack go-bag.
- Deployed: no

## Cycle 4 — 23:42 IST
- Prepare page `/prepare`: go-bag checklist (12 NDMA/FEMA-style items with details, progress bar, reset, completion banner) + family emergency plan form (two meeting points, out-of-town contact, medical/pet notes) with saved state — all in localStorage, feeds the home readiness score.
- Deployed: no

## Cycle 5 — 23:48 IST
- Shelter directory `/shelters`: search across name/area/facilities, facility chips, capacity, tel: call buttons, add-shelter form (name, area, capacity, contact, facilities, note), remove; 3 clearly-labelled sample entries to replace with real ward camps.
- Deployed: no

## Cycle 6 — 23:55 IST
- SOS & safety page `/sos`: distress-signal composer (name/area/phone/need) generating bilingual (EN/தமிழ்) SOS text with WhatsApp/SMS/copy actions; one-tap "I'm Safe" broadcast (Red Cross insight) with recent-pings log; real helplines grid (112, 1077, 108, 100, 101, 1913) with tel: links; personal emergency-contacts manager with call/WhatsApp buttons. Profile persists for reuse.
- Deployed: no

## Cycle 7 — 00:02 IST
- Help & volunteers `/volunteers`: two-tab layout — help-request board (need type, name, phone, area, people, details; status workflow open → in-progress → resolved with call buttons) and volunteer registry (name, phone, area, skill chips, availability toggle, call buttons). Empty states reference the 2015 neighbour-boat rescues.
- Deployed: no

## Cycle 8 — 00:09 IST
- Alerts `/alerts`: watch-area manager with flood-prone-area datalist suggestions; alerts matched against watches get a highlighted section; 2 seeded IMD-style sample alerts; mark-read / mark-all-read; unread count feeds the home dashboard card.
- Deployed: no

## Cycle 9 — 00:14 IST
- Document vault `/docs`: track where each critical document is kept + expiry dates with colour-coded warnings (expired / <90 days / ok), common-document datalist, remove; flood-specific tip about zip-lock pouch. First-aid quick guides `/firstaid`: 5 preloaded offline guides (flood-water rescue, hands-only CPR, severe bleeding, electric shock, choking) as expandable cards with numbered steps + warnings.
- Deployed: no

## Cycle 10 — 00:19 IST
- Settings `/settings`: full JSON backup download (all localStorage keys), restore-from-file import, delete-all-data danger zone, about card with 112 reminder. Header nav extended to all 10 sections (desktop + scrollable mobile nav). Full build green: 15 routes.
- Deployed: no

## Cycle 11 — 23:48 IST
- Incident detail view `/reports/[id]`: full report page — type, severity badge, area/ward, water depth, reporter, note, full timestamp + relative time, confirmation count; actions "I see this too", WhatsApp share, mark resolved/reopen, back-to-board link; friendly not-found state. Board card titles now link to the detail page. Build green: 16 routes.
- Deployed: no

## Cycle 12 — 23:50 IST
- Installable-app polish: `app/manifest.ts` (name, theme colour #0f6f6a, standalone display, portrait), hand-drawn `app/icon.svg` (deep-teal serif "N" with wave motif), layout metadata gains `themeColor` + Apple web-app capable. Strengthens the "install it on your phone, use it offline" story. Build green: 16 routes + manifest + icon.
- Deployed: no

## Cycle 13 — 23:51 IST
- Home "Know the phases" timeline: Before / During / After the flood action cards — 5 concrete NDMA/FEMA-style actions per phase, each deep-linking into the relevant Nivarana section (go-bag, watches, docs, SOS, shelters, reports, volunteers). Pure static content, fully offline. Build green.
- Deployed: no

## Cycle 14 — 00:22 IST
- Incident board sort control: "Newest first" vs "Most severe first" toggle — critical reports surface to the top during active flooding (ties broken by recency). Build green: 16 routes.
- Deployed: no

## Cycle 15 — 00:28 IST
- SOS page gains "Attach my GPS location": one-tap browser geolocation (works offline, no mobile data needed) embeds a Google Maps link + coordinates into the bilingual SOS text for WhatsApp/SMS/copy — rescuers can open the sender's exact position. Graceful denial/error states. Build green: 16 routes.
- Deployed: no

## Cycle 16 — 00:33 IST
- Home "Needs attention now" urgent cards now link straight to each report's detail page (`/reports/[id]`) instead of the generic board — one less tap in a crisis, uses the detail view built in Cycle 11. Build green: 16 routes.
- Deployed: no

## Cycle 17 — 00:48 IST
- Language preference: Settings gains the promised "Language · மொழி" toggle (English / தமிழ்) persisted to the previously unused `nivarana.lang.v1` key; the SOS page's language choice now reads/writes that same key via `useLocalStorage` (SSR-safe load pattern), so picking தமிழ் for a distress signal sticks across visits instead of resetting to English every time.
- Deployed: no

## Cycle 18 — 00:49 IST
- Backup import validation: restoring a backup now verifies the file is actually a Nivarana backup (checks the `app: "nivarana"` envelope and that at least one known section is present) and shape-checks every section before writing — list sections must be arrays, family plan / profile must be objects, language must be en/ta. Damaged sections are skipped and counted, and the status message now reports restored vs skipped counts instead of silently accepting any JSON with matching keys.
- Deployed: no

## Cycle 19 — 00:51 IST
- GPS attach on incident reports: the report form gains the same one-tap GPS capture the SOS page got in Cycle 15 (works offline, graceful denial), stored as optional lat/lon on the Incident type (backward-compatible with existing reports). The report detail page shows an "Open exact location in Maps" link with coordinates, and the WhatsApp share text embeds the maps link — volunteers and rescuers can find the exact reported spot, not just a street name.
- Deployed: no

## Cycle 20 — 01:20 IST
- Simple mode for elders & low-vision users (researched insight: elderly emergency-app usability = large touch targets, high readability, pictogram-assisted text, one-tap actions): Settings gains a "🔎 Simple mode" switch persisted to the new `nivarana.ui.simple.v1` key; a `SimpleModeMount` client component in the root layout re-applies it on every page load; `html.simple-mode` bumps the root font size so the whole rem-based UI scales proportionally, with enlarged checkboxes. Backup/restore covers the new key automatically.
- Deployed: no

## Cycle 21 — 01:32 IST
- Stale-report flagging: flood conditions change fast, so active reports older than 6 hours now carry a "⚠ May be outdated" badge (new `isStale`/`StaleBadge` helpers in `components/ui.tsx`) on the incident board and the report detail page, with a tooltip explaining conditions may have changed — flagged, never hidden.
- Deployed: no

## Cycle 22 — 01:40 IST
- Home "Get help now" quick-dial strip right under the hero: three large one-tap dial buttons (112 Emergency, 108 Ambulance, 1077 Disaster helpline) plus the user's first saved emergency contact with a call row, linking to the full SOS page — fewer taps between panic and help.
- Deployed: no

## Cycle 23 — 01:18 IST (watchdog recovery)
- Volunteer ↔ help-request area matching on `/volunteers`: each open help request now shows available volunteers registered in the same area (fuzzy area match, tel: tap-to-call buttons), and each volunteer card shows open requests in their area with the need types — closes the coordination gap from the brief (neighbours with boats/supplies finding families who need rescue). Build green: 16 routes.
- Deployed: no

## Cycle 24 — 01:21 IST (watchdog recovery)
- First-aid self-test quiz on `/firstaid` (fulfils the home page's "Guides, quizzes" copy): 5 multiple-choice questions drawn from the preloaded guides, one per topic, with instant per-answer feedback + explanation, end-of-quiz score with a re-read nudge, and a retake button. Question bank added to `lib/data.ts` (`FIRST_AID_QUIZ`), `QuizQuestion` type in `lib/types.ts`. Fully offline, minimal styling per the editorial system. Build green: 16 routes.
- Deployed: no

## Cycle 25 — 01:47 IST
- Zones page depth awareness: each zone card now shows the deepest reported water depth (max of `waterDepthCm` across its active reports) and a green "Water reported receding here" banner when any report in the zone is the `receding` type — travellers get the trend, not just the worst severity.
- Deployed: no

## Cycle 26 — 01:55 IST
- Printable family plan: the Prepare page gains a "🖨 Print plan" button and a print-only one-page summary (meeting points, out-of-town contact, medical/pet notes, go-bag progress, helplines) styled for paper; print CSS hides the app chrome. Stick it on the fridge before the monsoon.
- Deployed: no

## Cycle 27 — 02:01 IST
- Go-bag "Share missing" button: composes a WhatsApp message listing every unchecked item (or a completion note when the bag is full) — one tap to send the shopping/packing list to family.
- Deployed: no

## Cycle 28 — 02:08 IST
- Skill-aware volunteer matching: each help need now maps to the most useful volunteer skills (rescue → boat/driving/first-aid, medical → first-aid/elderly-care, power → electrical…). In the request card, volunteers whose skills fit the request rank first and get a ⭐ badge with an explanatory tooltip, so a medical request reaches the first-aider, not just the nearest neighbour.
- Deployed: no

## Cycle 29 — 02:15 IST
- First-aid sticky emergency bar: a persistent "🚑 Call 108 — Ambulance / 📞 Call 112 — Emergency" strip sits above the guides while scrolling — if someone is mid-emergency reading the CPR steps, the ambulance number is one tap away, never scrolled out of reach.
- Deployed: no

## Cycle 30 — 02:22 IST
- Actionable alerts: every alert card now carries "what to do" deep links, keyword-matched from its title/body — rainfall warnings point at the go-bag & family plan, flood alerts at shelters, power hazards at the report form, medical alerts at first-aid. An alert without a keyword match falls back to a readiness review.
- Deployed: no

## Cycle 31 — 02:28 IST
- Home readiness card is now a link to /prepare with an "Improve my score →" call to action — the score is computed from go-bag %, family plan, contacts and watch areas, so tapping it takes the user straight to the page that raises it.
- Deployed: no

## Cycle 32 — 01:59 IST (watchdog recovery)
- Distress-send history + haptic confirmation on `/sos`: tapping "Share on WhatsApp" or "Send as SMS" now logs the send (need, channel, timestamp, last 10 in new `nivarana.sos-sends.v1` key, `SosSend` type) rendered as a "Recent distress signals" list under the composer — previously only "I'm Safe" pings were logged, so sent SOS calls left no trail. Both broadcast buttons also fire `navigator.vibrate(150)` so the sender feels the tap register on a shaking phone in the dark. Build green: 16 routes.
- Deployed: no

## Cycle 33 — 02:00 IST (watchdog recovery)
- Unread-alerts badge on the header's Alerts nav link: `SiteHeader` now reads unread count from `nivarana.alerts.v1` on mount and re-checks on window focus / storage events, showing a red count pill on both desktop and mobile navs — unread alerts are visible from every page without opening the alerts section first. Build green: 16 routes.
- Deployed: no

## Cycle 34 — 02:00 IST (watchdog recovery)
- Severity legend on `/zones`: a compact legend card (Critical / High / Moderate / Low with the same colour tokens as the badges) sits under the header so travellers read the zone colours correctly at a glance. Build green: 16 routes.
- Deployed: no

## Cycle 35 — 02:20 IST
- Emergency toolkit on `/sos`: offline WebAudio siren (two-tone wail, start/stop) plus a full-screen strobe-light signal for night rescues, folded in from the Red Cross Hurricane app's flashlight/strobe/audible-alarm toolkit research. Tap anywhere to kill the strobe.
- Deployed: no

## Cycle 36 — 02:27 IST
- Emergency medical ID card on `/sos`: blood group, allergies, medications, conditions stored offline (new `EmergencyId` type + `nivarana.emergency-id.v1` key), shareable/copyable as text for first responders — from the Red Cross "medical profile accessible to responders" pattern.
- Deployed: no

## Cycle 37 — 02:33 IST
- Quiz badge: scoring 80%+ on the first-aid quiz now awards a persistent "🏅 Flood First-Responder" badge (stored in `nivarana.badges.v1`) with a WhatsApp share card — the Red Cross "badges unlocked through interactive quizzes" mechanic, rewarding trained neighbours.
- Deployed: no

## Cycle 38 — 02:39 IST
- Evacuation drill on `/prepare`: guided 7-step 60-second drill (kill mains → grab go-bag → move vulnerable first → lock up → ping safe → walk, never drive → check reports), timed with elapsed counter, best-time tracking, last-10 runs logged offline — the Red Cross "actionable training module" idea as rehearsal, not reading.
- Deployed: no

## Cycle 39 — 02:44 IST
- "Safe drinking water in floods" guide at the top of `/firstaid`: strain → boil 1 min → bleach dosage (2 drops/L clear, 4/L cloudy, 30-min wait, faint chlorine smell check) — flood diarrhoea/cholera are the second disaster after the water itself, and this was the one survival topic the guides didn't cover.
- Deployed: no

## Cycle 40 — 02:49 IST
- Pet preparedness in the family plan: dedicated "Pets — names & species" and "Pet evacuation plan" fields (carrier location, food in go-bag side pocket, leash) stored offline and included in the printable plan — families delay or refuse evacuation over pets, so the plan now covers them explicitly instead of a single free-text line.
- Deployed: no

## Cycle 41 — 02:54 IST
- Monsoon calendar on `/prepare`: Oct (clean & fix) / Nov (peak monsoon) / Dec (tail monsoon) task cards, checkable and stored offline, with the current month highlighted — preparedness reframed as a season, so October work (drain cleaning, inverter service) doesn't get deferred to a flooded November.
- Deployed: no

## Cycle 42 — 02:59 IST
- Shelter "🧭 How to reach" field: optional landmark-based route text per shelter (from a station, past a landmark), rendered in its own route card and included in search — a name and phone number aren't enough when streets are flooded and GPS is unreliable; a landmark route works offline and in the dark.
- Deployed: no

## Cycle 43 — 03:04 IST
- Accessibility pass: `prefers-reduced-motion` now disables all CSS transitions/animations and slows the SOS strobe to a 1.5s pulse instead of a 400ms flash; visible `:focus-visible` ring across the app; 44px minimum touch targets on coarse-pointer devices; larger checkboxes preserved in Simple mode.
- Deployed: no

## Cycle 44 — 03:08 IST
- Home quick-dial widened: Police 100 and Fire & Rescue 101 join 112/108/1077, grid now 5-wide on desktop — a drowning rescue needs fire-services more than a helpline, and in the "get help now" moment every relevant number should be one tap away.
- Deployed: no

## Cycle 45 — 02:58 IST (watchdog recovery)
- Shelter room status on `/shelters`: crowdsourced "🟢 Has space / 🟡 Filling up / 🔴 Full" occupancy badges (new `Shelter.occupancy` field, offline) with a one-tap "Update room status" control per camp — in a flood you need to know a camp is full before walking there in the rain, not after. Build green: 17 pages.
- Deployed: no

## Cycle 46 — 02:59 IST (watchdog recovery)
- Backup import integrity in `/settings`: the type-validation lists now cover every storage key added since they were written — `sos-sends`, `badges`, `drills` join the array-checked keys, `emergency-id` joins the object-checked keys, and the simple-mode flag gets a boolean check — so a corrupt backup can't silently restore a malformed SOS history, badge list or medical ID. Build green: 17 pages.
- Deployed: no

## Cycle 47 — 03:00 IST (watchdog recovery)
- "Other reports in this area" on `/reports/[id]`: the detail page now lists up to 3 other active reports whose area fuzzy-matches (same normalization as the volunteer matcher), so one flood's scattered reports read as a neighbourhood cluster instead of isolated pins. Build green: 17 pages.
- Deployed: no

## Cycle 48 — 03:20 IST
- Vulnerable-neighbour welfare registry at `/checkins`: register elderly, mobility-limited, medical-device-dependent or otherwise at-risk neighbours with a vulnerability tag set; a priority queue surfaces "needs help" first, then never-checked, then longest-since-checked, with one-tap ✓ safe / ⚠ needs help check-ins and call links — folded in from the Ready Together toolkit's "check vulnerable neighbours within the first 12 hours" guidance.
- Deployed: no

## Cycle 49 — 03:28 IST
- Safety-checked claims on `/volunteers`: clicking "I'm helping" now opens a safety checklist (trained & equipped, no fast/chest-deep water, someone knows where you're going, phone charged) plus volunteer identity capture, and one phone can hold at most 2 active assignments — the CrowdSource Rescue / CERT "don't self-deploy, only take work you're trained for" coordination lesson; claimed requests show the volunteer's name.
- Deployed: no

## Cycle 50 — 03:36 IST
- Duplicate-rescue-trip guard on the help form: typing an area + need now fuzzy-matches open requests and warns when a similar one already exists, with a nudge to call that household instead of posting a duplicate — stops two volunteer teams driving to the same door, from the uncoordinated-duplicate-response research.
- Deployed: no

## Cycle 51 — 03:42 IST
- "Copy sit-rep" on `/volunteers`: one tap builds a plain-text coordinator dispatch — open help requests (with claim status), urgent incidents, shelters with room, plus safety footer — ready to paste into a WhatsApp volunteer group; the community information-sharing practice that makes crowd rescue actually coordinated.
- Deployed: no

## Cycle 52 — 03:50 IST
- Post-flood recovery checklist on `/prepare`: 10 ordered steps (⛔ kill mains/gas first, photograph everything before cleaning, bleach-disinfect, dry against mould, safe-water rules, re-run neighbour check-ins, file claims while evidence is fresh) with progress stored offline — from the Ready Together toolkit's "supporting recovery afterward" pillar.
- Deployed: no

## Cycle 53 — 03:56 IST
- Paper wallet emergency card: the printed family plan now ends with a ✂ dashed cut-out wallet card (top 3 family contacts, meeting points, 112/108/1077/100/101 helplines, blood group from the medical ID) — Ready Together's "essential numbers on paper, not only in a phone that may be flat" rule, with a note in the UI explaining why.
- Deployed: no

## Cycle 54 — 04:03 IST
- Flood-safe evacuation route in the family plan: landmark-based route text plus a confirmation checkbox that it avoids flood-prone roads/subways/underpasses (from Ready Together's "confirm your most direct route doesn't flood early" guidance); the route prints on the plan, and home readiness now scores the plan as ½ meeting points + ½ confirmed route instead of a single pass/fail.
- Deployed: no

## Cycle 55 — 04:10 IST
- Bilingual broadcast templates on `/alerts`: WhatsApp group admins get ready-to-copy EN/தமிழ் messages (rain warning, evacuation advisory, volunteer call-out, all-clear) with a one-time area field that fills the [AREA] placeholder — calm consistent wording for group admins instead of panic forwards, from the community information-sharing research.
- Deployed: no

## Cycle 56 — 04:16 IST
- Backup import integrity follows the new keys: `checkins` joins the array-validated keys and `claimIdentity` joins the object-validated keys, so a corrupt backup can't silently restore a malformed neighbour list or claim identity. (Export already covers them via Object.values(KEYS).)
- Deployed: no

## Cycle 57 — 04:21 IST
- Home "People need you now" card: surfaces unclaimed open help requests and neighbours flagged ⚠ needs-help on the dashboard (linking into `/volunteers`), so the people layer is as visible as incident severity — people, not just pins, are what matter.
- Deployed: no

## Cycle 58 — 04:27 IST
- 12-hour staleness on `/checkins`: neighbours not re-checked within 12h now show an amber "check again" nudge and bubble up in the priority queue between never-checked and recently-checked — the Ready Together 12-hour vulnerable-neighbour rule made operational, not just documented.
- Deployed: no

## Cycle 59 — 04:33 IST
- Check-ins → rescue loop closed: the "neighbours need help" banner on `/checkins` now links straight into `/volunteers` to post a help request — flagging a neighbour as needing help is one tap away from getting them rescue.
- Deployed: no

## Cycle 60 — 04:42 IST
- PROJECT_BRIEF updated: appended tonight's two researched insights (CrowdSource Rescue / CERT "don't self-deploy, coordinated volunteers only" coordination lesson; Ready Together toolkit's 12-hour vulnerable-neighbour check, paper-contact backups, flood-road route checking, recovery-afterwards pillar) with the cycles they produced (48–59) — the brief now reads as the design rationale, not just a feature list.
- Deployed: no

## Cycle 61 — 04:06 IST (watchdog recovery)
- Confirmation freshness on the incident board: reports now store `confirmedAt` (latest confirmation time) alongside the count — the board shows "latest confirmed 2h ago" per report and the detail page's Confirmations row carries the same freshness. A flood report whose 12 confirmations are all from yesterday no longer reads as freshly witnessed; old stored data (no timestamp) renders without the age note. Build green: 17 pages.
- Deployed: no

## Cycle 62 — 04:08 IST (watchdog recovery)
- One-tap "👁 Watch this area" from `/zones`: every active zone card and every historically flood-prone area chip now toggles the `/alerts` watchlist inline (dedupe by normalized area, ✓ Watching state), so the alerts page's existing watch-matching section fires without a second screen — the watch → warn loop closed at the moment of highest intent. Build green: 17 pages.
- Deployed: no

## Cycle 63 — 04:10 IST (watchdog recovery)
- Go-bag 30-day review nudge on `/prepare`: a new `goBagReviewed` timestamp key (auto-covered by settings export/import/reset since they iterate `KEYS`) drives an amber "not reviewed in N days" banner with a one-tap "Mark as reviewed" button, or a quiet "reviewed X days ago" line when fresh — packed kits go stale (medicines expire, documents change) and the preparedness guidance treats readiness as a habit, not a checkbox. Build green: 17 pages.
- Deployed: no

## Cycle 64 — 04:24 IST
- Alert self-test on `/alerts`: "🔔 Test your alert setup" dry-run section — fires a simulated critical alert in the real visual language (with vibration on mobile) and records whether you saw it clearly. A warning only saves lives if it reaches the phone; power-saving modes silently block notifications, and the alert-app setup guidance says to test on a calm day, not at 2 AM. Never-tested devices get an amber nudge; missed tests get fix-it guidance; plus a pre-rain phone checklist. New `alertTested` object key added to settings import validation.
- Deployed: no

## Cycle 65 — 04:31 IST
- Two-way alerts on `/alerts`: every alert now carries an "👁 I see this too" button with a live count ("3 neighbours confirming this locally"). Alerts stop being one-way broadcasts and become verified local ground truth — the Flood Watch India lesson that citizen confirmation is what turns a forecast into trusted, acted-on information. New `alertConfirms` object key added to settings import validation.
- Deployed: no

## Cycle 66 — 04:37 IST
- Family safety board on `/sos`: the reunification gap — every emergency contact can now be marked ✅ safe / ⚠ lost / ○ unknown with timestamps, a live "✅ 2 safe · ⚠ 1 unaccounted" summary, and a one-tap "Copy family status for WhatsApp" so the household Safety-Check stops being a frantic thread of "has anyone heard from…?" messages. Empty state explains the why and points at the contacts form. New `familySafety` object key added to settings import validation.
- Deployed: no

## Cycle 67 — 04:44 IST
- Shelter room-status freshness on `/shelters`: setting the crowdsourced occupancy now stamps `occupancyAt`; the badge shows "Reported 2h ago", and anything older than 24h turns amber with "⚠ Reported 2d ago — call ahead, rooms may be full now". A "has space" badge from yesterday's flood must never send a family walking into a full camp. Optional field — old stored data renders without the age note.
- Deployed: no

## Cycle 68 — 04:52 IST
- "Safety reminders" on home: the dashboard now surfaces the two new safety layers where they can't be missed — an amber nudge while the alert-setup dry-run is still untested ("a 30-second dry-run so your phone actually warns you at 2 AM" → /alerts), and a red one while any family member sits marked ⚠ unaccounted on the safety board (→ /sos). Feature value dies when features hide; the dashboard is the discovery surface.
- Deployed: no

## Cycle 69 — 04:54 IST
- Bilingual family safety board: the whole board now follows the SOS page's EN/தமிழ் toggle — heading, empty state, intro, status labels (✅ பாதுகாப்பாக / ⚠ தொடர்பு இல்லை / ○ தெரியவில்லை), buttons, summary and the copied WhatsApp text. A panicking family member must read this board in their own language, not translate under stress.
- Deployed: no

## Cycle 70 — 04:56 IST
- PROJECT_BRIEF updated: appended tonight's three new researched insights (alert-delivery reality check → test on a calm day; two-way alerts / citizen confirmation; family reunification Safety-Check pattern) with the cycles they produced (64–69) — the brief stays the design rationale, not just a feature list.
- Deployed: no

- Deployed: no

## Cycle 71 — 23:27 IST (watchdog recovery)
- Document-expiry nudge on the dashboard: the `/docs` vault tracked expiries but nothing surfaced one elsewhere — an expired insurance policy discovered after a flood is a second disaster. The home safety-nudge lane now scans the vault and raises an amber reminder when any document has expired or expires within 30 days, linking straight into `/docs`. Build green: 17 pages.
- Deployed: no

## Cycle 72 — 23:28 IST (watchdog recovery)
- Readiness score gains a documents pillar: the score counted go-bag, family plan, contacts and watches ÷ 4, but the phase-01 checklist literally says "log where your documents are, with expiry dates" — and the score ignored the vault. Documents now count (capped at 3 logged documents for full credit), the score divides by 5, and the breakdown line shows "N docs logged". Build green: 17 pages.
- Deployed: no

## Cycle 73 — 23:29 IST (watchdog recovery)
- Stale help-request re-confirm on `/volunteers`: a 3-day-old "rescue" plea that was quietly handled elsewhere still sends volunteers to the door. Open/in-progress requests older than 48h now show an amber "⏳ X old — still needed?" line with a one-tap "Still needed" button (refreshes the request's timestamp), so the board stays honest instead of rotting. Build green: 18 pages.
- Deployed: no

## Cycle 74 — 00:48 IST (watchdog recovery)
- Alert self-test now flows into the dashboard: the alert dry-run earns a sixth readiness pillar (score ÷ 6, breakdown shows "Alerts tested ✓/untested") — an untested warning channel is not readiness — and the safety-nudge lane gains a second branch: if a test was run but you reported missing the alert, a nudge points at notification/battery settings and a re-test. The test no longer sits undiscovered on `/alerts`. Build green: 18 pages.
- Deployed: no

## Cycle 75 — 00:48 IST (watchdog recovery)
- Evacuation-drill staleness nudge on the dashboard: `/prepare` asks for a 60-second drill every month before the monsoon but nothing surfaced a slipped rhythm. The safety-nudge lane now reads the `drills` log and raises an amber reminder when the latest drill is older than 30 days (or none has ever been run), linking into `/prepare`. A plan rehearsed months ago is improvisation, not preparation. Build green: 18 pages.
- Deployed: no

## Cycle 76 — 00:48 IST (watchdog recovery)
- Water depth on the home urgent-incident cards: the incident board already showed `≈N cm water` but the dashboard's "Needs attention now" cards reduced every report to a badge + note. Depth now prefixes the subtitle — "≈45 cm water · …" — because knee-deep vs ankle-deep decides whether you move valuables upstairs. Build green: 18 pages.
- Deployed: no

## Cycle 77 — 02:56 IST (watchdog recovery)
- Zone report-freshness on `/zones`: a zone's severity badge now tracks its freshest crowd signal — max of `createdAt` and `confirmedAt` across its active incidents — and any zone whose freshest signal is older than 24h shows an amber "⚠ Freshest signal X ago — treat this severity as history, verify conditions before travelling" line. Flood truth rots fast: a "critical" badge from a 3-day-old sighting is history, not a warning, and the zones page is the travel-decision screen. Build green: 18 pages.
- Deployed: no

## Cycle 78 — 02:57 IST (watchdog recovery)
- Volunteer search on `/volunteers`: a search box above the volunteer list filters by name, area, phone or skill with a live "N of M volunteers match" count and a nudge toward area/skill terms on zero hits. At 2 AM with water at the door you need the boat owner on your street, not a scroll through every registered volunteer. Build green: 18 pages.
- Deployed: no

## Cycle 79 — 02:59 IST (watchdog recovery)
- Go-bag per-item re-check dates on `/prepare`: every kit item gains an optional "re-check by" date (medicines, dry food, batteries), with red "⚠ Expired — replace" / amber "⚠ Re-check in N days" badges inline — the FEMA/Ready Together rule that a packed bag with expired contents is false readiness. The home safety-nudge lane now scans go-bag expiries too, and nudges gained stable unique ids since several cards point at /prepare (keying by href would silently drop cards). New optional `expiry` field on GoBagItem, covered by the existing go-bag export/import path. Build green: 18 pages.
- Deployed: no

## Cycle 80 — 03:36 IST (watchdog recovery)
- Backup-freshness reminder on the dashboard: a backup that was never taken (or taken months ago) is no protection against losing the phone in the water. New `nivarana.backup-taken.v1` key (stamped on every export — before the data is collected so the backup includes it, validated as an object key on import, cleared by the reset loop automatically). The home safety-nudge lane now reminds when a backup was never taken or is older than 30 days, linking into /settings. Build green: 18 pages.
- Deployed: no

## Cycle 81 — 03:37 IST (watchdog recovery)
- "📋 Copy zone summary" on `/zones`: a one-tap neighbour snapshot — every affected area with severity, deepest reported water, receding flags and >24h signal-freshness warnings — via a new `buildZoneSummaryText` builder in lib/share.ts. The /volunteers sit-rep speaks to coordinators; this one answers "how is our area?" in a neighbourhood WhatsApp group at 2 AM. Copied-confirmation feedback on the button. Build green: 18 pages.
- Deployed: no

## Cycle 82 — 03:38 IST (watchdog recovery)
- Staleness warning on home urgent-incident cards: the incident board already flags reports older than 6h with "⚠ May be outdated", but the "Needs attention now" cards on the dashboard — the ones read at 2 AM — didn't carry it. The cards now reuse the board's `StaleBadge`, so a critical card from yesterday's flood no longer reads as breaking news. Build green: 18 pages.
- Deployed: no
