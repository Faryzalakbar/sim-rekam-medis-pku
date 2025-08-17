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
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { debounce } from 'lodash'

// Tipe data
interface Patient {
  id: string;
  noRekamMedis: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
}

export default function PasienPage() {
  const [user, setUser] = useState<any>(null)
  const [pasienList, setPasienList] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const { toast } = useToast()

  const fetchData = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10', search });
      const response = await fetch(`/api/pasien?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setPasienList(result.data);
        setTotalPages(result.pagination.totalPages);
      } else {
         toast({ title: "Error", description: result.error || "Gagal memuat data pasien", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Gagal terhubung ke server", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast]);

  const debouncedFetchData = useCallback(debounce(fetchData, 500), [fetchData]);

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
    debouncedFetchData(currentPage, searchTerm);
  }, [currentPage, searchTerm, debouncedFetchData]);


  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/pasien/${id}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.success) {
        toast({ title: "Berhasil", description: "Data pasien berhasil dihapus" })
        fetchData()
      } else {
        toast({ title: "Gagal Menghapus", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Terjadi kesalahan pada server", variant: "destructive" })
    }
  }

  if (!user) return <div className="flex h-screen items-center justify-center">Memuat...</div>

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={user.role} />
      <div className="flex-1 md:ml-64">
        <Navbar user={user} />
        <main className="p-6">
          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Manajemen Pasien</CardTitle>
                        <CardDescription>Kelola semua data pasien klinik.</CardDescription>
                    </div>
                    <Link href="/pasien/tambah"><Button><Plus className="h-4 w-4 mr-2" />Tambah Pasien</Button></Link>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input placeholder="Cari nama, NIK, atau No. RM..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                </div>
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, index) => (<div key={index} className="flex items-center space-x-4 p-2"><Skeleton className="h-8 w-full" /></div>))}</div>
              ) : (
                <>
                  <div className="overflow-x-auto border rounded-md">
                    <Table>
                      <TableHeader><TableRow><TableHead>No. RM</TableHead><TableHead>Nama Lengkap</TableHead><TableHead>Gender</TableHead><TableHead>Tanggal Lahir</TableHead><TableHead className="text-center">Aksi</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {pasienList.map((pasien) => (
                          <TableRow key={pasien.id}>
                            <TableCell className="font-medium">{pasien.noRekamMedis}</TableCell>
                            <TableCell>{pasien.name}</TableCell>
                            <TableCell><Badge variant={pasien.gender === 'MALE' ? 'default' : 'secondary'}>{pasien.gender === 'MALE' ? 'L' : 'P'}</Badge></TableCell>
                            <TableCell>{new Date(pasien.birthDate).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell>
                              <div className="flex gap-2 justify-center">
                                {/* PERUBAHAN: Tombol ini sekarang menjadi Link ke halaman detail */}
                                <Link href={`/pasien/${pasien.id}`} title="Lihat Detail">
                                  <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                                </Link>
                                <Link href={`/pasien/${pasien.id}/edit`} title="Edit Pasien">
                                  <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                </Link>
                                {user.role === 'ADMIN' && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" title="Hapus Pasien"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus data pasien secara permanen.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(pasien.id)}>Ya, Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Sebelumnya</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Berikutnya</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
