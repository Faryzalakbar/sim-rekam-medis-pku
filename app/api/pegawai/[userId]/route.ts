import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import bcrypt from 'bcrypt'

// PUT: Memperbarui data pegawai
export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    const { name, email, role, password } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json({ success: false, error: 'Nama, email, dan role wajib diisi' }, { status: 400 });
    }

    let dataToUpdate: any = { name, email, role: role as Role };

    // Jika ada password baru, hash password tersebut
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json({ success: true, data: userWithoutPassword });

  } catch (error: any) {
    console.error('[API_UPDATE_PEGAWAI_ERROR]', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Email sudah digunakan oleh user lain.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Gagal memperbarui data pegawai' }, { status: 500 });
  }
}

// DELETE: Menghapus pegawai
export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: 'Pegawai berhasil dihapus' });

  } catch (error) {
    console.error('[API_DELETE_PEGAWAI_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus pegawai' }, { status: 500 });
  }
}
