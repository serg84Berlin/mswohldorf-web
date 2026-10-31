// @ts-check
/**
 * Kleines Astro-Projekt NUR für die Prüfungen (tests/pruefen.mjs, Abschnitt 10):
 * echte Platzhalter-Komponente + echte Livegang-Sperre, aber eigene Seiten —
 * unabhängig davon, was auf der richtigen Website gerade noch offen ist.
 *
 *   node node_modules/astro/bin/astro.mjs build --root tests/livegang-sperre
 *
 * PRUEF_MIT_PFLICHT=1 hängt die Seite /pflicht/ an (rechtliche Platzhalter und
 * Entwurf-Hinweis) — damit muss ein Produktions-Build scheitern.
 * PRUEF_AUSGABE: Ausgabeordner (Standard: test-ergebnisse/livegang-sperre/).
 */
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import livegangSperre from '../../integrationen/livegang-sperre.mjs';

export default defineConfig({
  outDir: process.env.PRUEF_AUSGABE ?? fileURLToPath(new URL('../../test-ergebnisse/livegang-sperre/', import.meta.url)),
  // Cache neben dem der Website, damit unter tests/ nichts liegen bleibt.
  cacheDir: fileURLToPath(new URL('../../node_modules/.astro/livegang-sperre/', import.meta.url)),
  devToolbar: { enabled: false },
  integrations: [
    {
      name: 'pruefung-pflicht-seite',
      hooks: {
        'astro:config:setup': ({ injectRoute }) => {
          if (process.env.PRUEF_MIT_PFLICHT === '1') injectRoute({ pattern: '/pflicht', entrypoint: new URL('./pflicht.astro', import.meta.url) });
        },
      },
    },
    livegangSperre(),
  ],
});
