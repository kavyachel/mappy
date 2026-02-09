import { STATE_MAP } from "../constants/states.js";

export function abbreviateLocation(address) {
  if (!address || typeof address !== "string") return "";

  const parts = address.split(",").map(p => p.trim());
  if (parts.length < 3) return address;

  const streetFull = parts[0];
  const city = parts[1];
  const stateZip = parts[2];

  const street = streetFull.replace(/^\d+\s+/, "");

  const state = stateZip.replace(/\d+/g, "").trim();

  const stateAbbrev = STATE_MAP[state];

  if (!stateAbbrev) {
    return `${street} · ${city}`;
  }

  return `${street} · ${city}, ${stateAbbrev}`;
}