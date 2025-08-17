import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Fungsi ini akan dipanggil saat mengakses /api/absensi/[userId]
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // ex: '8' for August
    const year = searchParams.get('year')   // ex: '2025'

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID tidak ditemukan' }, { status: 400 })
    }

    const whereClause: any = { userId: userId };

    // Jika parameter bulan dan tahun ada, tambahkan filter tanggal
    if (month && year) {
      const numericMonth = parseInt(month, 10);
      const numericYear = parseInt(year, 10);
      
      const startDate = new Date(numericYear, numericMonth - 1, 1);
      const endDate = new Date(numericYear, numericMonth, 0, 23, 59, 59, 999);

      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Ambil data pegawai dan riwayat absensinya (dengan atau tanpa filter)
    const [user, history] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true }
      }),
      prisma.attendance.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
      })
    ]);

    if (!user) {
      return NextResponse.json({ success: false, error: 'Pegawai tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { user, history } });

  } catch (error) {
    console.error('Get Riwayat Absensi Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil riwayat absensi' }, { status: 500 });
  }
}
