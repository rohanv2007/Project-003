# PROJECT_BRIEF.md — Project 003 · Nivarana

## Identity
- **Project number:** 003 (tracker sheet max was 2 → this run takes 003)
- **Product name:** Nivarana — Flood & Disaster Resilience
- **Field:** Disaster response (not covered by any prior project: 001 = WP project, 002 = Raktha blood-donor network)

## The real, painful problem
Every northeast monsoon, Chennai floods — 2015 devastated the city, 2023's Michaung
did it again. Families discover at 2 AM that water is at their doorstep: no go-bag,
no plan for where to meet, no idea which streets are flooded, no list of who to call.
Willing neighbours with boats and supplies have no way to coordinate with families
who need rescue. Government apps (RiskMap, TN-SMART) exist but citizens need one calm,
offline, bilingual tool that covers the whole arc: prepare → watch → report → get help.

## Vision
One calm, local-first resilience companion: prepare your household before the rain,
watch your streets through crowd-sourced reports, find shelter in one tap, and call
for help or offer it — all offline in the browser, in English and தமிழ். No account,
no backend, no API keys.

## Researched insights (folded in from night research)
1. **Red Cross Emergency app's "I'm Safe" one-tap messaging + preloaded offline
   content** → Nivarana ships fully offline via localStorage, with one-tap "I'm Safe"
   and SOS broadcasts. (Red Cross suite: real-time alerts, family plans, first aid,
   multilingual, offline access.)
2. **MIT RiskMap Chennai's crowd-report taxonomy** (flood depth, blocked drains, open
   manholes, fallen trees, power outage, receding water) → our incident form uses
   exactly these categories with a severity scale and confirmations.
3. **IIT-Madras bilingual (EN/தமிழ்) waterlogging crowdsourcing** → bilingual
   emergency flows: SOS and I'm Safe messages generate in both languages.
4. **FEMA app's kit checklists + family plan templates** → go-bag checklist and
   family emergency plan with a computed readiness score.
5. **CrowdSource Rescue / CERT coordination lesson** (Houston flood response:
   volunteers and agencies working uncoordinated, duplicate trips to the same
   address, unplanned arrivals putting people at risk) → safety-checked claims
   with a 2-assignment cap, duplicate-request warnings on the help form, and a
   one-tap coordinator sit-rep for WhatsApp volunteer groups (cycles 49–51).
6. **Ready Together emergency toolkit (Somerset)** → vulnerable-neighbour
   welfare registry with a 12-hour staleness rule and priority queue; paper
   wallet emergency card ("essential numbers on paper, not only in a flat
   phone"); evacuation route checked against flood-prone roads; post-flood
   recovery checklist (cycles 48, 52–55, 58).
7. **Alert-delivery reality check (flood-warning app setup guidance)** → a warning
   only saves lives if it reaches the phone — battery-saver modes silently block
   notifications, so users are told to test their setup on a calm day, not at 2 AM.
   Nivarana's `/alerts` now has a dry-run "test alert" that fires the real visual
   language and records whether you saw it (cycle 64).
8. **Two-way alerts / citizen confirmation (Flood Watch India, C-Flood)** →
   one-way broadcasts become verified local ground truth: "👁 I see this too"
   confirmations on every alert, with counts shown publicly (cycle 65).
9. **Family reunification (household Safety-Check pattern)** → the SOS page's
   family safety board: every emergency contact marked ✅ safe / ⚠ lost / ○ unknown
   with timestamps, one-tap WhatsApp summary, home-dashboard visibility for
   unaccounted members, and full Tamil localisation of the emergency flow
   (cycles 66, 68, 69).

## Feature scope
1. **Home dashboard** — readiness score, unread alerts, urgent incidents, quick actions.
2. **Incident reporting + board** — RiskMap-style categories, severity, water depth,
   confirmations ("I see this too"), resolve, WhatsApp share.
3. **Zone severity view** — area-wise rollup of active reports with severity colouring.
4. **Go-bag checklist** — NDMA/FEMA-style 12-item kit with progress.
5. **Family emergency plan** — meeting points, out-of-town contact, notes.
6. **Shelter directory** — relief camps with capacity, facilities, contact; user-addable.
7. **SOS + I'm Safe** — bilingual one-tap broadcasts via WhatsApp/SMS, emergency
   contacts, real helplines (112, 1077, 108, 100, 101, 1913).
8. **Volunteer registry + help board** — offer skills / request rescue, food, water,
   medical, shelter; status workflow open → in-progress → resolved.
9. **Alerts + watch areas** — ward watchlist with matched alerts, seeded IMD-style alerts.
10. **Document vault** — where emergency documents are kept + expiry reminders.
11. **First-aid quick guides** — flood rescue, hands-only CPR, bleeding, electric shock,
    choking; preloaded for offline use.
12. **Settings** — export/import all data (backup), language toggle, reset.

## UI rules (non-negotiable)
- FixMyCampus editorial system: warm paper background, cream cards, serif display
  headlines (Fraunces), sharp corners, generous whitespace.
- Restrained palette: neutrals + ONE accent (deep teal #0f6f6a). Severity uses
  functional green/amber/red only.
- Minimal animation, NO gradients, light theme.
- Mobile-first: responsive, touch-friendly targets, no horizontal scroll.
