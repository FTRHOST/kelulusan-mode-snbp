// Waktu akhir timer
async function fetchAnnouncementTime() {
    try {
        // Fetch server time from local API to avoid timezone issues
        const serverTimeResponse = await fetch('https://api.manubanyuputih.id/api/waktu-server');
        const serverTimeData = await serverTimeResponse.json();
        console.log('Raw serverTimeData:', serverTimeData);
        const serverTime = new Date(serverTimeData.server_time).getTime();

        // Fetch official announcement time
        const response = await fetch('https://api.manubanyuputih.id/api/waktu-pengumuman');
        const data = await response.json();
        const waktuPengumuman = new Date(data.data.waktu_pengumuman_resmi).getTime();

        console.log('serverTime:', new Date(serverTime).toISOString(), 'waktuPengumuman:', new Date(waktuPengumuman).toISOString());
        if (serverTime < waktuPengumuman) {
            window.location.href = "/timer";
        }
    } catch (error) {
        console.error('Gagal mengambil waktu pengumuman atau waktu server:', error);
    }
}

// Call once on page load
fetchAnnouncementTime();
// Poll every 2 seconds
setInterval(fetchAnnouncementTime, 2000);

    // Script form submission tetap ada di sini
    const form = document.getElementById("index-form-form");
    const alertEl = document.getElementById("index-form-alert");

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            const nis = document.getElementById("index-form-registration-number").value.trim();

            if (!nis) {
                alertEl.textContent = "Nomor Induk Siswa Nasional harus diisi.";
                alertEl.style.display = "block";
                return;
            }

            try {
                const response = await fetch('https://api.manubanyuputih.id/api/kelulusan');
                if (!response.ok) {
                    throw new Error('Student not found');
                }
                const result = await response.json();

                const student = result.data.find(s => s.nis === nis);
                if (!student) {
                    throw new Error('Student not found in data');
                }

                if (student.status_kelulusan === 1) {
                    // Store student NIS in sessionStorage to prevent URL tampering
                    sessionStorage.setItem('studentNIS', student.nis);
                    window.location.href = '/lulus';
                } else {
                    // Store student NIS in sessionStorage to prevent URL tampering
                    sessionStorage.setItem('studentNIS', student.nis);
                    window.location.href = '/tidaklulus';
                }
            } catch (error) {
                alertEl.textContent = "Data tidak ditemukan. Periksa kembali Nomor Induk Siswa Nasional Anda.";
                alertEl.style.display = "block";
            }
        });
    }
