import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcrypt' // Menggunakan 'bcrypt' yang lebih direkomendasikan
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    // 1. Cari user di database berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email atau password salah' },
        { status: 401 } // Unauthorized
      )
    }

    // 2. Verifikasi password yang di-hash
    const isPasswordValid = await compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Email atau password salah' },
        { status: 401 } // Unauthorized
      )
    }

    // 3. Buat token JWT jika password valid
    const token = jwt.sign(
        { 
            id: user.id,
            name: user.name,
            role: user.role
        },
        process.env.JWT_SECRET || 'your-default-secret-key', // Sangat disarankan untuk mengatur ini di .env
        { expiresIn: '1d' } // Token berlaku 1 hari
    );

    // 4. Hapus password dari data user yang akan dikirim kembali
    const { password: _, ...userWithoutPassword } = user;

    // 5. Buat respons JSON yang konsisten
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      data: {
          user: userWithoutPassword,
          token: token
      }
    })

    // 6. Atur token di dalam cookie (opsional, tapi cara yang aman)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 1 hari dalam detik
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
