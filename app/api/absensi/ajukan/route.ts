import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AttendanceStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { userId, status, notes } = await request.json();

    if (!userId || !status) {
      return NextResponse.json({ success: false, error: 'User ID dan Status diperlukan' }, { status: 400 });
    }

    // Validasi status yang diizinkan untuk pengajuan
    if (status !== 'SICK' && status !== 'LEAVE') {
        return NextResponse.json({ success: false, error: 'Status tidak valid. Hanya SICK atau LEAVE yang diizinkan.' }, { status: 400 });
    }

    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));

    // Cek apakah sudah ada data absensi untuk user ini pada hari ini
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: startOfToday,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json({ success: false, error: 'Anda sudah memiliki data absensi hari ini.' }, { status: 409 });
    }

    // Buat record absensi baru untuk Izin/Sakit
    const newAttendance = await prisma.attendance.create({
      data: {
        userId,
        date: startOfToday,
        checkIn: null, // Tidak ada check-in untuk izin/sakit
        checkOut: null,
        status: status as AttendanceStatus,
        notes: notes || null, // Simpan keterangan jika ada
      },
    });

    return NextResponse.json({ success: true, data: newAttendance }, { status: 201 });

  } catch (error: any) {
    console.error('[API_AJUKAN_IZIN_ERROR]', error);
    if (error.code === 'P2002') {
        return NextResponse.json({ success: false, error: 'Anda sudah memiliki data absensi hari ini.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Gagal mengajukan izin/sakit' }, { status: 500 });
  }
}
