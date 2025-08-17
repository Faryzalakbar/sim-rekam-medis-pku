"use client"

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Search, Eye, Loader2, Users } from 'lucide-react'
import Link from 'next/link'
import { Role } from '@prisma/client'

// --- DEFINISI TIPE DATA ---
interface Employee {
  id: string;
  name: string;
  role: Role;
  email: string;
}
interface LoggedInUser {
    name: string;
    role: Role;
}

export default function AbsensiPage() {
  const [user, setUser] = useState<LoggedInUser | null>(null)
  const [employeeList, setEmployeeList] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const { toast } = useToast()

  // --- FUNGSI PENGAMBILAN DATA PEGAWAI ---
  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ 
        page: currentPage.toString(), 
        limit: '15',
        role: 'PEGAWAI' // Hanya mengambil pegawai dengan peran PEGAWAI
      });
      if (searchTerm) params.append('search', searchTerm);

      // Memanggil API pegawai untuk mendapatkan daftar user
      const response = await fetch(`/api/pegawai?${params}`)
      const result = await response.json()

      if (result.success) {
        setEmployeeList(result.data)
        setTotalPages(result.pagination.totalPages)
      } else { 
        throw new Error(result.error || "Gagal memuat data pegawai"); 
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, toast])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
  }, [])

  useEffect(() => {
    if (user) fetchEmployees()
  }, [user, fetchEmployees])
  
  if (!user) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={user.role} />
      <div className="flex-1 md:ml-64">
        <Navbar user={user} />
        <main className="p-4 md:p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Absensi</h1>
            <p className="text-gray-600">Lihat riwayat absensi untuk setiap pegawai.</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Daftar Pegawai</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Cari nama pegawai..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Pegawai</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={4} className="text-center h-40"><Loader2 className="h-6 w-6 animate-spin inline-block" /></TableCell></TableRow>
                    ) : employeeList.length > 0 ? (
                      employeeList.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.name}</TableCell>
                          <TableCell><Badge variant="secondary">{employee.role}</Badge></TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell className="text-right">
                            <Link href={`/absensi/${employee.id}`}>
                              <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> Lihat Riwayat</Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={4} className="text-center h-24">Tidak ada data pegawai.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-4">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Sebelumnya</Button>
                  <span className="text-sm">Halaman {currentPage} dari {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>Selanjutnya</Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
