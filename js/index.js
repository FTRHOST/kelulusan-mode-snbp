const form = document.getElementById("index-form-form");
const alertEl = document.getElementById("index-form-alert");

export const prerender = false; // Disable static pre-rendering

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
      // Gunakan path relatif ke endpoint Astro
      const response = await fetch(`/api/students/${encodeURIComponent(nis)}.json`); 
      if (!response.ok) {
        throw new Error('Student not found');
      }
      const student = await response.json();
      
      if (student.statusKelulusan === 1) {
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