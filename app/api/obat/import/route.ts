import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: Menerima dan menyimpan data obat dari file Excel/CSV
export async function POST(request: NextRequest) {
  try {
    const medicinesData = await request.json()

    // Validasi dasar
    if (!Array.isArray(medicinesData) || medicinesData.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada data obat untuk diimpor.' }, { status: 400 })
    }

    // Format data agar sesuai dengan skema Prisma
    const formattedData = medicinesData.map(med => {
      // Validasi data penting di setiap baris
      if (!med.name || !med.code || !med.expiryDate) {
        throw new Error(`Data tidak lengkap pada salah satu baris. Pastikan 'name', 'code', dan 'expiryDate' terisi.`);
      }
      return {
        name: String(med.name),
        code: String(med.code),
        type: String(med.type || 'Tablet'),
        unit: String(med.unit || 'Strip'),
        price: parseFloat(med.price) || 0,
        stock: parseInt(med.stock) || 0,
        minStock: parseInt(med.minStock) || 10,
        expiryDate: new Date(med.expiryDate), // Konversi string tanggal menjadi objek Date
        description: med.description || null,
      }
    });

    // Gunakan createMany untuk mengimpor banyak data sekaligus
    const result = await prisma.medicine.createMany({
      data: formattedData,
      skipDuplicates: true, // Mencegah error jika ada 'code' yang sama
    })

    return NextResponse.json({
      success: true,
      message: `${result.count} data obat berhasil diimpor.`,
      data: result,
    }, { status: 201 })

  } catch (error: any) {
    console.error('Import obat error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan saat proses impor data obat.' },
      { status: 500 }
    )
  }
}
