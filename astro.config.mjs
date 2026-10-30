// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import sicherheitsHeader from './integrationen/sicherheits-header.mjs';

export default defineConfig({
  site: 'https://www.mswohldorf.de',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      filter: (seite) => !seite.includes('/404'),
      i18n: undefined,
    }),
    sicherheitsHeader(),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Der einzige große Brocken ist three.js für die 3D-Bühne (~135 kB gzip).
      // Er wird nur auf fähigen Geräten, nach dem ersten Zeichnen und im
      // Leerlauf per dynamic import() nachgeladen — nie beim Seitenaufbau.
      chunkSizeWarningLimit: 650,
    },
  },
});
