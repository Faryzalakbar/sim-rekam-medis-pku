import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// TAMBAHKAN BARIS INI untuk membuat route menjadi dinamis
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    let stats: any = {}

    if (role === 'ADMIN') {
      const [
        totalPasien,
        kunjunganHariIni,
        stokObatMenipis,
        pegawaiHadir,
        pegawaiTotal
      ] = await Promise.all([
        prisma.patient.count(),
        prisma.visit.count({
          where: {
            visitDate: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        }),
        prisma.medicine.count({
          where: {
            stock: { lt: 20 }
          }
        }),
        prisma.attendance.count({
          where: {
            date: {
              gte: startOfDay,
              lte: endOfDay
            },
            status: { in: ['PRESENT', 'LATE'] }
          }
        }),
        prisma.user.count({
          where: {
            role: { in: ['DOKTER', 'APOTIK', 'PEGAWAI'] },
          }
        })
      ])

      stats = {
        totalPasien,
        kunjunganHariIni,
        stokObatMenipis,
        pegawaiHadir,
        pegawaiTotal
      }
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('[API_STATS_ERROR]', error);
    let errorMessage = 'Terjadi kesalahan pada server saat mengambil data statistik.';
    if (error instanceof Prisma.PrismaClientValidationError) {
        errorMessage = 'Kesalahan validasi data. Periksa nama model/field/enum di API statistik.';
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
