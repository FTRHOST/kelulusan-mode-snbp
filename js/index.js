    // Waktu akhir timer
    async function fetchAnnouncementTime() {
      try {
          const response = await fetch('https://api.manubanyuputih.id/api/waktu-pengumuman');
          const data = await response.json();
          const waktuPengumuman = new Date(data.waktu_pengumuman_resmi).getTime();
          const now = new Date().getTime();
  
          if (now < waktuPengumuman) {
              window.location.href = "/timer";
          }
      } catch (error) {
          console.error('Gagal mengambil waktu pengumuman:', error);
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
                      window.location.href = `lulus?nis=${encodeURIComponent(student.nis)}`;
                  } else {
                      window.location.href = `tidaklulus?nis=${encodeURIComponent(student.nis)}`;
                  }
              } catch (error) {
                  alertEl.textContent = "Data tidak ditemukan. Periksa kembali Nomor Induk Siswa Nasional Anda.";
                  alertEl.style.display = "block";
              }
          });
      }