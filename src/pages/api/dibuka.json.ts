import { AstroError } from 'astro/errors';

export const prerender = false; // Nonaktifkan prerendering untuk SSR
    const waktuPengumuman = new Date("2025-05-13T20:30:00+07:00").toISOString(); // Ganti sesuai jadwal sebenarnya [[3]]

// // src/pages/api/pengumuman.json.ts
// export async function get() {
//     const waktuPengumuman = new Date("2025-05-12T15:00:00").toISOString(); // Ganti sesuai jadwal sebenarnya [[3]]
//     return {
//         body: JSON.stringify({
//             waktu_pengumuman: waktuPengumuman
//         })
//     };
// }

export const GET: APIRoute = ({}) => {
  return new Response(
    JSON.stringify({
      waktu_pengumuman: waktuPengumuman
    }),
  );
};