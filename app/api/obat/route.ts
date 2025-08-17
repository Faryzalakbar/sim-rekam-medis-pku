import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// GET: Mengambil daftar obat dengan filter dan paginasi
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''

    // 1. Buat klausa 'where' awal untuk filter dasar
    let whereClause: Prisma.MedicineWhereInput = {};
    if (search) {
      // PERBAIKAN: Menghapus 'mode: insensitive' yang tidak didukung MySQL
      whereClause.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ];
    }
    if (type) {
      whereClause.type = type;
    }

    // 2. Ambil semua data yang cocok dengan filter awal
    const allMatchingMedicines = await prisma.medicine.findMany({
        where: whereClause,
        orderBy: { name: 'asc' },
    });

    // 3. Lakukan filter status yang lebih kompleks di memori server
    let filteredMedicines = allMatchingMedicines;
    if (status) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        if (status === 'Kadaluwarsa') {
            filteredMedicines = allMatchingMedicines.filter(m => new Date(m.expiryDate) < today);
        } else if (status === 'Hampir ED') {
            filteredMedicines = allMatchingMedicines.filter(m => {
                const expiry = new Date(m.expiryDate);
                return expiry >= today && expiry <= thirtyDaysFromNow;
            });
        } else if (status === 'Habis') {
            filteredMedicines = allMatchingMedicines.filter(m => m.stock === 0);
        } else if (status === 'Menipis') {
            filteredMedicines = allMatchingMedicines.filter(m => m.stock > 0 && m.stock <= m.minStock);
        } else if (status === 'Tersedia') {
            filteredMedicines = allMatchingMedicines.filter(m => m.stock > m.minStock);
        }
    }

    // 4. Terapkan paginasi pada hasil yang sudah difilter
    const total = filteredMedicines.length;
    const paginatedData = filteredMedicines.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get obat error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server' }, { status: 500 })
  }
}

// POST: Membuat data obat baru
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    if (!data.name || !data.code || !data.type || data.price <= 0 || !data.expiryDate) {
        return NextResponse.json({ success: false, error: 'Nama, Kode, Jenis, Harga, dan Tanggal Kedaluwarsa wajib diisi.' }, { status: 400 });
    }

    const newMedicine = await prisma.medicine.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        unit: data.unit,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        minStock: parseInt(data.minStock),
        expiryDate: new Date(data.expiryDate),
        description: data.description,
      },
    })
    return NextResponse.json({ success: true, data: newMedicine }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
        return NextResponse.json({ success: false, error: 'Kode obat sudah ada.' }, { status: 409 });
    }
    console.error("Create medicine error:", error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan data obat' }, { status: 500 })
  }
}
