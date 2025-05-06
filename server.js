const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Mock data
  const students = [
    {
      nis: "0076387754",
      name: "Muhammad Fathir Al Faruq",
      statusKelulusan: 1,
      jurusan: "Matematika dan Ilmu Pengetahuan Alam (MIPA)",
      birthday: "26/06/2007",
      school: "MA NU 01 BANYUPUTIH",
      regency: "Kab. Batang",
      province: "Prov. Jawa Tengah"
    },
    {
      nis: "0076387755",
      name: "Siti Aminah",
      statusKelulusan: 0,
      jurusan: "Ilmu Sosial dan Humaniora",
      birthday: "15/08/2007",
      school: "MA NU 01 BANYUPUTIH",
      regency: "Kab. Batang",
      province: "Prov. Jawa Tengah"
    },
    {
      nis: "0076387756",
      name: "Tono Pramono",
      statusKelulusan: 1,
      jurusan: "Agama",
      birthday: "21/04/2007",
      school: "MA NU 01 BANYUPUTIH",
      regency: "Kab. Batang",
      province: "Prov. Jawa Tengah"
    }
];

const jurusanList = [
  "Matematika dan Ilmu Pengetahuan Alam (MIPA)",
  "Ilmu Sosial dan Humaniora",
  "Bahasa dan Budaya",
  "Teknologi dan Rekayasa"
];

// Endpoint to get student by NIS
app.get('/students/:nis', (req, res) => {
  const nis = req.params.nis;
  const student = students.find(s => s.nis === nis);
  if (student) {
    res.json(student);
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

// Endpoint to get jurusan list
app.get('/jurusan', (req, res) => {
  res.json(jurusanList);
});

app.listen(port, () => {
  console.log(`Mock backend API listening at http://localhost:${port}`);
});
