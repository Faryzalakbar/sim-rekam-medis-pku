"use client"

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pill, Package, AlertTriangle, TrendingUp, FileText, ShoppingCart, Plus } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ApotikDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalObat: 156,
    stokMenupis: 8,
    resepHariIni: 15,
    nilaiStok: 45000000
  })

  const obatTerlaris = [
    { nama: 'Paracetamol', terjual: 45 },
    { nama: 'Amoxicillin', terjual: 32 },
    { nama: 'Ibuprofen', terjual: 28 },
    { nama: 'Vitamin C', terjual: 25 },
    { nama: 'Antasida', terjual: 20 }
  ]

  const resepTerbaru = [
    { 
      id: '1', 
      pasien: 'Aisyah Rahmawati', 
      dokter: 'Dr. Ahmad', 
      waktu: '10:30', 
      status: 'Siap Diambil',
      obat: ['Paracetamol 500mg', 'Vitamin C']
    },
    { 
      id: '2', 
      pasien: 'Budi Santoso', 
      dokter: 'Dr. Sari', 
      waktu: '11:15', 
      status: 'Sedang Disiapkan',
      obat: ['Amoxicillin 250mg', 'Antasida']
    },
    { 
      id: '3', 
      pasien: 'Siti Nurhaliza', 
      dokter: 'Dr. Ahmad', 
      waktu: '11:45', 
      status: 'Menunggu',
      obat: ['Ibuprofen 400mg']
    }
  ]

  const obatMenupis = [
    { nama: 'Ibuprofen 400mg', stok: 5, minStok: 20 },
    { nama: 'Antasida', stok: 8, minStok: 15 },
    { nama: 'Vitamin B Complex', stok: 12, minStok: 25 },
    { nama: 'Salep Mata', stok: 3, minStok: 10 }
  ]

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) return null

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={user.role} />
      
      <div className="flex-1 md:ml-64">
        <Navbar />
        
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard Apoteker
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Kelola obat dan resep pasien
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/obat/tambah">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Obat
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Obat</CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalObat}</div>
                <p className="text-xs text-muted-foreground">
                  Jenis obat tersedia
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.stokMenupis}</div>
                <p className="text-xs text-muted-foreground">
                  Perlu restok segera
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resep Hari Ini</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resepHariIni}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+3</span> dari kemarin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nilai Stok</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Rp {(stats.nilaiStok / 1000000).toFixed(1)}M
                </div>
                <p className="text-xs text-muted-foreground">
                  Total inventori
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Obat Terlaris Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Obat Terlaris</CardTitle>
                <CardDescription>
                  5 obat dengan penjualan tertinggi bulan ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={obatTerlaris}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nama" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="terjual" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Resep Terbaru */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resep Terbaru
                </CardTitle>
                <CardDescription>
                  Daftar resep yang perlu disiapkan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resepTerbaru.map((resep) => (
                  <div key={resep.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{resep.pasien}</p>
                      <p className="text-sm text-muted-foreground">
                        {resep.dokter} • {resep.waktu}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {resep.obat.join(', ')}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      resep.status === 'Siap Diambil' ? 'bg-green-100 text-green-800' :
                      resep.status === 'Sedang Disiapkan' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {resep.status}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stok Menipis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Peringatan Stok Menipis
                </CardTitle>
                <CardDescription>
                  Obat yang perlu segera direstok
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {obatMenupis.map((obat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-orange-800 dark:text-orange-200">
                        {obat.nama}
                      </p>
                      <p className="text-sm text-orange-600 dark:text-orange-300">
                        Stok: {obat.stok} • Min: {obat.minStok}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Pesan
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>
                  Fitur yang sering digunakan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/obat">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                      <Pill className="h-6 w-6" />
                      <span>Data Obat</span>
                    </Button>
                  </Link>
                  <Link href="/stok">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                      <Package className="h-6 w-6" />
                      <span>Kelola Stok</span>
                    </Button>
                  </Link>
                  <Link href="/resep">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                      <FileText className="h-6 w-6" />
                      <span>Resep Masuk</span>
                    </Button>
                  </Link>
                  <Link href="/laporan">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                      <TrendingUp className="h-6 w-6" />
                      <span>Laporan</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
