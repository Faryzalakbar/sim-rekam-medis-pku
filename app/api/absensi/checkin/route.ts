import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AttendanceStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID diperlukan' }, { status: 400 });
    }

    const now = new Date();
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));

    // Cek terlebih dahulu apakah sudah ada absensi
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: startOfToday,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json({ success: false, error: 'Anda sudah melakukan absensi hari ini.' }, { status: 409 }); // 409 Conflict
    }

    // Tentukan status berdasarkan waktu check-in (anggap jam masuk jam 8 pagi)
    const jamMasuk = new Date(startOfToday).setHours(8, 0, 0, 0);
    const status: AttendanceStatus = now.getTime() > jamMasuk ? 'LATE' : 'PRESENT';

    // Buat record absensi baru
    const newAttendance = await prisma.attendance.create({
      data: {
        userId,
        date: startOfToday,
        checkIn: now,
        status: status,
      },
    });

    return NextResponse.json({ success: true, data: newAttendance }, { status: 201 });

  } catch (error: any) {
    console.error('[API_CHECKIN_ERROR]', error);

    // PERBAIKAN: Menangani error 'Unique constraint failed' secara spesifik
    // Ini akan mengatasi masalah jika tombol check-in diklik berkali-kali dengan cepat
    if (error.code === 'P2002') {
        return NextResponse.json({ success: false, error: 'Anda sudah melakukan absensi hari ini.' }, { status: 409 });
    }

    return NextResponse.json({ success: false, error: 'Gagal melakukan check-in' }, { status: 500 });
  }
}
