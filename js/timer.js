export const prerender = false;

let deadline = null;
let timerInterval = null; // Simpan ID interval timer
let serverStartTime = null;
let lastDeadline = null;
let lastServerTime = null;
let timerStartPerfTime = null; // performance.now() at timer start

async function fetchServerTime() {
    try {
        const response = await fetch('https://3010-firebase-api-1747919070828.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev/api/waktu-server');
        const data = await response.json();
        const serverTime = new Date(data.server_time).getTime();
        console.log('Waktu server:', new Date(serverTime));
        return serverTime;
    } catch (error) {
        console.error('Gagal mengambil waktu server:', error);
        displayErrorMessage('Gagal mengambil waktu server. Coba lagi nanti.'); // Contoh menampilkan pesan kesalahan
        return null;
    }
}

async function fetchDeadline() {
    try {
        const response = await fetch('https://3010-firebase-api-1747919070828.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev/api/waktu-pengumuman');
        const data = await response.json();
        const newDeadline = new Date(data.data.waktu_pengumuman_resmi).getTime();
        console.log('Waktu pengumuman:', new Date(newDeadline));
        return newDeadline;
    } catch (error) {
        console.error('Gagal mengambil waktu pengumuman:', error);
        displayErrorMessage('Gagal mengambil waktu pengumuman. Coba lagi nanti.'); // Contoh menampilkan pesan kesalahan
        return null;
    }
}


function calculateTimeDifference(serverTime, deadline) {
    if (serverTime === null || deadline === null) {
        return null; // Atau nilai lain yang menandakan kesalahan
    }
    return deadline - serverTime;
}

function updateTimerDisplay(days, hours, minutes, seconds) {
    document.getElementById("index-days").textContent = String(days).padStart(2, '0');
    document.getElementById("index-hours").textContent = String(hours).padStart(2, '0');
    document.getElementById("index-minutes").textContent = String(minutes).padStart(2, '0');
    document.getElementById("index-seconds").textContent = String(seconds).padStart(2, '0');
}

function startTimer(deadline, startTime) {
    if (timerInterval) {
        clearInterval(timerInterval); // Hentikan timer sebelumnya jika ada
    }

    timerStartPerfTime = performance.now();

    timerInterval = setInterval(() => {
        const elapsed = performance.now() - timerStartPerfTime;
        const now = new Date(startTime + elapsed);
        const distance = deadline - now.getTime();
        console.log('Waktu saat ini (server-synced):', now);
        console.log('Sisa waktu:', distance);

        if (distance <= 0) {
            clearInterval(timerInterval);
            window.location.href = "/pengumuman";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        updateTimerDisplay(days, hours, minutes, seconds);

    }, 1000);
}

async function updateTimerIfNeeded() {
    const newServerTime = await fetchServerTime();
    const newDeadline = await fetchDeadline();

    if (newServerTime === null || newDeadline === null) {
        return; // Jika gagal mengambil data, tidak melakukan update
    }

    // Cek apakah ada perubahan pada deadline atau server time
    if (newDeadline !== lastDeadline || newServerTime !== lastServerTime) {
        console.log('Update timer dengan waktu baru');
        lastDeadline = newDeadline;
        lastServerTime = newServerTime;

        const timeDifference = calculateTimeDifference(newServerTime, newDeadline);
        if (timeDifference <= 0) {
            window.location.href = "/pengumuman";
            return;
        }

        startTimer(newDeadline, newServerTime);
    }
}

async function initializeCountdown() {
    lastServerTime = await fetchServerTime();
    if (lastServerTime === null) {
        return; // Hentikan inisialisasi jika gagal mengambil waktu server
    }

    lastDeadline = await fetchDeadline();
    if (lastDeadline === null) {
        return; // Hentikan inisialisasi jika gagal mengambil waktu pengumuman
    }

    const timeDifference = calculateTimeDifference(lastServerTime, lastDeadline);
    if (timeDifference === null) {
        return; // Hentikan inisialisasi jika terjadi kesalahan perhitungan
    }

    if (timeDifference <= 0) {
        window.location.href = "/pengumuman";
        return;
    }

    startTimer(lastDeadline, lastServerTime);

    // Set interval untuk cek update waktu setiap 15 detik
    setInterval(updateTimerIfNeeded, 15000);
}

function displayErrorMessage(message) {
    // Implementasikan cara menampilkan pesan kesalahan kepada pengguna (misalnya, menggunakan elemen HTML)
    console.error(message); // Contoh: tampilkan di konsol
    // document.getElementById('error-message').textContent = message; // Contoh: tampilkan di elemen HTML dengan ID 'error-message'
}

initializeCountdown();
