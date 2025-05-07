<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Izinkan permintaan dari semua domain (Hanya untuk pengembangan! Untuk produksi, batasi ke domain Anda)

// Konfigurasi koneksi database
$host = "62.72.7.236"; // Ganti dengan host database Anda
$username = "db_lulus25"; // Ganti dengan username database Anda
$password = "bcECXEnsBNpr8hiz"; // Ganti dengan password database Anda
$database = "db_lulus25"; // Ganti dengan nama database Anda

// Membuat koneksi
$conn = new mysqli($host, $username, $password, $database);

// Memeriksa koneksi
if ($conn->connect_error) {
    die(json_encode(['error' => "Koneksi gagal: " . $conn->connect_error])); // Mengembalikan JSON untuk kesalahan
}

// Query untuk mengambil data hitung mundur
$sql = "SELECT event_name, target_date, description, timezone FROM countdowns ORDER BY target_date ASC LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $targetDate = strtotime($row['target_date']);
    $now = time();

    if ($now >= $targetDate) {
        // Waktu sudah lewat, kembalikan pesan khusus
        echo json_encode(['redirect' => true, 'redirect_url' => '/index.html']); // Ganti dengan URL halaman arahan Anda
    } else {
        // Waktu belum lewat, kirim data hitung mundur
        echo json_encode($row);
    }
} else {
    echo json_encode(null); // Mengembalikan null jika tidak ada data
}

// Menutup koneksi
$conn->close();
?>