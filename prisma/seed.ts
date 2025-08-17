import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

// Fungsi bantuan untuk menghasilkan angka acak dalam rentang
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Fungsi untuk membuat kode obat dari nama
const generateCode = (name: string) => {
    return name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 10);
}

async function main() {
  console.log('🌱 Starting database seeding...')

  // --- Create Users ---
  const password = await hash('password123', 10)
  await prisma.user.createMany({
    data: [
      { name: 'Dr. Administrator', email: 'admin@klinik.com', password, role: Role.ADMIN },
      { name: 'Dr. Budi Santoso', email: 'dokter@klinik.com', password, role: Role.DOKTER },
      { name: 'Citra Lestari', email: 'apotik@klinik.com', password, role: Role.APOTIK },
      { name: 'Dian Permata', email: 'pegawai@klinik.com', password, role: Role.PEGAWAI },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Users seeded')

  // --- Create Patients ---
  await prisma.patient.createMany({
    data: [
      {
        noRekamMedis: 'RM000001',
        name: 'Eko Prasetyo',
        birthDate: new Date('1985-05-15'),
        gender: 'MALE',
        address: 'Jl. Merdeka No. 10, Jakarta',
        phone: '081234567890',
        email: 'eko.prasetyo@example.com',
      },
      {
        noRekamMedis: 'RM000002',
        name: 'Siti Aminah',
        birthDate: new Date('1992-11-20'),
        gender: 'FEMALE',
        address: 'Jl. Pahlawan No. 5, Surabaya',
        phone: '087654321098',
        email: 'siti.aminah@example.com',
      },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Patients seeded')

  // --- Create Medicines (Data Lengkap dari Fornas PKU) ---
  const medicines = [
    // Analgesik & Antipirai
    { name: "Kodein 10 mg", type: "Tablet", unit: "Strip", price: 15000, description: "FPKTP: 30 tab/bulan." },
    { name: "Kodein 15 mg", type: "Tablet", unit: "Strip", price: 17000, description: "" },
    { name: "Kodein tab 20 mg", type: "Tablet", unit: "Strip", price: 20000, description: "" },
    { name: "Asam Mefenamat 250 mg", type: "Kapsul", unit: "Strip", price: 6000, description: "30 kaps/bulan." },
    { name: "Asam Mefenamat 500 mg", type: "Tablet", unit: "Strip", price: 7000, description: "30 tab/bulan." },
    { name: "Ibuprofen 200 mg", type: "Tablet", unit: "Strip", price: 5000, description: "30 tab/bulan." },
    { name: "Ibuprofen 400 mg", type: "Tablet", unit: "Strip", price: 6000, description: "Nyeri akut: 14 tab/kasus, Nyeri kronis: 60 tab/bulan." },
    { name: "Ibuprofen susp 100 mg/5 mL", type: "Sirup", unit: "Botol", price: 12000, description: "1 btl/kasus." },
    { name: "Ibuprofen susp 200 mg/5 mL", type: "Sirup", unit: "Botol", price: 15000, description: "1 btl/kasus." },
    { name: "Natrium Diklofenak 25 mg", type: "Tablet", unit: "Strip", price: 7500, description: "30 tab/bulan." },
    { name: "Natrium Diklofenak 50 mg", type: "Tablet", unit: "Strip", price: 8000, description: "30 tab/bulan." },
    { name: "Parasetamol tab 500 mg", type: "Tablet", unit: "Strip", price: 5000, description: "180 tab/bulan." },
    { name: "Parasetamol sir 120 mg/5 mL", type: "Sirup", unit: "Botol", price: 9000, description: "2 btl/kasus." },
    { name: "Parasetamol drops 100 mg/mL", type: "Cair", unit: "Botol", price: 18000, description: "1 btl/kasus." },
    { name: "Alopurinol tab 100 mg", type: "Tablet", unit: "Strip", price: 6500, description: "30 tab/bulan." },
    { name: "Alopurinol tab 300 mg", type: "Tablet", unit: "Strip", price: 10000, description: "60 tab/bulan." },
    { name: "Kolkisin tab 500 mcg", type: "Tablet", unit: "Strip", price: 25000, description: "30 tab/bulan." },
    
    // Antialergi & Anestesi
    { name: "Amitriptilin tab 25 mg", type: "Tablet", unit: "Strip", price: 9000, description: "30 tab/bulan." },
    { name: "Karbamazepin tab 200 mg", type: "Tablet", unit: "Strip", price: 12000, description: "120 tab/bulan." },
    { name: "Lidokain gel 2%", type: "Gel", unit: "Tube", price: 22000, description: "" },
    { name: "Atropin inj 0,25 mg/mL", type: "Injeksi", unit: "Ampul", price: 8000, description: "" },
    { name: "Diazepam inj 5 mg/mL", type: "Injeksi", unit: "Ampul", price: 15000, description: "10 amp/kasus, kecuali ICU." },
    { name: "Deksametason inj 5 mg/mL", type: "Injeksi", unit: "Ampul", price: 7500, description: "20 mg/hari." },
    { name: "Difenhidramin inj 10 mg/mL", type: "Injeksi", unit: "Ampul", price: 6000, description: "30 mg/hari." },
    { name: "Klorfeniramin tab 4 mg", type: "Tablet", unit: "Strip", price: 3000, description: "3 tab/hari, maks 5 hari." },
    { name: "Loratadin tab 10 mg", type: "Tablet", unit: "Strip", price: 5500, description: "Urtikaria akut: 1 tab/hari, maks 5 hari." },
    { name: "Setirizin 10 mg", type: "Tablet", unit: "Strip", price: 5000, description: "Urtikaria akut: 1 tab/hari, maks 5 hari. Kronik: maks 30 tab/bulan." },
    { name: "Setirizin sir 5 mg/5 mL", type: "Sirup", unit: "Botol", price: 14000, description: "1 btl/kasus." },

    // Antiepilepsi & Antiinfeksi
    { name: "Fenitoin kaps 100 mg", type: "Kapsul", unit: "Strip", price: 11000, description: "120 kaps/bulan." },
    { name: "Fenobarbital tab 30 mg", type: "Tablet", unit: "Strip", price: 7000, description: "120 tab/bulan." },
    { name: "Valproat tab lepas lambat 250 mg", type: "Tablet", unit: "Strip", price: 18000, description: "120 tab/bulan." },
    { name: "Albendazol tab 400 mg", type: "Tablet", unit: "Strip", price: 6000, description: "" },
    { name: "Mebendazol tab 500 mg", type: "Tablet", unit: "Strip", price: 5500, description: "" },
    { name: "Pirantel Pamoat tab 250 mg", type: "Tablet", unit: "Strip", price: 7000, description: "" },
    { name: "Amoksisilin tab 500 mg", type: "Kapsul", unit: "Strip", price: 8500, description: "10 hari." },
    { name: "Amoksisilin sir kering 125 mg/5 mL", type: "Sirup", unit: "Botol", price: 13000, description: "1 btl/kasus." },
    { name: "Sefadroksil kaps 500 mg", type: "Kapsul", unit: "Strip", price: 14000, description: "5 hari." },
    { name: "Doksisiklin kaps 100 mg", type: "Kapsul", unit: "Strip", price: 9500, description: "Tidak untuk anak < 6 tahun, ibu hamil/menyusui." },
    { name: "Kloramfenikol kaps 250 mg", type: "Kapsul", unit: "Strip", price: 10000, description: "4 kaps/hari selama 5 hari." },
    { name: "Kotrimoksazol Forte (dewasa)", type: "Tablet", unit: "Strip", price: 9000, description: "Profilaksis HIV: 1 tab/hari. Infeksi: 2 tab/hari selama 10 hari." },
    { name: "Eritromisin tab 500 mg", type: "Tablet", unit: "Strip", price: 16000, description: "4 tab/hari selama 5 hari." },
    { name: "Siprofloksasin tab 500 mg", type: "Tablet", unit: "Strip", price: 11000, description: "Tidak untuk pasien < 18 tahun, ibu hamil/menyusui." },
    { name: "Klindamisin kaps 300 mg", type: "Kapsul", unit: "Strip", price: 17000, description: "4 kaps/hari selama 5 hari." },
    { name: "Metronidazol tab 500 mg", type: "Tablet", unit: "Strip", price: 7500, description: "Infeksi anaerob, maks 2 minggu/kasus." },

    // Lain-lain
    { name: "Amlodipin 5 mg", type: "Tablet", unit: "Strip", price: 6000, description: "30 tab/bulan." },
    { name: "Bisoprolol 5 mg", type: "Tablet", unit: "Strip", price: 12000, description: "30 tab/bulan." },
    { name: "Kaptopril 25 mg", type: "Tablet", unit: "Strip", price: 4500, description: "90 tab/bulan." },
    { name: "Simvastatin 20 mg", type: "Tablet", unit: "Strip", price: 8000, description: "30 tab/bulan." },
    { name: "Antasida (Al(OH)3 + Mg(OH)2)", type: "Tablet", unit: "Strip", price: 4000, description: "Tablet kunyah." },
    { name: "Omeprazol 20 mg", type: "Kapsul", unit: "Strip", price: 9500, description: "30 kaps/bulan." },
    { name: "Ranitidin 150 mg", type: "Tablet", unit: "Strip", price: 6500, description: "30 tab/bulan." },
    { name: "Domperidon 10 mg", type: "Tablet", unit: "Strip", price: 8000, description: "Meredakan mual dan muntah." },
    { name: "Salbutamol 2 mg", type: "Tablet", unit: "Strip", price: 4000, description: "Untuk asma." },
    { name: "Ambroksol 30 mg", type: "Tablet", unit: "Strip", price: 5000, description: "Mukolitik." },
    { name: "Glibenklamid 5 mg", type: "Tablet", unit: "Strip", price: 4000, description: "Dosis maks 15 mg/hari. 90 tab/bulan." },
    { name: "Metformin 500 mg", type: "Tablet", unit: "Strip", price: 5500, description: "120 tab/bulan." },
    { name: "Glimepirid 2 mg", type: "Tablet", unit: "Strip", price: 9000, description: "60 tab/bulan." },
  ].map(med => ({
    ...med,
    code: generateCode(med.name),
    stock: med.type === 'Sirup' || med.type === 'Cair' || med.type === 'Injeksi' ? randomInt(20, 100) : randomInt(50, 300),
    minStock: med.type === 'Sirup' || med.type === 'Cair' || med.type === 'Injeksi' ? 10 : 25,
    expiryDate: new Date(`${randomInt(2025, 2028)}-${randomInt(1, 12)}-${randomInt(1, 28)}`)
  }));

  await prisma.medicine.createMany({
    data: medicines,
    skipDuplicates: true,
  })
  console.log(`✅ ${medicines.length} medicines seeded with Fornas data`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('🌱 Seeding finished.')
  })
