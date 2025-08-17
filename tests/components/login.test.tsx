import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LoginPage from '@/app/login/page'

// Mock the router
jest.mock('next/navigation')
const mockPush = jest.fn()
const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('LoginPage', () => {
  beforeEach(() => {
    mockRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    } as any)
    
    // Mock fetch
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders login form', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('Masuk ke Sistem')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /masuk/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(<LoginPage />)
    
    const submitButton = screen.getByRole('button', { name: /masuk/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Username harus diisi')).toBeInTheDocument()
      expect(screen.getByText('Password harus diisi')).toBeInTheDocument()
    })
  })

  it('submits form with valid credentials', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        success: true,
        data: {
          user: { id: '1', username: 'admin', role: 'ADMIN' },
          token: 'mock-token'
        }
      })
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

    render(<LoginPage />)
    
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'admin' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/admin')
    })
  })
})
