// src/pages/api/config/time.json.ts
import type { APIRoute } from 'astro';

// INI ADALAH SUMBER UTAMA WAKTU PENGUMUMAN
const WAKTU_PENGUMUMAN_DARI_KONFIGURASI = "2025-06-03T11:30:00+07:00"; // Ganti sesuai jadwal sebenarnya

export const prerender = false;

export const GET: APIRoute = ({}) => { // Astro.url is available globally in API routes
  const currentTime = new Date();

  return new Response(
    JSON.stringify({
      waktu_pengumuman_resmi: WAKTU_PENGUMUMAN_DARI_KONFIGURASI,
      waktu_server_saat_ini: currentTime.toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  );
};