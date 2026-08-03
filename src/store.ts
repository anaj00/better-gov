import { seedRequests } from "./data";
import type { RequestRecord } from "./types";

const REQUESTS_KEY = "govtrack-requests-v1";
const AUTH_KEY = "govtrack-agency-auth";

export function getRequests(): RequestRecord[] {
  const stored = localStorage.getItem(REQUESTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as RequestRecord[];
    } catch { /* restore invalid stored data */ }
  }
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(seedRequests));
  return seedRequests;
}

export function saveRequests(requests: RequestRecord[]) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  window.dispatchEvent(new Event("govtrack-requests-changed"));
}

export function addRequest(request: RequestRecord) {
  saveRequests([request, ...getRequests()]);
}

export function updateRequest(serial: string, updates: Partial<RequestRecord>) {
  saveRequests(
    getRequests().map((request) =>
      request.serialCode === serial
        ? { ...request, ...updates, lastUpdated: new Date().toISOString() }
        : request
    ),
  );
}

export function resetRequests() {
  saveRequests(seedRequests);
}

export const isAuthenticated = () => localStorage.getItem(AUTH_KEY) === "true";
export const setAuthenticated = (value: boolean) =>
  localStorage.setItem(AUTH_KEY, String(value));

export function generateSerial() {
  const existing = new Set(getRequests().map((request) => request.serialCode));
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let serial = "";
  do {
    const values = crypto.getRandomValues(new Uint8Array(12));
    const code = Array.from(
      values,
      (value) => alphabet[value % alphabet.length],
    ).join("");
    serial = `TRACK-${code}`;
  } while (existing.has(serial));
  return serial;
}

export const formatDate = (date: string, style: "short" | "long" = "long") =>
  new Intl.DateTimeFormat(
    "en-PH",
    style === "short"
      ? { month: "short", day: "numeric", year: "numeric" }
      : { month: "long", day: "numeric", year: "numeric" },
  ).format(new Date(date));
