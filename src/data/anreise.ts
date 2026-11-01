/**
 * Anreise für Teams von außerhalb (Seite /offsite-hamburg/, Häufige Fragen, llms.txt).
 *
 * Quellen (geprüft 01.11.2026):
 *   - Bahn Berlin Hbf → Hamburg Hbf: Die schnellsten ICE brauchen knapp zwei Stunden
 *     (nach der Korridorsanierung 2026 rund 107 Minuten laut giga.de; Reiseportale nennen
 *     1:45–2:00 Std.). Die DB nennt selbst keine feste Fahrzeit — aktuelle Verbindungen:
 *     bahn.de. Daher bewusst nur „knapp zwei Stunden“.
 *   - Straße: Routenberechnung OSRM (router.project-osrm.org) ohne Verkehr:
 *     Hamburg Hbf → Liegeplatz 11,0 km / 16 Min.; Flughafen Hamburg → Liegeplatz 20,0 km / 29 Min.
 *     Die Seite nennt Spannen „je nach Verkehr“.
 *   - Bus und Bahn bis zum Liegeplatz: nicht belegt (OFFENE-ANGABEN.md Nr. 30) — nicht nennen.
 */
export const ANREISE = {
  berlinBahn: 'knapp zwei Stunden',
  hbfKm: 11,
  hbfMinuten: '15 bis 25 Minuten',
  flughafenKm: 20,
  flughafenMinuten: 'rund eine halbe Stunde',
} as const;

/** Etappen der Reise von Berlin (für die animierte Route). */
export const ROUTE_BERLIN = [
  { ort: 'Berlin Hbf', mittel: 'ICE', dauer: ANREISE.berlinBahn },
  { ort: 'Hamburg Hbf', mittel: 'Taxi oder Auto', dauer: `${ANREISE.hbfKm} km · ${ANREISE.hbfMinuten}` },
  { ort: 'MS Wohldorf', mittel: '', dauer: '' },
] as const;
