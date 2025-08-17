import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Gender, Agama, StatusPerkawinan } from '@prisma/client';

// GET: Mengambil data satu pasien spesifik beserta SELURUH riwayatnya secara detail
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        // Menyertakan semua kunjungan, diurutkan dari yang terbaru
        visits: {
          orderBy: { visitDate: 'desc' },
        },
        // Menyertakan semua rekam medis, diurutkan dari yang terbaru
        medicalRecords: {
          orderBy: { createdAt: 'desc' },
          include: {
            doctor: { // Menyertakan nama dokter
              select: { name: true }
            },
            // PERUBAHAN: Menyertakan detail resep obat di dalam setiap rekam medis
            prescriptions: {
              include: {
                items: {
                  include: {
                    medicine: {
                      select: { name: true, unit: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Pasien tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: patient });
  } catch (error) {
    console.error('Get patient by id error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// PUT: Memperbarui data pasien spesifik berdasarkan ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    // Mapping data dari frontend ke field schema Prisma
    const patientData = {
      name: data.name,
      nik: data.nik,
      tempatLahir: data.tempatLahir,
      birthDate: new Date(data.birthDate),
      gender: data.gender as Gender,
      address: data.address,
      phone: data.phone,
      email: data.email,
      pekerjaan: data.pekerjaan,
      statusPerkawinan: data.statusPerkawinan as StatusPerkawinan,
      agama: data.agama as Agama,
      jenisAsuransi: data.jenisAsuransi,
      noAsuransi: data.noAsuransi,
      bloodType: data.bloodType,
      allergies: data.allergies,
      emergencyContact: data.emergencyContact,
    };

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: patientData,
    });

    return NextResponse.json({ success: true, data: updatedPatient });
  } catch (error: any) {
    console.error('Update patient error:', error);
     if (error.code === 'P2002') {
        const target = error.meta?.target as string[];
        if (target.includes('nik')) {
            return NextResponse.json({ success: false, error: 'NIK sudah terdaftar pada pasien lain.' }, { status: 409 });
        }
        if (target.includes('email')) {
            return NextResponse.json({ success: false, error: 'Email sudah terdaftar pada pasien lain.' }, { status: 409 });
        }
    }
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui data pasien' },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus data pasien spesifik berdasarkan ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // onDelete: Cascade di schema akan menangani penghapusan data terkait
    await prisma.patient.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Data pasien berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete patient error:', error);
     if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Pasien tidak ditemukan untuk dihapus' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus data pasien' },
      { status: 500 }
    );
  }
}
