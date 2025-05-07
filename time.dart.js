// Contoh JavaScript (adaptasikan ke Dart Anda)
async function getCountdownData() {
  try {
    const response = await fetch('/get_countdown_data.php'); // Ganti dengan URL endpoint API Anda
    const data = await response.json();
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

    // Hitung selisih waktu (seperti yang Anda lakukan sebelumnya)
    const now = new Date();
    const timeDifference = targetDate.getTime() - now.getTime();

    if (timeDifference > 0) {
      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      // Update elemen HTML (adaptasikan dengan cara Anda memperbarui elemen di Dart)
      document.getElementById('index-days').textContent = days;
      document.getElementById('index-hours').textContent = hours;
      document.getElementById('index-minutes').textContent = minutes;
      document.getElementById('index-seconds').textContent = seconds;

      // Perbarui catatan acara
      document.querySelector('.index-timer-note-event').textContent = eventName;
      document.querySelector('.index-timer-note-deadline').textContent = eventDescription + " " + targetDate.toLocaleString('id-ID', { timeZone: timezone, dateStyle: 'long', timeStyle: 'short' }); // Memformat tanggal sesuai timezone
    } else {
      // Waktu sudah lewat
      // ... (Lakukan sesuatu jika waktu sudah lewat)
        document.getElementById('index-days').textContent = 0;
        document.getElementById('index-hours').textContent = 0;
        document.getElementById('index-minutes').textContent = 0;
        document.getElementById('index-seconds').textContent = 0;
        document.querySelector('.index-timer-note-event').textContent = "Waktu Pengumuman Telah Tiba";
        document.querySelector('.index-timer-note-deadline').textContent = "";
    }
  } else {
    console.warn('No countdown data found.');
  }
}

// Panggil `updateTimer` setiap detik
setInterval(updateTimer, 1000);

// Panggil pertama kali saat halaman dimuat
updateTimer();