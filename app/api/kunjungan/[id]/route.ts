import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { VisitStatus } from '@prisma/client'

// GET: Mengambil data detail satu kunjungan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const visit = await prisma.visit.findUnique({
      where: { id: params.id },
      include: {
        patient: true, // PERBAIKAN: Memastikan data pasien selalu disertakan
        medicalRecord: {
          include: {
            doctor: {
              select: { name: true }
            }
          }
        }
      }
    })

    if (!visit) {
      return NextResponse.json(
        { success: false, error: 'Kunjungan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: visit
    })

  } catch (error) {
    console.error('Get kunjungan detail error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}

// PUT: Memperbarui data kunjungan (misalnya mengubah status)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { status } = data

    if (status && !Object.values(VisitStatus).includes(status)) {
        return NextResponse.json({ success: false, error: 'Status tidak valid.'}, { status: 400 });
    }

    const updatedVisit = await prisma.visit.update({
      where: { id: params.id },
      data: { status: status }
    })

    return NextResponse.json({
      success: true,
      data: updatedVisit
    })

  } catch (error: any) {
     if (error.code === 'P2025') {
        return NextResponse.json({ success: false, error: 'Kunjungan tidak ditemukan untuk diperbarui.' }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui data kunjungan' },
      { status: 500 }
    )
  }
}

// DELETE: Menghapus atau membatalkan kunjungan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    try {
        const visit = await prisma.visit.findUnique({
            where: { id: params.id },
            include: { medicalRecord: true }
        });

        if (!visit) {
            return NextResponse.json({ success: false, error: 'Kunjungan tidak ditemukan.' }, { status: 404 });
        }

        if (visit.medicalRecord) {
            const cancelledVisit = await prisma.visit.update({
                where: { id: params.id },
                data: { status: 'CANCELLED' }
            });
             return NextResponse.json({
                success: true,
                message: 'Kunjungan dibatalkan karena sudah memiliki rekam medis.',
                data: cancelledVisit
            });
        }

        await prisma.visit.delete({
            where: { id: params.id }
        });

        return NextResponse.json({
            success: true,
            message: 'Kunjungan berhasil dihapus.'
        });

    } catch (error) {
        console.error('Delete kunjungan error:', error);
        return NextResponse.json({ success: false, error: 'Gagal menghapus kunjungan.' }, { status: 500 });
    }
}
