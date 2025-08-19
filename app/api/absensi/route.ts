import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AttendanceStatus } from '@prisma/client'

// TAMBAHKAN BARIS INI untuk membuat route menjadi dinamis
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const dateString = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];
    const status = searchParams.get('status') as AttendanceStatus | null;
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const skip = (page - 1) * limit;

    const targetDate = new Date(dateString);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const whereClause: any = {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      }
    };

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.user = {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      };
    }

    const [data, total] = await Promise.all([
      prisma.attendance.findMany({
        where: whereClause,
        include: {
          user: {
            select: { name: true, role: true }
          }
        },
        skip,
        take: limit,
        orderBy: { checkIn: 'asc' }
      }),
      prisma.attendance.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get Absensi Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data absensi' }, { status: 500 });
  }
}
