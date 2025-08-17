"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// Tipe data untuk form
interface FormData {
  name: string;
  nik: string;
  tempatLahir: string;
  birthDate: string;
  gender: string;
  address: string;
  phone: string;
  email: string;
  pekerjaan: string;
  statusPerkawinan: string;
  agama: string;
  jenisAsuransi: string;
  noAsuransi: string;
  bloodType: string;
  allergies: string;
  emergencyContact: string;
}

export default function EditPasienPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()

  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState<Partial<FormData>>({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const fetchPatientData = useCallback(async () => {
    setFetching(true)
    try {
      const response = await fetch(`/api/pasien/${id}`)
      const result = await response.json()
      if (result.success) {
        // Format tanggal agar sesuai dengan input type="date"
        const patientData = {
          ...result.data,
          birthDate: new Date(result.data.birthDate).toISOString().split('T')[0]
        }
        setFormData(patientData)
      } else {
        toast({ title: "Error", description: "Gagal memuat data pasien.", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Tidak dapat terhubung ke server.", variant: "destructive" })
    } finally {
      setFetching(false)
    }
  }, [id, toast])
  
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
    
    if (id) {
      fetchPatientData()
    }
  }, [id, fetchPatientData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`/api/pasien/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: "Berhasil!", description: "Data pasien berhasil diperbarui." })
        router.push(`/pasien/${id}`) // Kembali ke halaman detail
      } else {
        toast({ title: "Gagal Memperbarui", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Tidak dapat terhubung ke server.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }
  
  if (fetching) {
     return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar role={user?.role} />
            <div className="flex-1 md:ml-64 p-6">
                <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <Card>
                    <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                    <CardContent className="space-y-8">
                        <div><Skeleton className="h-6 w-1/4 mb-4" /><div className="grid grid-cols-2 gap-4"><Skeleton className="h-10" /><Skeleton className="h-10" /></div></div>
                        <div><Skeleton className="h-6 w-1/4 mb-4" /><div className="grid grid-cols-2 gap-4"><Skeleton className="h-10" /><Skeleton className="h-10" /></div></div>
                    </CardContent>
                </Card>
            </div>
        </div>
     )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={user?.role} />
      <div className="flex-1 md:ml-64">
        <Navbar user={user} />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Data Pasien</h1>
              <p className="text-gray-600 dark:text-gray-400">Perbarui informasi untuk pasien: {formData.name}</p>
            </div>
            <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-2" />Kembali</Button>
          </div>
          <Card>
            <CardHeader><CardTitle>Formulir Edit Pasien</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* --- Data Diri --- */}
                <div>
                  <h3 className="text-lg font-medium mb-4 border-b pb-2">Data Diri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label htmlFor="name">Nama Lengkap *</Label><Input id="name" value={formData.name || ''} onChange={handleInputChange} required /></div>
                    <div className="space-y-2"><Label htmlFor="nik">NIK</Label><Input id="nik" value={formData.nik || ''} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="tempatLahir">Tempat Lahir</Label><Input id="tempatLahir" value={formData.tempatLahir || ''} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="birthDate">Tanggal Lahir *</Label><Input id="birthDate" type="date" value={formData.birthDate || ''} onChange={handleInputChange} required /></div>
                    <div className="space-y-2"><Label htmlFor="gender">Jenis Kelamin *</Label><Select onValueChange={(value) => handleSelectChange('gender', value)} value={formData.gender || ''} required><SelectTrigger><SelectValue placeholder="Pilih jenis kelamin" /></SelectTrigger><SelectContent><SelectItem value="MALE">Laki-laki</SelectItem><SelectItem value="FEMALE">Perempuan</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label htmlFor="bloodType">Golongan Darah</Label><Input id="bloodType" value={formData.bloodType || ''} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="statusPerkawinan">Status Perkawinan</Label><Select onValueChange={(value) => handleSelectChange('statusPerkawinan', value)} value={formData.statusPerkawinan || ''}><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger><SelectContent><SelectItem value="BELUM_KAWIN">Belum Kawin</SelectItem><SelectItem value="KAWIN">Kawin</SelectItem><SelectItem value="CERAI_HIDUP">Cerai Hidup</SelectItem><SelectItem value="CERAI_MATI">Cerai Mati</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label htmlFor="agama">Agama</Label><Select onValueChange={(value) => handleSelectChange('agama', value)} value={formData.agama || ''}><SelectTrigger><SelectValue placeholder="Pilih agama" /></SelectTrigger><SelectContent><SelectItem value="ISLAM">Islam</SelectItem><SelectItem value="KRISTEN">Kristen</SelectItem><SelectItem value="KATOLIK">Katolik</SelectItem><SelectItem value="HINDU">Hindu</SelectItem><SelectItem value="BUDDHA">Buddha</SelectItem><SelectItem value="KONGHUCU">Konghucu</SelectItem></SelectContent></Select></div>
                  </div>
                </div>

                {/* --- Kontak & Alamat --- */}
                <div>
                  <h3 className="text-lg font-medium mb-4 border-b pb-2">Kontak & Alamat</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label htmlFor="phone">No. Telepon</Label><Input id="phone" value={formData.phone || ''} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email || ''} onChange={handleInputChange} /></div>
                    <div className="space-y-2 md:col-span-2"><Label htmlFor="address">Alamat Lengkap</Label><Textarea id="address" value={formData.address || ''} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="pekerjaan">Pekerjaan</Label><Input id="pekerjaan" value={formData.pekerjaan || ''} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="emergencyContact">Kontak Darurat</Label><Input id="emergencyContact" value={formData.emergencyContact || ''} onChange={handleInputChange} /></div>
                  </div>
                </div>

                {/* --- Asuransi & Medis Lainnya --- */}
                <div>
                  <h3 className="text-lg font-medium mb-4 border-b pb-2">Asuransi & Medis Lainnya</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label htmlFor="jenisAsuransi">Jenis Asuransi</Label><Select onValueChange={(value) => handleSelectChange('jenisAsuransi', value)} value={formData.jenisAsuransi || ''}><SelectTrigger><SelectValue placeholder="Pilih jenis asuransi" /></SelectTrigger><SelectContent><SelectItem value="UMUM">Umum</SelectItem><SelectItem value="BPJS">BPJS</SelectItem><SelectItem value="ASURANSI_LAIN">Asuransi Lain</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label htmlFor="noAsuransi">No. Asuransi/BPJS</Label><Input id="noAsuransi" value={formData.noAsuransi || ''} onChange={handleInputChange} /></div>
                    <div className="space-y-2 md:col-span-2"><Label htmlFor="allergies">Riwayat Alergi</Label><Textarea id="allergies" value={formData.allergies || ''} onChange={handleInputChange} /></div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
