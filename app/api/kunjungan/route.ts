import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Mengambil daftar kunjungan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tanggal = searchParams.get('tanggal')
    
    let whereClause: any = {}

    // Filter berdasarkan tanggal (untuk antrian hari ini)
    if (tanggal) {
      const date = new Date(tanggal)
      const startOfDay = new Date(date.setHours(0, 0, 0, 0))
      const endOfDay = new Date(date.setHours(23, 59, 59, 999))
      
      whereClause.visitDate = {
        gte: startOfDay,
        lte: endOfDay
      }
    }

    // PERBAIKAN: Menggunakan model 'visit' dan relasi 'patient' yang benar
    const visits = await prisma.visit.findMany({
      where: whereClause,
      orderBy: { visitDate: 'asc' },
      include: {
        patient: { // Menggunakan nama relasi yang benar: 'patient'
          select: {
            name: true // Mengambil field 'name' yang benar
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: visits,
    })

  } catch (error) {
    console.error('Get kunjungan error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}

// POST: Membuat kunjungan baru dari formulir lengkap
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.patientId || !data.alasanKunjungan || !data.klinikTujuan) {
        return NextResponse.json(
            { success: false, error: 'Data tidak lengkap. ID Pasien, Alasan Kunjungan, dan Klinik Tujuan wajib diisi.' },
            { status: 400 }
        );
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const existingVisit = await prisma.visit.findFirst({
        where: {
            patientId: data.patientId,
            visitDate: { gte: startOfDay, lte: endOfDay }
        }
    });

    if (existingVisit) {
        return NextResponse.json(
            { success: false, error: 'Pasien sudah terdaftar untuk kunjungan hari ini.' },
            { status: 409 }
        );
    }

    const newVisit = await prisma.visit.create({
      data: {
        patientId: data.patientId,
        noRekamMedis: data.noRekamMedis,
        complaint: data.keluhan,
        alasanKunjungan: data.alasanKunjungan,
        klinikTujuan: data.klinikTujuan,
        jenisAsuransi: data.jenisAsuransi,
        visitDate: new Date(),
        status: 'WAITING',
      },
      include: {
        patient: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: newVisit
    }, { status: 201 })

  } catch (error) {
    console.error('Create kunjungan error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mendaftarkan kunjungan baru' },
      { status: 500 }
    )
  }
}
