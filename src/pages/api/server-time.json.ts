
// src/pages/api/server-time.json.ts
export const GET = () => {
    const now = new Date();

    // Ambil waktu UTC dalam milidetik
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);

    // Tambahkan offset WIB (UTC+7) -> 7 jam * 3600000 ms
    const wibTime = new Date(utcTime + 7 * 3600000);

    // Format ke dalam ISO string dengan offset WIB (+07:00)
    const wibISOString = wibTime.toISOString().replace('Z', '+07:00');

    return new Response(
        JSON.stringify({
            serverTime: wibISOString
        }),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
};

