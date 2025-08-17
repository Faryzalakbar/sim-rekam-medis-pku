import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Frontend akan mengirim 'absensiId' dari record absensi hari ini
    const { absensiId } = await request.json()

    if (!absensiId) {
      return NextResponse.json(
        { success: false, error: 'ID Absensi diperlukan' },
        { status: 400 }
      )
    }

    // 1. Cari record absensi berdasarkan ID uniknya
    const attendance = await prisma.attendance.findUnique({ // Diperbaiki: absensi -> attendance
      where: { id: absensiId },
    })

    // 2. Validasi
    if (!attendance) {
      return NextResponse.json(
        { success: false, error: 'Data absensi tidak ditemukan' },
        { status: 404 }
      )
    }

    if (attendance.checkOut) {
      return NextResponse.json(
        { success: false, error: 'Sudah melakukan check-out hari ini' },
        { status: 400 }
      )
    }

    // 3. Update record dengan waktu checkout saat ini
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: new Date(),
        // 'notes' (keterangan) tidak perlu diubah saat checkout
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedAttendance,
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
