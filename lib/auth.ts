import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

// Kunci rahasia harus dalam format yang benar untuk 'jose'
const secretKey = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const key = new TextEncoder().encode(secretKey)

export interface UserPayload {
  id: string
  username: string
  name: string
  role: 'ADMIN' | 'DOKTER' | 'APOTIK' | 'PEGAWAI'
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12)
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

// Fungsi generate token baru menggunakan 'jose'
export async function generateToken(user: UserPayload): Promise<string> {
  return await new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key)
}

// Fungsi verify token baru menggunakan 'jose' (ini async)
export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })
    return payload as UserPayload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}
