/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Ziel des Anfrageformulars (POST, JSON). Leer = Vorschau-Hinweis statt Senden. */
  readonly PUBLIC_ANFRAGE_URL?: string;
  /** "1" = Vorschau-Build (noindex,nofollow + Band, Platzhalter als Kasten, keine Livegang-Sperre). */
  readonly PUBLIC_VORSCHAU?: string;
  /** "1" = Anfrage mit `art` und `herkunft` (Lead-Quelle). Erst setzen, wenn der Server die Felder annimmt. */
  readonly PUBLIC_ANFRAGE_ERWEITERT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
