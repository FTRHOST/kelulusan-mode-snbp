// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node'; // Aktifkan SSR dengan adapter Node.js

// https://astro.build/config
export default defineConfig({
  adapter: node({
    mode: 'standalone' // Atau sesuaikan dengan platform deployment (Vercel, Netlify, dll)
  }),
    server: {
    port: 8080,
    host: '62.72.7.236',
    allowedHosts: ['manubanyuputih.id']
  },
  devToolbar: {
    enabled: false
  }
});
