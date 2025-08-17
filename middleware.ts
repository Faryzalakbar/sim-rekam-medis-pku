import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// --- PASTIKAN BARIS INI ADA ---
export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login']
  
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for authentication token in cookies
  const token = request.cookies.get('token')?.value

  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token) {
    // Verify token
    try {
      const decoded = await verifyToken(token)
      if (!decoded) {
        throw new Error("Invalid token");
      }

      // Role-based access control
      const userRole = decoded.role
      const targetDashboard = `/dashboard/${userRole.toLowerCase()}`

      // Jika pengguna mencoba mengakses dashboard yang bukan miliknya,
      // alihkan ke dashboard yang benar.
      if (pathname.startsWith('/dashboard') && !pathname.startsWith(targetDashboard)) {
        return NextResponse.redirect(new URL(targetDashboard, request.url));
      }

    } catch (error) {
      console.error("Middleware token verification error:", error);
      const response = NextResponse.redirect(new URL('/login', request.url))
      // Hapus cookie yang tidak valid
      response.cookies.delete('token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Cocokkan semua path KECUALI yang untuk file statis, gambar, atau API.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
