import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID diperlukan' }, { status: 400 })
    }

    const today = new Date()
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0))
    const endOfToday = new Date(new Date().setHours(23, 59, 59, 999))
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    // 1. Ambil data absensi hari ini
    const todayAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    })

    // 2. Ambil 10 riwayat absensi terakhir
    const history = await prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
    })

    // 3. Hitung statistik untuk bulan ini
    const monthlyAttendance = await prisma.attendance.findMany({
        where: {
            userId,
            date: {
                gte: startOfMonth,
                lte: endOfMonth,
            }
        }
    });

    const stats = {
        bulanIni: monthlyAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length,
        tepatWaktu: monthlyAttendance.filter(a => a.status === 'PRESENT').length,
        terlambat: monthlyAttendance.filter(a => a.status === 'LATE').length,
        izinSakit: monthlyAttendance.filter(a => a.status === 'SICK' || a.status === 'LEAVE').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        today: todayAttendance,
        history,
        stats,
      },
    })
  } catch (error) {
    console.error('[API_ABSENSI_SAYA_ERROR]', error)
    return NextResponse.json({ success: false, error: 'Gagal mengambil data absensi' }, { status: 500 })
  }
}
