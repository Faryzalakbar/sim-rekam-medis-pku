"use client"

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
// Import ikon baru Clock
import { Search, Plus, Edit, Trash2, AlertTriangle, Package, Pill, TrendingDown, Filter, Clock } from 'lucide-react'
import Link from 'next/link'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'

// Definisikan tipe data untuk Obat (Medicine), tambahkan expiryDate dan description
interface Medicine {
  id: string;
  code: string;
  name: string;
  type: string;
  unit: string;
  price: number;
  stock: number;
  minStock: number;
  expiryDate: string;
  description?: string; // Tambahkan properti deskripsi (opsional)
}

export default function ObatPage() {
  const [user, setUser] = useState<any>(null)
  const [obatList, setObatList] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  // Tambahkan statistik untuk obat yang hampir kedaluwarsa
  const [stats, setStats] = useState({
    total: 0,
    stokMenipis: 0,
    stokHabis: 0,
    nilaiTotal: 0,
    hampirKadaluwarsa: 0 // Statistik baru
  })

  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });
      if (searchTerm) params.append('search', searchTerm);
      if (filterType) params.append('type', filterType);
      if (filterStatus) params.append('status', filterStatus);

      // Asumsi API mengembalikan data obat termasuk expiryDate dan statistik baru
      const [obatRes, statsRes] = await Promise.all([
        fetch(`/api/obat?${params.toString()}`),
        fetch('/api/dashboard/stats?type=obat')
      ]);

      const obatResult = await obatRes.json();
      if (obatResult.success) {
        setObatList(obatResult.data);
        setTotalPages(obatResult.pagination.totalPages);
      } else {
        toast({ title: "Error", description: "Gagal memuat data obat", variant: "destructive" });
      }

      const statsResult = await statsRes.json();
      if (statsResult.success) {
        setStats(statsResult.data);
      }

    } catch (error) {
      toast({ title: "Error", description: "Gagal terhubung ke server", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterType, filterStatus, toast]);

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
    fetchData()
  }, [fetchData])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/obat/${id}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.success) {
        toast({ title: "Berhasil", description: "Data obat berhasil dihapus" })
        fetchData()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Terjadi kesalahan server", variant: "destructive" })
    }
  }

  // Fungsi baru untuk mendapatkan status obat yang lebih komprehensif
  const getObatStatus = (obat: Medicine) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalisasi waktu hari ini ke tengah malam
    const expiry = new Date(obat.expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (expiry < today) {
      return <Badge variant="destructive" className="bg-red-800 text-white">Kadaluwarsa</Badge>;
    }
    if (obat.stock === 0) {
      return <Badge variant="destructive">Habis</Badge>;
    }
    if (expiry <= thirtyDaysFromNow) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Hampir ED</Badge>;
    }
    if (obat.stock <= obat.minStock) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Menipis</Badge>;
    }
    return <Badge variant="outline" className="bg-green-100 text-green-800">Tersedia</Badge>;
  };


  if (!user) return <div className="flex h-screen items-center justify-center">Loading...</div>

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={user.role} />
      <div className="flex-1 md:ml-64">
        <Navbar user={user} />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Manajemen Obat</h1>
              <p className="text-gray-600">Kelola data obat dan stok farmasi</p>
            </div>
            <Link href="/obat/tambah"><Button><Plus className="h-4 w-4 mr-2" />Tambah Obat</Button></Link>
          </div>

          {/* Update grid layout untuk 5 kartu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Jenis Obat</CardTitle><Pill className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
            {/* Kartu baru untuk statistik Hampir Kadaluwarsa */}
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Hampir ED</CardTitle><Clock className="h-4 w-4 text-yellow-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{stats.hampirKadaluwarsa}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Stok Menipis</CardTitle><AlertTriangle className="h-4 w-4 text-orange-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{stats.stokMenipis}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Stok Habis</CardTitle><TrendingDown className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats.stokHabis}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Nilai Stok</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">Rp {(stats.nilaiTotal / 1000000).toFixed(1)} jt</div></CardContent></Card>
          </div>

          <Card className="mb-6">
            <CardHeader><CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Filter & Pencarian</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Cari nama atau kode obat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger><SelectValue placeholder="Semua Jenis" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tablet">Tablet</SelectItem>
                    <SelectItem value="Kapsul">Kapsul</SelectItem>
                    <SelectItem value="Sirup">Sirup</SelectItem>
                    <SelectItem value="Cair">Cair</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger><SelectValue placeholder="Semua Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tersedia">Tersedia</SelectItem>
                    <SelectItem value="Menipis">Menipis</SelectItem>
                    <SelectItem value="Habis">Habis</SelectItem>
                    {/* Tambahkan filter untuk status baru */}
                    <SelectItem value="Hampir ED">Hampir ED</SelectItem>
                    <SelectItem value="Kadaluwarsa">Kadaluwarsa</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterType(''); setFilterStatus(''); }}>Reset</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Daftar Obat</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-64 w-full" /> : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      {/* Tambahkan kolom Kadaluwarsa dan hapus Min. Stok */}
                      <TableHeader><TableRow><TableHead>Nama Obat</TableHead><TableHead>Jenis</TableHead><TableHead>Stok</TableHead><TableHead>Harga</TableHead><TableHead>Kadaluwarsa</TableHead><TableHead>Status</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {obatList.map((obat) => (
                          <TableRow key={obat.id}>
                            <TableCell className="font-medium">
                              <div>{obat.name}</div>
                              <div className="text-sm text-gray-500">{obat.code}</div>
                              {/* Tampilkan deskripsi jika ada */}
                              {obat.description && <div className="text-xs text-gray-400 mt-1 italic">{obat.description}</div>}
                            </TableCell>
                            <TableCell><Badge variant="outline">{obat.type}</Badge></TableCell>
                            <TableCell><span className={obat.stock <= obat.minStock ? 'text-red-600 font-bold' : ''}>{obat.stock} {obat.unit}</span></TableCell>
                            <TableCell>Rp {obat.price.toLocaleString('id-ID')}</TableCell>
                            {/* Tampilkan tanggal kedaluwarsa */}
                            <TableCell>
                              {new Date(obat.expiryDate).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </TableCell>
                            {/* Gunakan fungsi status yang baru */}
                            <TableCell>{getObatStatus(obat)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Link href={`/obat/${obat.id}/edit`}><Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button></Link>
                                {user.role === 'ADMIN' && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader><AlertDialogTitle>Anda yakin?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus data obat secara permanen.</AlertDialogDescription></AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(obat.id)}>Ya, Hapus</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div>Halaman {currentPage} dari {totalPages}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Sebelumnya</Button>
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Selanjutnya</Button>
                    </div>
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
