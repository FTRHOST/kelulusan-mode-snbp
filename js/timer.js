async function getCountdownData() {
    try {
        const response = await fetch('/get_countdown_data.php');
        const data = await response.json();

        if (data && data.redirect) {
            // Pengarahan dari server
            window.location.href = data.redirect_url;
            return null; // Penting untuk menghentikan pemrosesan lebih lanjut
        }

        return data;
    } catch (error) {
        console.error('Error fetching countdown data:', error);
        return null;
    }
}

async function updateTimer() {
    const countdownData = await getCountdownData();

    if (countdownData) {
        const targetDate = new Date(countdownData.target_date);
        const eventName = countdownData.event_name;
        const eventDescription = countdownData.description;
        const timezone = countdownData.timezone;

        const now = new Date();
        const timeDifference = targetDate.getTime() - now.getTime();

        if (timeDifference > 0) {
            const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

            document.getElementById('index-days').textContent = String(days).padStart(2, '0');
            document.getElementById('index-hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('index-minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('index-seconds').textContent = String(seconds).padStart(2, '0');

            document.getElementById('index-event-name').textContent = eventName;
            document.getElementById('index-event-deadline').textContent = eventDescription + " " + targetDate.toLocaleString('id-ID', { timeZone: timezone, dateStyle: 'long', timeStyle: 'short' });
        } else {
            // Waktu sudah lewat (Pengarahan sisi klien sebagai fallback)
            window.location.href = '/halaman-arahan.html'; // Ganti dengan URL halaman arahan Anda (Fallback)
        }
    } else {
        console.warn('No countdown data found.');
    }
}

// Panggil `updateTimer` setiap detik
setInterval(updateTimer, 1000);

// Panggil pertama kali saat halaman dimuat
updateTimer();