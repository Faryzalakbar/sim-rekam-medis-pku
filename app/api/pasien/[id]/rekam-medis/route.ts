import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/pasien/[id]/rekam-medis
// Mengambil semua riwayat rekam medis untuk satu pasien secara lengkap
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID Pasien tidak valid' },
        { status: 400 }
      );
    }

    // Mengambil semua rekam medis untuk patientId yang diberikan
    const records = await prisma.medicalRecord.findMany({
      where: { patientId: id },
      orderBy: { createdAt: 'desc' }, // Diurutkan dari yang terbaru
      include: {
        doctor: { select: { name: true } },
        visit: { select: { vitalSigns: true } }, // Mengambil data Tanda Vital dari kunjungan terkait
        prescriptions: {
          include: {
            items: {
              include: {
                medicine: {
                  select: { name: true, unit: true },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: records });

  } catch (error) {
    console.error(`Error fetching medical history for patient ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server saat mengambil riwayat' },
      { status: 500 }
    );
  }
}
