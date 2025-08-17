import { POST } from '@/app/api/auth/login/route'
import { NextRequest } from 'next/server'

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  absensi: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

jest.mock('@/lib/auth', () => ({
  comparePassword: jest.fn(),
  generateToken: jest.fn(),
}))

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return error for missing credentials', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Username dan password harus diisi')
  })

  it('should return error for invalid user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'invalid',
        password: 'password'
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Username atau password salah')
  })
})
