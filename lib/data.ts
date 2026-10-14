// Project 003 · Nivarana — curated reference data (works fully offline)

import type { FirstAidGuide, GoBagItem, QuizQuestion, Shelter } from "./types";

export const QUIZ_BADGE_TITLE = "🏅 Flood First-Responder";

// Copy-paste broadcast templates for WhatsApp group admins — bilingual EN/TA.
// In a real event, the admin fills [bracketed] fields, copies, pastes.
export const BROADCAST_TEMPLATES: { id: string; title: string; en: string; ta: string }[] = [
  {
    id: "rain-warning",
    title: "🌧️ Heavy rain warning",
    en: "🌧️ HEAVY RAIN WARNING — [AREA]: Very heavy rain expected in the next 6 hours. Avoid low-lying roads, keep your go-bag ready, check on elderly neighbours. Report what you see in Nivarana. — [GROUP]",
    ta: "🌧️ கனமழை எச்சரிக்கை — [AREA]: அடுத்த 6 மணி நேரத்தில் மிக கனமழை பெய்யும். தாழ்வான சாலைகளை தவிர்க்கவும், அவசர பையை தயாராக வைக்கவும், வயதான அண்டைவீட்டாரை கவனிக்கவும். — [GROUP]",
  },
  {
    id: "evac-advisory",
    title: "⚠️ Evacuation advisory",
    en: "⚠️ EVACUATION ADVISORY — [AREA]: Water rising. If you're on the ground floor, move to higher ground or the shelter at [SHELTER] now. Take ID, medicines, phone. Walk — never drive through floodwater. — [GROUP]",
    ta: "⚠️ வெளியேற்ற அறிவுறுத்தல் — [AREA]: தண்ணீர் உயர்கிறது. தரை தளத்தில் இருந்தால் இப்போதே உயரமான இடத்திற்கு அல்லது [SHELTER] முகாமிற்கு செல்லவும். அடையாள அட்டை, மருந்து, போனை எடுத்துச் செல்லவும். நடந்து செல்லவும் — வெள்ளநீரில் வாகனம் ஓட்ட வேண்டாம். — [GROUP]",
  },
  {
    id: "volunteer-call",
    title: "🤝 Volunteer call-out",
    en: "🤝 VOLUNTEERS NEEDED — [AREA]: Boats / hands needed at [AREA] — [N] people need evacuation. Coordinated via Nivarana: claim before you go, travel in pairs, do not enter fast water. Reply if available. — [GROUP]",
    ta: "🤝 தன்னார்வலர்கள் தேவை — [AREA]: [AREA]-இல் படகு / உதவிக்கரம் தேவை — [N] பேர் வெளியேற வேண்டும். Nivarana மூலம் ஒருங்கிணைக்கப்படும்: செல்வதற்கு முன் பதிவு செய்யவும், ஜோடியாகச் செல்லவும், வேகமான நீரில் இறங்க வேண்டாம். — [GROUP]",
  },
  {
    id: "all-clear",
    title: "✅ All-clear",
    en: "✅ ALL-CLEAR — [AREA]: Water is receding. Don't re-enter until the all-clear for your street; switch off the mains before touching switches. Report damage via Nivarana. — [GROUP]",
    ta: "✅ நிலைமை சீராகிவிட்டது — [AREA]: தண்ணீர் வடிகிறது. உங்கள் தெருவுக்கு அனுமதி கிடைக்கும் வரை திரும்பி வர வேண்டாம்; சுவிட்சை தொடுவதற்கு முன் மின்சாரத்தை அணைக்கவும். — [GROUP]",
  },
];

// Post-flood recovery: the second disaster after the water itself. A checked,
// ordered sequence — safety first (electrics, gas, structure), then cleanup,
// then paperwork while damage is still visible.
export const RECOVERY_CHECKLIST: { title: string; detail: string; danger: boolean }[] = [
  { title: "Wait for the all-clear before re-entering", detail: "Don't wade back in because the rain stopped — structures, live wires and snakes are the killers after a flood.", danger: true },
  { title: "Kill the mains before touching anything", detail: "Switch off electricity at the main breaker and close the LPG regulator before stepping inside. If the panel is wet or you smell gas, call an electrician — don't improvise.", danger: true },
  { title: "Photograph everything before cleaning", detail: "Walls, floors, appliances, damaged goods — insurers and relief claims are denied without dated proof. Take video walking room to room.", danger: false },
  { title: "Wear boots and gloves for cleanup", detail: "Floodwater carries sewage, glass and rusted metal. No bare hands, no bare feet.", danger: true },
  { title: "Throw out soaked food, medicines, cosmetics", detail: "Anything floodwater touched goes in the bin — cans that are dented, swollen or rusted too. 'It looks fine' is how food poisoning happens.", danger: true },
  { title: "Clean and disinfect every surface", detail: "Soap first, then disinfect (1 cap of bleach per bucket of water). Walls up to the water line, floors, utensils — everything.", danger: false },
  { title: "Dry the house aggressively", detail: "Open windows, run fans, move furniture. Mould starts within 24–48 hours and triggers breathing problems — throw out mattresses and carpets that can't be dried fully.", danger: false },
  { title: "Don't drink tap water until it's declared safe", detail: "Use bottled or disinfected water (strain → boil 1 min → 2 drops bleach/L, wait 30 min) for drinking and cooking.", danger: true },
  { title: "Check on the check-in list", detail: "Re-run your neighbour check-ins (page /checkins) — elderly and device-dependent neighbours need a second round after the water recedes.", danger: false },
  { title: "File claims while evidence is fresh", detail: "Insurance, municipal relief, crop-loss claims — keep the Document vault (/docs) receipts and the photos from step 3 together.", danger: false },
];

export const MONSOON_CALENDAR: { month: string; window: string; tasks: string[] }[] = [
  {
    month: "October",
    window: "Pre-monsoon · clean and fix",
    tasks: [
      "Clear terrace and balcony drains — test with a bucket of water",
      "Service sump pump / check inverter battery charge",
      "Stock candles, matches, torch batteries and a power bank",
      "Photograph valuables and documents for insurance claims",
    ],
  },
  {
    month: "November",
    window: "Peak monsoon · stay ready",
    tasks: [
      "Go-bag packed and by the main door, above expected water level",
      "Family plan printed and on the fridge — everyone knows both meeting points",
      "Phone + power bank charged every evening; torch app installed",
      "Watch Nivarana reports for your ward before driving anywhere",
    ],
  },
  {
    month: "December",
    window: "Tail monsoon · stay vigilant",
    tasks: [
      "Top up medicines and drinking water — supply chains slow in waterlogged streets",
      "Check home for seepage, mould and exposed wiring after the rains",
      "Refill what you used from the go-bag; re-run the 60-second drill",
      "Confirm any flood reports near you as 'receding' once streets drain",
    ],
  },
];

export const EVAC_DRILL_STEPS: { step: string; why: string }[] = [
  { step: "Kill the mains — power, gas, water", why: "Flooded switchboards and shorted appliances electrocute people every monsoon. Turn off the main switch and the gas cylinder regulator before you leave." },
  { step: "Grab the go-bag and documents pouch", why: "It's already packed — don't repack now. That's what the drill is for." },
  { step: "Move elderly, children and pets first", why: "The most vulnerable leave first and settle upstairs or at the neighbour's upper floor while you finish the rest." },
  { step: "Lock doors, take one photo of the house", why: "Locked doors slow looters; a photo of your home's condition helps any later insurance or relief claim." },
  { step: "Send an \"I'm Safe\" ping to family", why: "One tap now stops hours of panic calls later. Use the SOS page — it works in both languages." },
  { step: "Walk to your meeting point — never drive through water", why: "15 cm of fast water can knock you down; 60 cm can float a car. Turn around, don't drown." },
  { step: "Check the Nivarana reports board on arrival", why: "See which streets on your route are flooded, and confirm or report what you see." },
];

export interface Helpline {
  number: string;
  label: string;
  labelTa: string;
  detail: string;
}

export const HELPLINES: Helpline[] = [
  { number: "112", label: "National Emergency", labelTa: "தேசிய அவசர உதவி", detail: "Single emergency number — police, fire, medical." },
  { number: "1077", label: "TN Disaster Helpline", labelTa: "பேரிடர் உதவி எண்", detail: "Tamil Nadu State Emergency Operations Centre." },
  { number: "108", label: "Ambulance", labelTa: "ஆம்புலன்ஸ்", detail: "Free emergency ambulance service." },
  { number: "100", label: "Police", labelTa: "காவல்துறை", detail: "Police control room." },
  { number: "101", label: "Fire & Rescue", labelTa: "தீயணைப்பு", detail: "Fire and rescue services." },
  { number: "1913", label: "Chennai Corporation", labelTa: "சென்னை மாநகராட்சி", detail: "Civic grievances — waterlogging, fallen trees, blocked drains." },
];

export const GO_BAG_SEED: Array<Pick<GoBagItem, "id" | "label" | "detail">> = [
  { id: "water", label: "Drinking water", detail: "3 litres per person — sealed bottles" },
  { id: "food", label: "Dry food", detail: "Biscuits, dry fruits, ORS packets — 3 days" },
  { id: "meds", label: "Medicines", detail: "Daily prescriptions + basic first-aid kit" },
  { id: "docs", label: "Documents pouch", detail: "ID, insurance, property papers in a zip-lock" },
  { id: "torch", label: "Torch + batteries", detail: "Or a hand-crank / solar torch" },
  { id: "power", label: "Power bank", detail: "Fully charged, with cable" },
  { id: "clothes", label: "Change of clothes", detail: "One set per person, in a dry bag" },
  { id: "cash", label: "Cash", detail: "Small notes — ATMs fail in floods" },
  { id: "radio", label: "Battery radio", detail: "For alerts when networks go down" },
  { id: "whistle", label: "Whistle", detail: "To signal rescuers — louder than shouting" },
  { id: "blanket", label: "Blanket / shawl", detail: "Light, warm, quick-dry" },
  { id: "sanitary", label: "Sanitary supplies", detail: "Soap, sanitary pads, baby needs" },
];

export const SHELTER_SEED: Array<Omit<Shelter, "id">> = [
  {
    name: "Sample relief camp — Marina",
    area: "Marina",
    capacity: 500,
    facilities: ["Drinking water", "Food", "Medical desk", "Charging point"],
    contact: "—",
    note: "Sample entry. Replace with your ward's actual relief camp before monsoon.",
    source: "seed",
  },
  {
    name: "Sample relief camp — Velachery",
    area: "Velachery",
    capacity: 300,
    facilities: ["Drinking water", "Food", "Toilets"],
    contact: "—",
    note: "Sample entry. Replace with your ward's actual relief camp before monsoon.",
    source: "seed",
  },
  {
    name: "Sample relief camp — Mudichur",
    area: "Mudichur",
    capacity: 200,
    facilities: ["Drinking water", "Medical desk"],
    contact: "—",
    note: "Sample entry. Replace with your ward's actual relief camp before monsoon.",
    source: "seed",
  },
];

export const FIRST_AID: FirstAidGuide[] = [
  {
    id: "safe-water",
    title: "Safe drinking water in floods",
    subtitle: "Purify tap, tanker or well water before drinking",
    steps: [
      "Strain muddy water through a clean cloth first — disinfectant can't work through silt.",
      "Best method: bring water to a rolling boil for 1 full minute, then cool covered.",
      "No fuel? Use household bleach (sodium hypochlorite, no scent/additives): 2 drops per litre for clear water, 4 drops per litre for cloudy water.",
      "Mix well and wait 30 minutes. It should smell faintly of chlorine — if not, repeat the dose and wait 15 more minutes.",
      "Store in clean covered containers. Never drink water that smells of fuel or chemicals — disinfection doesn't remove those.",
    ],
    warning: "Diarrhoea and cholera spike after every flood. When in doubt, boil — 1 minute of boiling kills virtually everything.",
  },
  {
    id: "drowning",
    title: "Flood-water rescue",
    subtitle: "What to do if someone is caught in flood water",
    steps: [
      "Do NOT enter fast-moving water yourself. Reach or throw — never go.",
      "Extend a stick, rope, saree or ladder to the person.",
      "Throw a floating object: empty sealed drum, thermocol, inflated tube.",
      "Once out, check breathing. If not breathing and trained, start CPR.",
      "Keep the person warm, treat for shock, call 108 immediately.",
    ],
    warning: "Flood water hides open manholes and live wires. Never wade above knee level.",
  },
  {
    id: "cpr",
    title: "Hands-only CPR",
    subtitle: "Adult who has collapsed and is not breathing normally",
    steps: [
      "Call 108 first, or shout for someone to call.",
      "Place the heel of your hand on the centre of the chest.",
      "Push hard and fast — 5–6 cm deep, about 100–120 per minute.",
      "Let the chest fully rise between pushes. Do not stop.",
      "Continue until help arrives or the person starts breathing.",
    ],
    warning: "Hands-only CPR is for adults. For children and drowning victims, rescue breaths matter — call 108 for guidance.",
  },
  {
    id: "bleeding",
    title: "Severe bleeding",
    subtitle: "Cuts from debris, tin sheets, broken glass",
    steps: [
      "Press firmly on the wound with clean cloth. Do not lift to check.",
      "If blood soaks through, add more cloth on top — keep pressing.",
      "Raise the injured limb above heart level if possible.",
      "For a limb wound that won't stop, tie a belt or cloth above the wound as a tourniquet and note the time.",
      "Get to medical help fast — call 108.",
    ],
    warning: "Do not remove embedded objects (glass, metal). Press around them.",
  },
  {
    id: "electric",
    title: "Electric shock",
    subtitle: "Live wires in flood water are silent killers",
    steps: [
      "Do NOT touch the person while they are in contact with electricity.",
      "Switch off the mains if you can do it safely and quickly.",
      "Separate them using a dry wooden stick, plastic chair or rubber mat.",
      "Check breathing and pulse; start CPR if trained and needed.",
      "Call 101 (fire) and 108. Treat burns with cool water, no ointments.",
    ],
    warning: "Assume every fallen wire is live. Keep everyone at least 8 metres away.",
  },
  {
    id: "choking",
    title: "Choking",
    subtitle: "Person cannot speak, cough or breathe",
    steps: [
      "Ask 'are you choking?' If they nod and can't speak, act now.",
      "Stand behind, wrap arms around the waist.",
      "Make a fist above the navel, grasp it, and give sharp upward thrusts.",
      "Repeat until the object comes out or the person collapses.",
      "If they collapse, call 108 and start CPR.",
    ],
    warning: "Do not do blind finger sweeps — you can push the object deeper.",
  },
];

export const FLOOD_PRONE_AREAS = [
  "Velachery", "Mudichur", "Tambaram", "Perumbakkam", "Sholinganallur",
  "Mylapore", "T. Nagar", "Saidapet", "Guindy", "Adyar",
  "Kotturpuram", "Nanganallur", "Pallavaram", "Chromepet", "Medavakkam",
  "Korattur", "Ambattur", "Avadi", "Poonamallee", "Thirumazhisai",
];

export const FIRST_AID_QUIZ: QuizQuestion[] = [
  {
    guideId: "drowning",
    question: "Someone is caught in fast-moving flood water. What do you do first?",
    options: [
      "Jump in and swim out to them",
      "Reach or throw — extend a stick, rope or floating object, never enter the water",
      "Wait on the bank until they drift closer",
    ],
    answer: 1,
    why: "Fast water hides open manholes and live wires. Reach or throw — never go.",
  },
  {
    guideId: "cpr",
    question: "An adult has collapsed and is not breathing normally. Hands-only CPR means…",
    options: [
      "Gentle chest rubs while waiting for help",
      "Push hard and fast in the centre of the chest, about 100–120 times a minute",
      "Tilt the head back and blow into the mouth only",
    ],
    answer: 1,
    why: "Call 108 first, then push 5–6 cm deep and don't stop until help arrives.",
  },
  {
    guideId: "bleeding",
    question: "Blood soaks through the cloth you're pressing on a deep cut. What next?",
    options: [
      "Remove the cloth and check how deep the cut is",
      "Add more cloth on top and keep pressing — never lift the first layer",
      "Pour water over the wound to wash it out",
    ],
    answer: 1,
    why: "Lifting the cloth breaks the clot. Add layers, keep pressure, call 108.",
  },
  {
    guideId: "electric",
    question: "A person is being electrocuted by a fallen wire in flood water. First action?",
    options: [
      "Pull them away from the wire immediately",
      "Do NOT touch them — switch off the mains or separate them with a dry wooden stick",
      "Splash water on the wire to cool it down",
    ],
    answer: 1,
    why: "Assume every fallen wire is live. Keep everyone at least 8 metres away.",
  },
  {
    guideId: "choking",
    question: "A person is choking, cannot speak or cough. What do you do?",
    options: [
      "Do blind finger sweeps to grab the object",
      "Offer them water to wash it down",
      "Stand behind them and give sharp upward abdominal thrusts until it clears",
    ],
    answer: 2,
    why: "Blind finger sweeps can push the object deeper. Thrusts use the body's own air.",
  },
];
