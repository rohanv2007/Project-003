// Project 003 · Nivarana — domain types

export type IncidentType =
  | "flood"
  | "waterlogging"
  | "blocked-drain"
  | "open-manhole"
  | "fallen-tree"
  | "power-outage"
  | "receding"
  | "other";

export type Severity = "low" | "moderate" | "high" | "critical";

export interface Incident {
  id: string;
  type: IncidentType;
  severity: Severity;
  area: string;
  ward: string;
  note: string;
  waterDepthCm: number | null;
  reporter: string;
  createdAt: number;
  confirmations: number;
  confirmedAt?: number | null; // latest confirmation time — freshness of the crowd signal
  status: "active" | "resolved";
  lat?: number | null;
  lon?: number | null;
}

export interface Shelter {
  id: string;
  name: string;
  area: string;
  capacity: number | null;
  facilities: string[];
  contact: string;
  note: string;
  reach?: string; // "how to reach": landmark-based route text, offline-first
  occupancy?: "space" | "filling" | "full"; // crowdsourced: is there room right now?
  occupancyAt?: number | null; // when the crowdsourced room status was last updated — stale info sends families to a full camp
  source: "seed" | "user";
}

export type HelpNeed = "rescue" | "food" | "water" | "medical" | "shelter" | "power" | "other";

export interface HelpRequest {
  id: string;
  need: HelpNeed;
  name: string;
  phone: string;
  area: string;
  people: number;
  note: string;
  status: "open" | "in-progress" | "resolved";
  claimedBy?: string; // volunteer name — claim requires the safety checklist
  claimedPhone?: string; // normalized digits; used to cap concurrent assignments
  createdAt: number;
}

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  area: string;
  skills: string[];
  available: boolean;
  createdAt: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface FamilyPlan {
  meetingPointHome: string;
  meetingPointOutside: string;
  outOfTownContact: string;
  notes: string;
  petNames: string;
  petPlan: string;
  // Evacuation route: landmark-based route + confirmation it avoids
  // flood-prone roads/underpasses (Ready Together: "confirm whether your most
  // direct route uses roads that flood early — many do").
  evacRoute: string;
  evacRouteChecked: boolean;
  updatedAt: number;
}

export interface GoBagItem {
  id: string;
  label: string;
  detail: string;
  done: boolean;
  // Optional YYYY-MM-DD re-check date for perishable kit (medicines, dry
  // food, batteries): a packed bag with expired contents is false readiness.
  expiry?: string;
}

export interface DocEntry {
  id: string;
  name: string;
  keptAt: string;
  expiry: string;
  note: string;
}

export interface AlertItem {
  id: string;
  title: string;
  body: string;
  severity: Severity;
  area: string;
  source: string;
  issuedAt: number;
  read: boolean;
}

export interface WatchArea {
  id: string;
  area: string;
}

export interface SafePing {
  id: string;
  name: string;
  message: string;
  createdAt: number;
}

export interface SosSend {
  id: string;
  need: string;
  channel: "whatsapp" | "sms";
  createdAt: number;
}

export interface EmergencyId {
  bloodGroup: string;
  allergies: string;
  medications: string;
  conditions: string;
}

export type NeighbourStatus = "unchecked" | "safe" | "needs-help";

export type FamilySafetyStatus = "safe" | "unaccounted" | "unknown";

export interface FamilySafetyMark {
  status: FamilySafetyStatus;
  at: number;
}

export interface Neighbour {
  id: string;
  name: string;
  area: string;
  phone: string;
  vulnerabilities: string[];
  notes: string;
  status: NeighbourStatus;
  lastCheckedAt: number | null;
  createdAt: number;
}

export interface QuizBadge {
  id: string;
  title: string;
  detail: string;
  earnedAt: number;
}

export interface FirstAidGuide {
  id: string;
  title: string;
  subtitle: string;
  steps: string[];
  warning: string;
}

export interface QuizQuestion {
  guideId: string;
  question: string;
  options: string[];
  answer: number; // index of the correct option
  why: string;
}
