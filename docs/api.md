# API Documentation

## Authentication

### POST /api/auth/login
Login to the system

**Request Body:**
\`\`\`json
{
  "username": "string",
  "password": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "name": "string",
      "email": "string",
      "role": "ADMIN|DOKTER|APOTIK|PEGAWAI"
    },
    "token": "string"
  }
}
\`\`\`

## Patients (Pasien)

### GET /api/pasien
Get list of patients

**Query Parameters:**
- `search` (optional): Search by name or medical record number
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "noRekamMedis": "string",
      "namaLengkap": "string",
      "alamatLengkap": "string",
      "tanggalLahir": "date",
      "jenisKelamin": "LAKI_LAKI|PEREMPUAN",
      "noTelepon": "string",
      "jenisAsuransi": "UMUM|BPJS|ASURANSI_LAIN"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
\`\`\`

### POST /api/pasien
Create new patient

**Request Body:**
\`\`\`json
{
  "namaLengkap": "string",
  "alamatLengkap": "string",
  "tanggalLahir": "date",
  "jenisKelamin": "LAKI_LAKI|PEREMPUAN",
  "ibuKandung": "string",
  "noTelepon": "string",
  "agama": "ISLAM|KRISTEN|KATOLIK|HINDU|BUDDHA|KONGHUCU",
  "statusPerkawinan": "BELUM|MENIKAH|JANDA",
  "pekerjaan": "string",
  "pendidikanTerakhir": "string",
  "identitas": "KTP|SIM|KARTU_PELAJAR|LAIN_LAIN",
  "jenisAsuransi": "UMUM|BPJS|ASURANSI_LAIN",
  "noBpjs": "string"
}
\`\`\`

### GET /api/pasien/[id]
Get patient details

### PUT /api/pasien/[id]
Update patient

### DELETE /api/pasien/[id]
Delete patient

## Visits (Kunjungan)

### GET /api/kunjungan
Get list of visits

**Query Parameters:**
- `search` (optional): Search by patient name or medical record number
- `status` (optional): Filter by status
- `tanggal` (optional): Filter by date
- `page` (optional): Page number
- `limit` (optional): Items per page

### POST /api/kunjungan
Create new visit

**Request Body:**
\`\`\`json
{
  "pasienId": "string",
  "userId": "string",
  "tanggal": "date",
  "jam": "time",
  "klinikTujuan": "UMUM|ANAK|GIGI|KIA",
  "jenisAsuransi": "UMUM|BPJS|ASURANSI_LAIN",
  "alasanKunjungan": "string",
  "keluhan": "string"
}
\`\`\`

## Medical Records (Rekam Medis)

### GET /api/rekam-medis
Get list of medical records

### POST /api/rekam-medis
Create new medical record

**Request Body:**
\`\`\`json
{
  "kunjunganId": "string",
  "pasienId": "string",
  "userId": "string",
  "hubunganPasienKeluarga": "string",
  "statusPsikologis": "object",
  "statusFungsional": "object",
  "penurunanBB": "boolean",
  "penurunanNafsuMakan": "boolean",
  "tinggiBadan": "number",
  "beratBadan": "number",
  "suhu": "number",
  "nadi": "number",
  "respirasi": "number",
  "tekananDarah": "string",
  "alergiObat": "string",
  "obatRutinDikonsumsi": "string",
  "tinggiNyeri": "number",
  "skalaNyeri": "string",
  "risikoJatuh": "string",
  "masalahKeperawatan": "object",
  "rencanaIntervensi": "object",
  "subjective": "string",
  "objective": "string",
  "assessment": "string",
  "plan": "string",
  "fileLampiran": "array"
}
\`\`\`

### GET /api/rekam-medis/[id]/pdf
Export medical record to PDF

## Medicines (Obat)

### GET /api/obat
Get list of medicines

**Query Parameters:**
- `search` (optional): Search by name or code
- `kategori` (optional): Filter by category
- `stokMenupis` (optional): Filter low stock items
- `page` (optional): Page number
- `limit` (optional): Items per page

### POST /api/obat
Create new medicine

**Request Body:**
\`\`\`json
{
  "namaObat": "string",
  "jenisObat": "string",
  "kategori": "string",
  "satuan": "string",
  "stok": "number",
  "hargaBeli": "number",
  "hargaJual": "number",
  "supplier": "string",
  "tanggalKadaluarsa": "date",
  "deskripsi": "string"
}
\`\`\`

## Prescriptions (Resep)

### GET /api/resep
Get list of prescriptions

### POST /api/resep
Create new prescription

**Request Body:**
\`\`\`json
{
  "pasienId": "string",
  "dokterId": "string",
  "diagnosis": "string",
  "detailObat": [
    {
      "obatId": "string",
      "jumlah": "number",
      "aturanPakai": "string",
      "catatan": "string"
    }
  ]
}
\`\`\`

## Attendance (Absensi)

### GET /api/absensi
Get attendance records

### POST /api/absensi
Create attendance record

### POST /api/absensi/checkout
Checkout attendance

## File Upload

### POST /api/upload
Upload file

**Request:** Multipart form data with file

**Response:**
\`\`\`json
{
  "success": true,
  "filename": "string",
  "url": "string",
  "size": "number",
  "type": "string"
}
\`\`\`

## Dashboard Stats

### GET /api/dashboard/stats
Get dashboard statistics

**Query Parameters:**
- `role`: User role (ADMIN|DOKTER|APOTIK|PEGAWAI)

**Response varies by role**
