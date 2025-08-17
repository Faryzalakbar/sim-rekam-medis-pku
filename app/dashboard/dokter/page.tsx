"use client"

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, FileText, Clock, Activity, Stethoscope, Plus } from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DokterDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    pasienHariIni: 8,
    totalPasien: 245,
    rekamMedisBaru: 6,
    jadwalKonsultasi: 12
  })

  const kunjunganData = [
    { name: 'Sen', pasien: 12 },
    { name: 'Sel', pasien: 15 },
    { name: 'Rab', pasien: 8 },
    { name: 'Kam', pasien: 18 },
    { name: 'Jum', pasien: 14 },
    { name: 'Sab', pasien: 10 },
    { name: 'Min', pasien: 6 }
  ]

  const jadwalHariIni = [
    { jam: '09:00', pasien: 'Aisyah Rahmawati', keluhan: 'Kontrol diabetes', status: 'Selesai' },
    { jam: '09:30', pasien: 'Budi Santoso', keluhan: 'Demam dan batuk', status: 'Dalam Pemeriksaan' },
    { jam: '10:00', pasien: 'Siti Nurhaliza', keluhan: 'Sakit kepala', status: 'Menunggu' },
    { jam: '10:30', pasien: 'Ahmad Fauzi', keluhan: 'Kontrol hipertensi', status: 'Menunggu' }
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
                Dashboard Dokter
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Selamat datang, {user.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/rekam-medis/baru">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Rekam Medis Baru
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pasien Hari Ini</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pasienHariIni}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2</span> dari kemarin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pasien</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPasien}</div>
                <p className="text-xs text-muted-foreground">
                  Pasien yang ditangani
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rekam Medis Baru</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rekamMedisBaru}</div>
                <p className="text-xs text-muted-foreground">
                  Hari ini
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jadwal Konsultasi</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.jadwalKonsultasi}</div>
                <p className="text-xs text-muted-foreground">
                  Minggu ini
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Kunjungan Pasien Mingguan</CardTitle>
                <CardDescription>
                  Grafik kunjungan pasien dalam 7 hari terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={kunjunganData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="pasien" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Jadwal Hari Ini
                </CardTitle>
                <CardDescription>
                  Daftar pasien yang akan diperiksa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {jadwalHariIni.map((jadwal, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-blue-600">
                        {jadwal.jam}
                      </div>
                      <div>
                        <p className="font-medium">{jadwal.pasien}</p>
                        <p className="text-sm text-muted-foreground">{jadwal.keluhan}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      jadwal.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                      jadwal.status === 'Dalam Pemeriksaan' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {jadwal.status}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
              <CardDescription>
                Fitur yang sering digunakan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/pasien">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Users className="h-6 w-6" />
                    <span>Lihat Pasien</span>
                  </Button>
                </Link>
                <Link href="/rekam-medis">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    <span>Rekam Medis</span>
                  </Button>
                </Link>
                <Link href="/resep">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Stethoscope className="h-6 w-6" />
                    <span>Tulis Resep</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
