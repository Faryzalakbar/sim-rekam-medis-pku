-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'DOKTER', 'APOTIK', 'PEGAWAI');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."VisitStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PrescriptionStatus" AS ENUM ('PENDING', 'PREPARED', 'READY', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT', 'SICK', 'LEAVE');

-- CreateEnum
CREATE TYPE "public"."StatusPerkawinan" AS ENUM ('BELUM_KAWIN', 'KAWIN', 'CERAI_HIDUP', 'CERAI_MATI');

-- CreateEnum
CREATE TYPE "public"."Agama" AS ENUM ('ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patients" (
    "id" TEXT NOT NULL,
    "noRekamMedis" TEXT NOT NULL,
    "nik" TEXT,
    "name" TEXT NOT NULL,
    "tempatLahir" TEXT,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "bloodType" TEXT,
    "allergies" TEXT,
    "emergencyContact" TEXT,
    "pekerjaan" TEXT,
    "statusPerkawinan" "public"."StatusPerkawinan",
    "agama" "public"."Agama",
    "jenisAsuransi" TEXT,
    "noAsuransi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."visits" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "noRekamMedis" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "complaint" TEXT,
    "klinikTujuan" TEXT,
    "alasanKunjungan" TEXT,
    "jenisAsuransi" TEXT,
    "vitalSigns" JSONB,
    "notes" TEXT,
    "status" "public"."VisitStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medical_records" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "noRekamMedis" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "hubunganKeluarga" TEXT,
    "statusPsikologis" JSONB,
    "statusFungsional" JSONB,
    "skriningGizi" JSONB,
    "asesmenNyeri" JSONB,
    "risikoJatuh" TEXT,
    "masalahKeperawatan" JSONB,
    "rencanaIntervensi" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medicines" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "unit" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 10,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prescriptions" (
    "id" TEXT NOT NULL,
    "medicalRecordId" TEXT NOT NULL,
    "noRekamMedis" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "instructions" TEXT,
    "status" "public"."PrescriptionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prescription_items" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "dosage" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "status" "public"."AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "public"."users"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "patients_noRekamMedis_key" ON "public"."patients"("noRekamMedis");

-- CreateIndex
CREATE UNIQUE INDEX "patients_nik_key" ON "public"."patients"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "public"."patients"("email");

-- CreateIndex
CREATE INDEX "patients_name_idx" ON "public"."patients"("name");

-- CreateIndex
CREATE INDEX "patients_noRekamMedis_idx" ON "public"."patients"("noRekamMedis");

-- CreateIndex
CREATE INDEX "visits_visitDate_idx" ON "public"."visits"("visitDate");

-- CreateIndex
CREATE UNIQUE INDEX "medical_records_visitId_key" ON "public"."medical_records"("visitId");

-- CreateIndex
CREATE INDEX "medical_records_createdAt_idx" ON "public"."medical_records"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "medicines_code_key" ON "public"."medicines"("code");

-- CreateIndex
CREATE INDEX "medicines_name_idx" ON "public"."medicines"("name");

-- CreateIndex
CREATE INDEX "prescriptions_createdAt_idx" ON "public"."prescriptions"("createdAt");

-- CreateIndex
CREATE INDEX "attendances_date_idx" ON "public"."attendances"("date");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_userId_date_key" ON "public"."attendances"("userId", "date");

-- AddForeignKey
ALTER TABLE "public"."visits" ADD CONSTRAINT "visits_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "public"."visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prescriptions" ADD CONSTRAINT "prescriptions_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "public"."medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prescriptions" ADD CONSTRAINT "prescriptions_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prescriptions" ADD CONSTRAINT "prescriptions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prescription_items" ADD CONSTRAINT "prescription_items_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "public"."prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prescription_items" ADD CONSTRAINT "prescription_items_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "public"."medicines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
