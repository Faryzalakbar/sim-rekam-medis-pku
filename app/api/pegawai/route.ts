import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcrypt'
import { Role } from '@prisma/client'

// GET: Mengambil daftar pegawai
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '15');
        const role = searchParams.get('role');
        const skip = (page - 1) * limit;

        let whereClause: any = {};
        if (role) {
            whereClause.role = role as Role;
        }

        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                }
            }),
            prisma.user.count({ where: whereClause })
        ]);

        return NextResponse.json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get Pegawai Error: ", error);
        return NextResponse.json({ success: false, error: "Gagal mengambil data pegawai." }, { status: 500 });
    }
}


// POST: Membuat pegawai baru
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validasi input
    if (!data.name || !data.email || !data.password || !data.role) {
      return NextResponse.json({ success: false, error: 'Semua field wajib diisi.' }, { status: 400 });
    }

    // Hash password sebelum disimpan
    const hashedPassword = await hash(data.password, 10);

    // Buat user baru di database
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as Role, // Pastikan role sesuai dengan enum di Prisma
      },
    });

    // Jangan kirim kembali password
    const { password, ...userWithoutPassword } = newUser;

    return NextResponse.json({ success: true, data: userWithoutPassword }, { status: 201 });

  } catch (error: any) {
    console.error('Create Pegawai Error:', error);
    // Tangani error jika email sudah ada
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Email sudah terdaftar.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Gagal membuat akun pegawai baru.' }, { status: 500 });
  }
}
