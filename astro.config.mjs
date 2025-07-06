// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node'; // Aktifkan SSR dengan adapter Node.js
import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind'; // <-- IMPORT BARIS INI

// https://astro.build/config
export default defineConfig({
  output: 'static',

  adapter: node({
    mode: 'standalone' // Atau sesuaikan dengan platform deployment (Vercel, Netlify, dll)
  }),

  server: {
  port: 8080,
  host: true,
  allowedHosts: ['kelulusan.manubanyuputih.id']
},

  site: "https://kelulusan.manubanyuputih.id",
  base: "/",
  integrations: [react(),
    tailwind({
    applyBaseStyles: false,
  })],

  vite: {
    plugins: [],
  },
});