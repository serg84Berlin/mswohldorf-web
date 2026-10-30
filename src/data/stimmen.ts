/**
 * Kundenstimmen der bisherigen Website. Noch nicht übernommen, weil die alte
 * Seite beim Bau nicht erreichbar war — bitte wörtlich übertragen (Zitat,
 * Name/Firma wie auf der alten Seite). Nichts umformulieren, nichts erfinden.
 */
export interface Stimme {
  zitat: string;
  name: string;
  zusatz?: string;
}

export const STIMMEN: Stimme[] = [];
