-- Create database
CREATE DATABASE IF NOT EXISTS sim_rekam_medis;
USE sim_rekam_medis;

-- Create users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role ENUM('ADMIN', 'DOKTER', 'APOTIK', 'PEGAWAI') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create patients table
CREATE TABLE patients (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    no_rekam_medis VARCHAR(20) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    alamat_lengkap TEXT NOT NULL,
    tanggal_lahir DATE NOT NULL,
    jenis_kelamin ENUM('Laki-laki', 'Perempuan') NOT NULL,
    ibu_kandung VARCHAR(100) NOT NULL,
    no_telepon VARCHAR(20) NOT NULL,
    agama ENUM('Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu') DEFAULT 'Islam',
    status_perkawinan ENUM('Belum', 'Menikah', 'Janda') DEFAULT 'Belum',
    pekerjaan VARCHAR(100),
    pendidikan_terakhir VARCHAR(100),
    identitas ENUM('KTP', 'SIM', 'Kartu Pelajar', 'Lain-lain') DEFAULT 'KTP',
    jenis_asuransi ENUM('Umum', 'BPJS', 'Asuransi Lain') DEFAULT 'Umum',
    no_bpjs VARCHAR(20),
    status ENUM('Aktif', 'Tidak Aktif') DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create visits table
CREATE TABLE visits (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    patient_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    tanggal DATE NOT NULL,
    jam TIME NOT NULL,
    hari VARCHAR(10) NOT NULL,
    klinik_tujuan ENUM('Umum', 'Anak', 'Gigi', 'KIA') NOT NULL,
    jenis_asuransi ENUM('Umum', 'BPJS', 'Asuransi Lain') NOT NULL,
    alasan_kunjungan TEXT NOT NULL,
    keluhan TEXT,
    status ENUM('Menunggu', 'Dalam Pemeriksaan', 'Selesai') DEFAULT 'Menunggu',
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  'Selesai') DEFAULT 'Menunggu',
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create medical_records table
CREATE TABLE medical_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    visit_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    
    -- Riwayat Psikososial
    hubungan_pasien_keluarga TEXT,
    status_psikologis JSON,
    status_fungsional JSON,
    
    -- Skrining Gizi
    penurunan_bb BOOLEAN DEFAULT FALSE,
    penurunan_nafsu_makan BOOLEAN DEFAULT FALSE,
    tinggi_badan DECIMAL(5,2),
    berat_badan DECIMAL(5,2),
    
    -- Vital Signs
    suhu DECIMAL(4,2),
    nadi INT,
    respirasi INT,
    tekanan_darah VARCHAR(20),
    
    -- Alergi dan Obat
    alergi_obat TEXT,
    obat_rutin_dikonsumsi TEXT,
    
    -- Asesmen Nyeri
    tinggi_nyeri INT,
    skala_nyeri VARCHAR(50),
    
    -- Get Up & Go
    risiko_jatuh ENUM('Tidak Berisiko', 'Risiko Rendah', 'Risiko Tinggi'),
    
    -- Masalah Keperawatan
    masalah_keperawatan JSON,
    rencana_intervensi JSON,
    
    -- SOAP Notes
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create medicines table
CREATE TABLE medicines (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    kode VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(100) NOT NULL,
    bentuk ENUM('Tablet', 'Kapsul', 'Sirup', 'Salep', 'Injeksi', 'Tetes', 'Tablet Kunyah') NOT NULL,
    dosis VARCHAR(50) NOT NULL,
    stok INT NOT NULL DEFAULT 0,
    min_stok INT NOT NULL DEFAULT 10,
    harga DECIMAL(10,2) NOT NULL,
    expired_date DATE NOT NULL,
    supplier VARCHAR(100),
    kategori VARCHAR(50),
    deskripsi TEXT,
    status ENUM('Tersedia', 'Stok Menipis', 'Stok Habis') DEFAULT 'Tersedia',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create prescriptions table
CREATE TABLE prescriptions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    visit_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    pharmacist_id VARCHAR(36),
    status ENUM('Menunggu', 'Sedang Disiapkan', 'Siap Diambil', 'Selesai') DEFAULT 'Menunggu',
    total_harga DECIMAL(10,2) DEFAULT 0,
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pharmacist_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create prescription_items table
CREATE TABLE prescription_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    prescription_id VARCHAR(36) NOT NULL,
    medicine_id VARCHAR(36) NOT NULL,
    jumlah INT NOT NULL,
    dosis VARCHAR(100) NOT NULL,
    aturan_pakai TEXT NOT NULL,
    harga_satuan DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);

-- Create attendance table
CREATE TABLE attendance (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    tanggal DATE NOT NULL,
    jam_masuk TIME,
    jam_keluar TIME,
    status ENUM('HADIR', 'TIDAK_HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT') NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, tanggal)
);

-- Create medicine_stock_logs table
CREATE TABLE medicine_stock_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    medicine_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('MASUK', 'KELUAR', 'ADJUSTMENT') NOT NULL,
    jumlah INT NOT NULL,
    stok_sebelum INT NOT NULL,
    stok_sesudah INT NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_patients_no_rm ON patients(no_rekam_medis);
CREATE INDEX idx_patients_nama ON patients(nama_lengkap);
CREATE INDEX idx_visits_patient ON visits(patient_id);
CREATE INDEX idx_visits_tanggal ON visits(tanggal);
CREATE INDEX idx_medical_records_visit ON medical_records(visit_id);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medicines_kode ON medicines(kode);
CREATE INDEX idx_medicines_nama ON medicines(nama);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_attendance_user_date ON attendance(user_id, tanggal);
