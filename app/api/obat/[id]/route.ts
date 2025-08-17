import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Mengambil data detail satu obat
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: params.id },
    })

    if (!medicine) {
      return NextResponse.json(
        { success: false, error: 'Obat tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: medicine,
    })

  } catch (error) {
    console.error('Get obat detail error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}

// PUT: Memperbarui data obat
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    // Validasi data, tambahkan pengecekan untuk expiryDate
    if (!data.name || !data.type || data.price <= 0 || !data.expiryDate) {
        return NextResponse.json({ success: false, error: 'Nama, Jenis, Harga, dan Tanggal Kedaluwarsa wajib diisi.' }, { status: 400 });
    }

    const updatedMedicine = await prisma.medicine.update({
      where: { id: params.id },
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        unit: data.unit,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        minStock: parseInt(data.minStock),
        expiryDate: new Date(data.expiryDate), // Tambahkan pembaruan expiryDate
        description: data.description,       // Tambahkan pembaruan description
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedMedicine,
    })

  } catch (error: any) {
    console.error('Update obat error:', error)
     if (error.code === 'P2025') { // Error Prisma: Record to update not found.
        return NextResponse.json({ success: false, error: 'Obat tidak ditemukan untuk diperbarui.' }, { status: 404 });
    }
     if (error.code === 'P2002') { // Error Prisma: Unique constraint failed
        return NextResponse.json({ success: false, error: 'Kode obat sudah digunakan.' }, { status: 409 });
    }
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui data obat' },
      { status: 500 }
    )
  }
}

// DELETE: Menghapus data obat
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    try {
        // Hapus data obat berdasarkan ID
        await prisma.medicine.delete({
            where: { id: params.id }
        });

        return NextResponse.json({
            success: true,
            message: 'Obat berhasil dihapus.'
        });

    } catch (error: any) {
        console.error('Delete obat error:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ success: false, error: 'Obat tidak ditemukan.' }, { status: 404 });
        }
        // Error jika obat sudah pernah digunakan di resep
        if (error.code === 'P2003') {
            return NextResponse.json({ success: false, error: 'Obat tidak dapat dihapus karena sudah memiliki riwayat penggunaan di resep.' }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'Gagal menghapus obat.' }, { status: 500 });
    }
}
