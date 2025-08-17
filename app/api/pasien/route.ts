import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Gender, Agama, StatusPerkawinan } from '@prisma/client'

// GET: Mengambil daftar pasien dengan filter dan paginasi
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const gender = searchParams.get('jenisKelamin')
    const insurance = searchParams.get('jenisAsuransi')
    const skip = (page - 1) * limit

    let whereClause: any = { AND: [] }

    // Kondisi untuk Pencarian
    if (search) {
      // PERBAIKAN: Menghapus 'mode: insensitive'
      whereClause.AND.push({
        OR: [
          { name: { contains: search } },
          { nik: { contains: search } },
          { noRekamMedis: { contains: search } },
        ],
      })
    }

    // Kondisi untuk Filter Jenis Kelamin
    if (gender) {
      whereClause.AND.push({ gender: gender as Gender })
    }

    // Kondisi untuk Filter Asuransi
    if (insurance) {
      whereClause.AND.push({ jenisAsuransi: insurance })
    }
    
    // Hapus klausa AND jika tidak ada filter/pencarian
    if (whereClause.AND.length === 0) {
        delete whereClause.AND
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.patient.count({ where: whereClause }),
    ])

    return NextResponse.json({
      success: true,
      data: patients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get pasien error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}

// POST: Membuat data pasien baru
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const lastPatient = await prisma.patient.findFirst({
      orderBy: { noRekamMedis: 'desc' },
    })

    let nextNumber = 1
    if (lastPatient?.noRekamMedis) {
      const lastNumberMatch = lastPatient.noRekamMedis.match(/\d+$/);
      if (lastNumberMatch) {
        nextNumber = parseInt(lastNumberMatch[0], 10) + 1;
      }
    }
    const noRekamMedis = `RM${nextNumber.toString().padStart(6, '0')}`

    const patientData = {
        noRekamMedis: noRekamMedis,
        name: data.name,
        nik: data.nik,
        tempatLahir: data.tempatLahir,
        birthDate: new Date(data.birthDate),
        gender: data.gender as Gender,
        address: data.address,
        phone: data.phone,
        email: data.email,
        pekerjaan: data.pekerjaan,
        statusPerkawinan: data.statusPerkawinan as StatusPerkawinan,
        agama: data.agama as Agama,
        jenisAsuransi: data.jenisAsuransi,
        noAsuransi: data.noAsuransi,
        bloodType: data.bloodType,
        allergies: data.allergies,
        emergencyContact: data.emergencyContact,
    };

    const newPatient = await prisma.patient.create({
      data: patientData,
    })

    return NextResponse.json({
      success: true,
      data: newPatient,
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create pasien error:', error)
    
    if (error.code === 'P2002') {
        const target = error.meta?.target as string[];
        if (target.includes('nik')) {
            return NextResponse.json({ success: false, error: 'NIK sudah terdaftar.' }, { status: 409 });
        }
        if (target.includes('email')) {
            return NextResponse.json({ success: false, error: 'Email sudah terdaftar.' }, { status: 409 });
        }
        if (target.includes('noRekamMedis')) {
            return NextResponse.json({ success: false, error: 'Nomor Rekam Medis duplikat, coba lagi.' }, { status: 409 });
        }
    }

    return NextResponse.json(
      { success: false, error: 'Gagal membuat data pasien baru' },
      { status: 500 }
    )
  }
}
