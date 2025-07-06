export const prerender = false;

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

function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

async function fetchStudentData(nis) {
    try {
      // Gunakan REST API baru dari https://api.manubanyuputih.id/api/
      const response = await fetch(`https://api.manubanyuputih.id/api/kelulusan`); 
      if (!response.ok) {
        throw new Error('Student not found');
      }
      const result = await response.json();

      // Cari data siswa berdasarkan nis
      const student = result.data.find(s => s.nis === nis);
      if (!student) {
        throw new Error('Student not found in data');
      }
      
      // Update DOM dengan data siswa
      document.getElementById('index-accepted-nisn').textContent = 'NIS ' + student.nis;
      document.getElementById('index-accepted-name').textContent = student.name;
      document.getElementById('index-accepted-program').textContent = student.jurusan;
      document.getElementById('index-accepted-birthday').textContent = formatDateToDDMMYYYY(student.birthday);
      document.getElementById('index-accepted-school').textContent = student.school;
      document.getElementById('index-accepted-regency').textContent = student.regency;
      document.getElementById('index-accepted-province').textContent = student.province;
    } catch (error) {
      console.error(error);
      alert('Data tidak ditemukan.');
    }
  }
  
function fetchStudentDataFromSession() {
    const nis = sessionStorage.getItem('studentNIS');
    if (nis) {
        fetchStudentData(nis);
        // Polling every 3 seconds to update student data automatically
        setInterval(() => {
            fetchStudentData(nis);
        }, 3000);
    } else {
        alert('NIS tidak ditemukan. Silakan kembali ke halaman utama dan masukkan NIS Anda.');
        // Optionally redirect to main page
        // window.location.href = '/';
    }
}

fetchStudentDataFromSession();
