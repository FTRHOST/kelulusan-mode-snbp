export const prerender = false;

(async () => {
    try {
        const response = await fetch('/api/dibuka.json');
        const data = await response.json();
        const waktuPengumuman = new Date(data.waktu_pengumuman).getTime();
        const now = new Date().getTime();

        if (now < waktuPengumuman) {
            window.location.href = "/timer";
        }
    } catch (error) {
        console.error('Gagal mengambil waktu pengumuman:', error);
    }
})();

async function fetchStudentData(nis) {
    try {
      // Gunakan path relatif ke endpoint Astro
      const response = await fetch(`/api/students/${encodeURIComponent(nis)}.json`); 
      if (!response.ok) {
        throw new Error('Student not found');
      }
      const student = await response.json();
      
      // Update DOM dengan data siswa
      document.getElementById('index-accepted-nisn').textContent = 'NISN ' + student.nis;
      document.getElementById('index-accepted-name').textContent = student.name;
      document.getElementById('index-accepted-program').textContent = student.jurusan;
      document.getElementById('index-accepted-birthday').textContent = student.birthday;
      document.getElementById('index-accepted-school').textContent = student.school;
      document.getElementById('index-accepted-regency').textContent = student.regency;
      document.getElementById('index-accepted-province').textContent = student.province;
    } catch (error) {
      console.error(error);
      alert('Data tidak ditemukan.');
    }
  }
  
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  const nis = getQueryParam('nis');
  if (nis) {
    fetchStudentData(nis);
  } else {
    alert('NIS tidak ditemukan di URL.');
  }