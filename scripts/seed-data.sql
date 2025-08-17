-- Insert sample users
INSERT INTO users (id, username, password, name, email, role) VALUES
('admin-001', 'admin', '$2b$10$hash_admin123', 'Administrator', 'admin@klinik.com', 'ADMIN'),
('dokter-001', 'dokter', '$2b$10$hash_dokter123', 'Dr. Ahmad Wijaya', 'ahmad@klinik.com', 'DOKTER'),
('dokter-002', 'dokter2', '$2b$10$hash_dokter123', 'Dr. Sari Dewi', 'sari@klinik.com', 'DOKTER'),
('apotik-001', 'apotik', '$2b$10$hash_apotik123', 'Apt. Sari Dewi', 'apoteker@klinik.com', 'APOTIK'),
('pegawai-001', 'pegawai', '$2b$10$hash_pegawai123', 'Budi Santoso', 'budi@klinik.com', 'PEGAWAI'),
('pegawai-002', 'perawat1', '$2b$10$hash_pegawai123', 'Siti Aminah', 'siti@klinik.com', 'PEGAWAI'),
('pegawai-003', 'perawat2', '$2b$10$hash_pegawai123', 'Rina Sari', 'rina@klinik.com', 'PEGAWAI');

-- Insert sample patients
INSERT INTO patients (id, no_rekam_medis, nama_lengkap, alamat_lengkap, tanggal_lahir, jenis_kelamin, ibu_kandung, no_telepon, agama, status_perkawinan, pekerjaan, pendidikan_terakhir, identitas, jenis_asuransi, no_bpjs) VALUES
('patient-001', '07156', 'Aisyah Rahmawati', 'Jl. Merdeka No. 123, Jakarta Pusat, DKI Jakarta', '2000-01-01', 'Perempuan', 'Siti Rahmawati', '081234567890', 'Islam', 'Belum', 'Mahasiswa', 'SMA', 'KTP', 'BPJS', '0001234567890'),
('patient-002', '07157', 'Budi Santoso', 'Jl. Sudirman No. 456, Jakarta Selatan, DKI Jakarta', '1985-05-15', 'Laki-laki', 'Mariam Santoso', '081234567891', 'Islam', 'Menikah', 'Karyawan Swasta', 'S1', 'KTP', 'Umum', NULL),
('patient-003', '07158', 'Siti Nurhaliza', 'Jl. Thamrin No. 789, Jakarta Pusat, DKI Jakarta', '1992-12-20', 'Perempuan', 'Aminah Nurhaliza', '081234567892', 'Islam', 'Menikah', 'Ibu Rumah Tangga', 'SMA', 'KTP', 'BPJS', '0001234567891'),
('patient-004', '07159', 'Ahmad Fauzi', 'Jl. Gatot Subroto No. 321, Jakarta Selatan, DKI Jakarta', '1978-08-10', 'Laki-laki', 'Fatimah Ahmad', '081234567893', 'Islam', 'Menikah', 'PNS', 'S1', 'KTP', 'BPJS', '0001234567892'),
('patient-005', '07160', 'Dewi Sartika', 'Jl. Kuningan No. 654, Jakarta Selatan, DKI Jakarta', '1995-03-25', 'Perempuan', 'Sri Dewi', '081234567894', 'Islam', 'Belum', 'Guru', 'S1', 'KTP', 'Asuransi Lain', NULL);

-- Insert sample medicines
INSERT INTO medicines (id, kode, nama, bentuk, dosis, stok, min_stok, harga, expired_date, supplier, kategori) VALUES
('med-001', 'MED001', 'Paracetamol', 'Tablet', '500mg', 150, 50, 2500.00, '2026-12-31', 'PT. Kimia Farma', 'Analgesik'),
('med-002', 'MED002', 'Amoxicillin', 'Kapsul', '250mg', 89, 30, 5000.00, '2025-08-15', 'PT. Sanbe Farma', 'Antibiotik'),
('med-003', 'MED003', 'Ibuprofen', 'Tablet', '400mg', 25, 50, 3500.00, '2025-06-20', 'PT. Dexa Medica', 'Anti-inflamasi'),
('med-004', 'MED004', 'Vitamin C', 'Tablet', '1000mg', 200, 100, 1500.00, '2027-03-10', 'PT. Kalbe Farma', 'Vitamin'),
('med-005', 'MED005', 'Antasida', 'Tablet Kunyah', '200mg', 5, 20, 2000.00, '2025-11-30', 'PT. Combiphar', 'Antasida'),
('med-006', 'MED006', 'Vitamin B Complex', 'Tablet', '50mg', 12, 25, 3000.00, '2026-09-15', 'PT. Kalbe Farma', 'Vitamin'),
('med-007', 'MED007', 'Salep Mata', 'Salep', '5g', 3, 10, 15000.00, '2025-12-20', 'PT. Combiphar', 'Oftalmologi'),
('med-008', 'MED008', 'Cetirizine', 'Tablet', '10mg', 75, 30, 4000.00, '2026-05-30', 'PT. Dexa Medica', 'Antihistamin');

-- Insert sample visits
INSERT INTO visits (id, patient_id, user_id, tanggal, jam, hari, klinik_tujuan, jenis_asuransi, alasan_kunjungan, keluhan, status) VALUES
('visit-001', 'patient-001', 'dokter-001', '2025-01-07', '09:30:00', 'Selasa', 'Umum', 'BPJS', 'Kontrol diabetes', 'Merasa lemas dan sering haus', 'Selesai'),
('visit-002', 'patient-002', 'dokter-002', '2025-01-07', '10:15:00', 'Selasa', 'Gigi', 'Umum', 'Sakit gigi', 'Gigi berlubang dan nyeri', 'Dalam Pemeriksaan'),
('visit-003', 'patient-003', 'dokter-001', '2025-01-07', '11:00:00', 'Selasa', 'Umum', 'BPJS', 'Kontrol rutin', 'Kontrol tekanan darah', 'Menunggu'),
('visit-004', 'patient-001', 'dokter-001', '2025-01-06', '14:30:00', 'Senin', 'Umum', 'BPJS', 'Kontrol diabetes', 'Kontrol gula darah rutin', 'Selesai'),
('visit-005', 'patient-004', 'dokter-001', '2025-01-05', '08:45:00', 'Minggu', 'Umum', 'BPJS', 'Hipertensi', 'Tekanan darah tinggi', 'Selesai');

-- Insert sample medical records
INSERT INTO medical_records (id, visit_id, patient_id, user_id, hubungan_pasien_keluarga, tinggi_badan, berat_badan, suhu, nadi, respirasi, tekanan_darah, subjective, objective, assessment, plan) VALUES
('record-001', 'visit-001', 'patient-001', 'dokter-001', 'Baik', 160.00, 65.00, 36.5, 80, 20, '130/80', 'Pasien mengeluh lemas dan sering haus', 'TD: 130/80, Nadi: 80x/mnt, RR: 20x/mnt, Suhu: 36.5°C', 'Diabetes Mellitus Tipe 2 terkontrol', 'Lanjutkan terapi, kontrol 1 bulan'),
('record-002', 'visit-004', 'patient-001', 'dokter-001', 'Baik', 160.00, 65.00, 36.8, 78, 18, '125/75', 'Kontrol rutin diabetes', 'Kondisi umum baik, gula darah terkontrol', 'Diabetes Mellitus Tipe 2 terkontrol', 'Lanjutkan obat, diet rendah gula'),
('record-003', 'visit-005', 'patient-004', 'dokter-001', 'Baik', 170.00, 75.00, 36.2, 85, 22, '150/90', 'Sakit kepala, pusing', 'TD tinggi, kondisi umum cukup baik', 'Hipertensi Grade 1', 'Obat antihipertensi, diet rendah garam');

-- Insert sample prescriptions
INSERT INTO prescriptions (id, visit_id, patient_id, doctor_id, status, total_harga, catatan) VALUES
('prescription-001', 'visit-001', 'patient-001', 'dokter-001', 'Siap Diambil', 15000.00, 'Diminum setelah makan'),
('prescription-002', 'visit-004', 'patient-001', 'dokter-001', 'Selesai', 12000.00, 'Kontrol gula darah rutin'),
('prescription-003', 'visit-005', 'patient-004', 'dokter-001', 'Sedang Disiapkan', 18000.00, 'Pantau tekanan darah');

-- Insert sample prescription items
INSERT INTO prescription_items (id, prescription_id, medicine_id, jumlah, dosis, aturan_pakai, harga_satuan, subtotal) VALUES
('item-001', 'prescription-001', 'med-001', 10, '500mg', '3x1 tablet setelah makan', 2500.00, 25000.00),
('item-002', 'prescription-001', 'med-004', 10, '1000mg', '1x1 tablet pagi hari', 1500.00, 15000.00),
('item-003', 'prescription-002', 'med-001', 6, '500mg', '3x1 tablet bila perlu', 2500.00, 15000.00),
('item-004', 'prescription-003', 'med-002', 12, '250mg', '3x1 kapsul sebelum makan', 5000.00, 60000.00);

-- Insert sample attendance
INSERT INTO attendance (id, user_id, tanggal, jam_masuk, jam_keluar, status, keterangan) VALUES
('att-001', 'pegawai-001', '2025-01-07', '08:00:00', '16:00:00', 'HADIR', '-'),
('att-002', 'admin-001', '2025-01-07', '07:30:00', '16:30:00', 'HADIR', '-'),
('att-003', 'dokter-001', '2025-01-07', '09:00:00', '17:00:00', 'HADIR', '-'),
('att-004', 'apotik-001', '2025-01-07', '08:30:00', NULL, 'HADIR', 'Belum checkout'),
('att-005', 'pegawai-002', '2025-01-07', NULL, NULL, 'TIDAK_HADIR', 'Sakit'),
('att-006', 'pegawai-001', '2025-01-06', '08:00:00', '16:00:00', 'HADIR', '-'),
('att-007', 'pegawai-001', '2025-01-05', '08:15:00', '16:05:00', 'HADIR', '-'),
('att-008', 'pegawai-001', '2025-01-04', '08:00:00', '16:00:00', 'HADIR', '-'),
('att-009', 'pegawai-001', '2025-01-03', '08:30:00', '16:30:00', 'TERLAMBAT', '-'),
('att-010', 'pegawai-001', '2025-01-02', NULL, NULL, 'IZIN', 'Keperluan keluarga');

-- Insert sample medicine stock logs
INSERT INTO medicine_stock_logs (id, medicine_id, user_id, type, jumlah, stok_sebelum, stok_sesudah, keterangan) VALUES
('log-001', 'med-001', 'apotik-001', 'MASUK', 100, 50, 150, 'Pembelian dari supplier'),
('log-002', 'med-002', 'apotik-001', 'MASUK', 50, 39, 89, 'Restok bulanan'),
('log-003', 'med-001', 'apotik-001', 'KELUAR', 10, 160, 150, 'Resep pasien Aisyah'),
('log-004', 'med-003', 'apotik-001', 'KELUAR', 25, 50, 25, 'Resep berbagai pasien'),
('log-005', 'med-005', 'apotik-001', 'KELUAR', 15, 20, 5, 'Penjualan bebas');

-- Update medicine status based on stock
UPDATE medicines SET status = 'Stok Habis' WHERE stok = 0;
UPDATE medicines SET status = 'Stok Menipis' WHERE stok > 0 AND stok <= min_stok;
UPDATE medicines SET status = 'Tersedia' WHERE stok > min_stok;
