import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Gender, Agama, StatusPerkawinan } from '@prisma/client'

// POST: Menerima dan menyimpan data pasien dari file Excel/CSV
export async function POST(request: NextRequest) {
  try {
    const patientsData = await request.json()

    // Validasi dasar: pastikan data yang diterima adalah array dan tidak kosong
    if (!Array.isArray(patientsData) || patientsData.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada data pasien untuk diimpor.' }, { status: 400 })
    }

    // Format data agar sesuai dengan skema Prisma (terutama tanggal)
    const formattedData = patientsData.map(patient => ({
      ...patient,
      birthDate: new Date(patient.birthDate), // Konversi string tanggal menjadi objek Date
      // Pastikan enum diisi dengan benar, jika tidak ada berikan default atau null
      gender: patient.gender as Gender || 'MALE',
      agama: patient.agama as Agama || null,
      statusPerkawinan: patient.statusPerkawinan as StatusPerkawinan || null,
    }));

    // Gunakan createMany untuk mengimpor banyak data sekaligus
    // skipDuplicates akan mencegah error jika ada noRekamMedis/nik/email yang sama
    const result = await prisma.patient.createMany({
      data: formattedData,
      skipDuplicates: true, 
    })

    return NextResponse.json({
      success: true,
      message: `${result.count} data pasien berhasil diimpor.`,
      data: result,
    }, { status: 201 })

  } catch (error: any) {
    console.error('Import pasien error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat proses impor data.' },
      { status: 500 }
    )
  }
}
