import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Mengambil daftar riwayat rekam medis dengan filter dan paginasi
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const search = searchParams.get('search')
    const doctorId = searchParams.get('doctorId')
    const tanggal = searchParams.get('tanggal')

    let whereClause: any = { AND: [] }

    if (search) {
      whereClause.AND.push({
        OR: [
          { patient: { name: { contains: search, mode: 'insensitive' } } },
          { noRekamMedis: { contains: search, mode: 'insensitive' } },
        ],
      })
    }

    if (doctorId) {
      whereClause.AND.push({ doctorId: doctorId })
    }

    if (tanggal) {
      const date = new Date(tanggal)
      const startOfDay = new Date(date.setHours(0, 0, 0, 0))
      const endOfDay = new Date(date.setHours(23, 59, 59, 999))
      whereClause.AND.push({ createdAt: { gte: startOfDay, lte: endOfDay } })
    }
    
    if (whereClause.AND.length === 0) {
        delete whereClause.AND;
    }

    const [medicalRecords, total] = await prisma.$transaction([
      prisma.medicalRecord.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          // PERBAIKAN: Tambahkan 'phone' untuk mengambil nomor telepon pasien
          patient: { select: { name: true, phone: true } },
          doctor: { select: { name: true } },
          visit: { select: { complaint: true } },
        },
      }),
      prisma.medicalRecord.count({ where: whereClause }),
    ])

    return NextResponse.json({
      success: true,
      data: medicalRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get rekam-medis error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server' }, { status: 500 })
  }
}


// POST: Membuat rekam medis BARU beserta resepnya dalam satu transaksi
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.visitId || !data.patientId || !data.doctorId || !data.assessment || !data.plan) {
      return NextResponse.json({ success: false, error: 'Data inti rekam medis tidak lengkap.' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat entri MedicalRecord
      const newMedicalRecord = await tx.medicalRecord.create({
        data: {
          visitId: data.visitId,
          patientId: data.patientId,
          noRekamMedis: data.noRekamMedis,
          doctorId: data.doctorId,
          subjective: data.subjective,
          objective: data.objective,
          assessment: data.assessment,
          plan: data.plan,
          hubunganKeluarga: data.hubunganKeluarga,
          statusPsikologis: data.statusPsikologis,
          statusFungsional: data.statusFungsional,
          skriningGizi: data.skriningGizi,
          asesmenNyeri: data.asesmenNyeri,
          risikoJatuh: data.risikoJatuh,
          masalahKeperawatan: data.masalahKeperawatan,
          rencanaIntervensi: data.rencanaIntervensi,
          notes: data.notes,
        },
      });

      // 2. Jika ada resep, buat entri Prescription dan PrescriptionItem
      if (data.prescriptionItems && data.prescriptionItems.length > 0) {
        const newPrescription = await tx.prescription.create({
          data: {
            medicalRecordId: newMedicalRecord.id,
            doctorId: data.doctorId,
            patientId: data.patientId,
            noRekamMedis: data.noRekamMedis,
            status: 'PENDING',
          }
        });

        for (const item of data.prescriptionItems) {
          await tx.prescriptionItem.create({
            data: {
              prescriptionId: newPrescription.id,
              medicineId: item.medicineId,
              quantity: item.quantity,
              dosage: item.dosage,
              notes: item.notes || null
            }
          });
          
          await tx.medicine.update({
            where: { id: item.medicineId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      // 3. Update status kunjungan menjadi 'COMPLETED'
      await tx.visit.update({
        where: { id: data.visitId },
        data: { 
          status: 'COMPLETED', 
          vitalSigns: data.vitalSigns || {} 
        },
      });

      return newMedicalRecord;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });

  } catch (error: any) {
    console.error('Create rekam medis & resep error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Rekam medis untuk kunjungan ini sudah pernah dibuat.' }, { status: 409 });
    }
    if (error.message.includes('decrement')) {
      return NextResponse.json({ success: false, error: 'Gagal, stok salah satu obat tidak mencukupi.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Gagal menyimpan data. Terjadi kesalahan internal.' }, { status: 500 });
  }
}
