// src/pages/api/students/[nis].json.ts
import type { APIRoute } from 'astro';
import { students } from '../../../data/schoolData'; // Pastikan path ini benar

export const prerender = false;

interface Student {
  nis: string;
  nama: string;
  kelas?: string;
  status_kelulusan?: "LULUS" | "TIDAK LULUS" | string;
}

// Fungsi helper untuk mengambil konfigurasi waktu
async function getAnnouncementConfig(fetchUrl: URL): Promise<{ waktu_pengumuman_resmi: string } | null> {
  try {
    const response = await fetch(fetchUrl.toString());
    if (!response.ok) {
      console.error(`Error fetching announcement time: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    if (typeof data.waktu_pengumuman_resmi !== 'string') {
        console.error('Invalid time data from API: "waktu_pengumuman_resmi" is not a string or missing.');
        return null;
    }
    return data;
  } catch (error) {
    console.error("Failed to fetch or parse announcement time:", error);
    return null;
  }
}

export const GET: APIRoute = async ({ params, request }) => { // `request` untuk mendapatkan `request.url` atau gunakan `Astro.url`
  const currentTime = new Date();
  const nis = params.nis;

  // --- Ambil Waktu Pengumuman dari API Konfigurasi ---
  // Astro.url.origin memberikan basis URL (e.g., http://localhost:4321)
  const timeApiUrl = new URL('http://localhost:8080/api/config/time.json');
  const announcementConfig = await getAnnouncementConfig(timeApiUrl);

  if (!announcementConfig || !announcementConfig.waktu_pengumuman_resmi) {
    // Gagal mengambil konfigurasi waktu, kembalikan error server
    return new Response(
      JSON.stringify({
        error: "Kesalahan Internal Server.",
        message: "Tidak dapat mengambil konfigurasi waktu pengumuman. Silakan coba lagi nanti.",
        waktu_server_saat_ini: currentTime.toISOString(),
      }),
      {
        status: 500, // Internal Server Error
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }

  const WAKTU_PENGUMUMAN_STR = announcementConfig.waktu_pengumuman_resmi;
  const waktuPengumumanDateObj = new Date(WAKTU_PENGUMUMAN_STR);

  // Validasi apakah tanggal yang diterima valid
  if (isNaN(waktuPengumumanDateObj.getTime())) {
    console.error(`Invalid date string received from config API: ${WAKTU_PENGUMUMAN_STR}`);
    return new Response(
      JSON.stringify({
        error: "Kesalahan Konfigurasi.",
        message: "Format waktu pengumuman tidak valid dari server konfigurasi.",
        waktu_server_saat_ini: currentTime.toISOString(),
      }),
      {
        status: 500, // Internal Server Error
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
  // --- Selesai Mengambil Waktu Pengumuman ---


  // 1. Cek apakah waktu pengumuman sudah tiba
  if (currentTime < waktuPengumumanDateObj) {
    const sisaWaktuDetik = Math.round((waktuPengumumanDateObj.getTime() - currentTime.getTime()) / 1000);
    const sisaWaktuMenit = Math.floor(sisaWaktuDetik / 60);
    const sisaWaktuJam = Math.floor(sisaWaktuMenit / 60);
    const sisaWaktuHari = Math.floor(sisaWaktuJam / 24);

    let countdownMessage = `Pengumuman akan tersedia dalam `;
    if (sisaWaktuHari > 0) countdownMessage += `${sisaWaktuHari} hari `;
    if (sisaWaktuJam % 24 > 0) countdownMessage += `${sisaWaktuJam % 24} jam `;
    if (sisaWaktuMenit % 60 > 0) countdownMessage += `${sisaWaktuMenit % 60} menit `;
    countdownMessage += `${sisaWaktuDetik % 60} detik.`;
    if (sisaWaktuDetik <= 0) countdownMessage = "Pengumuman akan segera tersedia. Silakan refresh halaman.";

    return new Response(
      JSON.stringify({
        error: "Akses ditutup.",
        message: `Pengumuman belum dapat diakses. Silakan coba lagi nanti.`,
        detail: countdownMessage,
        waktu_pengumuman_resmi: WAKTU_PENGUMUMAN_STR,
        waktu_server_saat_ini: currentTime.toISOString(),
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Retry-After': sisaWaktuDetik > 0 ? Math.max(60, sisaWaktuDetik).toString() : '60'
        }
      }
    );
  }

  // 2. Jika waktu pengumuman sudah tiba
  if (!nis) {
    return new Response(
      JSON.stringify({ 
        error: 'NIS parameter is missing',
        waktu_akses: currentTime.toISOString(),
        waktu_pengumuman_resmi: WAKTU_PENGUMUMAN_STR
      }),
      { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  const student = (students as unknown as Student[]).find(s => s.nis === nis);
  
  if (student) {
    // --- PERBAIKAN DI SINI ---
    // Gabungkan semua properti dari objek 'student' dengan informasi waktu
    const responseData = {
      ...student, // Sebarkan semua properti dari objek student yang ditemukan
      waktu_akses: currentTime.toISOString(),
      waktu_pengumuman_resmi: WAKTU_PENGUMUMAN_STR // WAKTU_PENGUMUMAN_STR dari hasil fetch atau hardcode
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } else {
    return new Response(JSON.stringify({ 
        error: 'Student not found',
        message: `Data untuk NIS ${nis} tidak ditemukan.`,
        waktu_akses: currentTime.toISOString(),
        waktu_pengumuman_resmi: WAKTU_PENGUMUMAN_STR
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};