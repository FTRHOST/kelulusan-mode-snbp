// Mock database of students keyed by NIS (Nomor Induk Siswa Nasional)

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
      const response = await fetch('http://62.72.7.236:3000/students/' + nis);
      if (!response.ok) {
        throw new Error('Student not found');
      }
      const student = await response.json();
      if (student.statusKelulusan === 1) {
        window.location.href = `lulus.html?nis=${encodeURIComponent(student.nis)}`;
      } else {
        window.location.href = `tidakLulus.html?nis=${encodeURIComponent(student.nis)}`;
      }
    } catch (error) {
      alertEl.textContent = "Data tidak ditemukan. Periksa kembali Nomor Induk Siswa Nasional Anda.";
      alertEl.style.display = "block";
    }
  });
}
