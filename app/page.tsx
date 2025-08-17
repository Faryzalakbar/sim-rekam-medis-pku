"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Fungsi untuk memeriksa sesi dan mengarahkan pengguna
    const checkSession = () => {
      // 1. Ambil data pengguna dari localStorage
      const userString = localStorage.getItem('user')

      // 2. PERBAIKAN: Tambahkan pengecekan untuk memastikan data tidak null atau string "undefined"
      if (userString && userString !== 'undefined' && userString !== 'null') {
        try {
          const userData = JSON.parse(userString)
          // Pastikan userData dan rolenya ada sebelum mengarahkan
          if (userData && userData.role) {
            // 3. Arahkan ke dasbor yang sesuai
            const destination = `/dashboard/${userData.role.toLowerCase()}`
            router.push(destination)
          } else {
            // Jika data tidak valid, arahkan ke halaman login
            router.push('/login')
          }
        } catch (error) {
          console.error("Gagal mem-parsing data pengguna, mengarahkan ke login:", error)
          // Jika terjadi error saat parsing, bersihkan localStorage yang salah dan arahkan ke login
          localStorage.removeItem('user');
          router.push('/login')
        }
      } else {
        // 4. Jika tidak ada data pengguna, arahkan ke halaman login
        router.push('/login')
      }
    }

    checkSession();
  }, [router])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600 dark:text-gray-400">Mengarahkan...</p>
      </div>
    </div>
  )
}
