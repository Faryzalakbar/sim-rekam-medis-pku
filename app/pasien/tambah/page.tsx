"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import Link from 'next/link'

// Definisikan tipe data untuk state form
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

export default function TambahPasienPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    nik: '',
    tempatLahir: '',
    birthDate: '',
    gender: '',
    address: '',
    phone: '',
    email: '',
    pekerjaan: '',
    statusPerkawinan: '',
    agama: '',
    jenisAsuransi: '',
    noAsuransi: '',
    bloodType: '',
    allergies: '',
    emergencyContact: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

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

    if (!formData.name || !formData.birthDate || !formData.gender) {
        toast({
            title: "Input Tidak Lengkap",
            description: "Nama, tanggal lahir, dan jenis kelamin wajib diisi.",
            variant: "destructive"
        })
        setLoading(false)
        return
    }

    try {
      const response = await fetch('/api/pasien', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Berhasil!",
          description: "Data pasien baru berhasil disimpan."
        })
        router.push('/pasien')
      } else {
        toast({
          title: "Gagal Menyimpan",
          description: result.error || "Terjadi kesalahan saat menyimpan data.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Tidak dapat terhubung ke server.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="flex h-screen items-center justify-center">Loading...</div>

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={user.role} />
      
      <div className="flex-1 md:ml-64">
        <Navbar user={user} />
        
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Pasien Baru</h1>
              <p className="text-gray-600 dark:text-gray-400">Isi formulir di bawah ini untuk mendaftarkan pasien baru.</p>
            </div>
            <Link href="/pasien"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Kembali</Button></Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Formulir Pendaftaran Pasien</CardTitle>
              <CardDescription>Pastikan semua data diisi dengan benar. Field dengan tanda * wajib diisi.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* --- Data Diri --- */}
                <div>
                  <h3 className="text-lg font-medium mb-4 border-b pb-2">Data Diri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label htmlFor="name">Nama Lengkap *</Label><Input id="name" value={formData.name} onChange={handleInputChange} placeholder="Masukkan nama lengkap" required /></div>
                    <div className="space-y-2"><Label htmlFor="nik">NIK</Label><Input id="nik" value={formData.nik} onChange={handleInputChange} placeholder="Masukkan 16 digit NIK" /></div>
                    <div className="space-y-2"><Label htmlFor="tempatLahir">Tempat Lahir</Label><Input id="tempatLahir" value={formData.tempatLahir} onChange={handleInputChange} placeholder="Contoh: Jakarta" /></div>
                    <div className="space-y-2"><Label htmlFor="birthDate">Tanggal Lahir *</Label><Input id="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} required /></div>
                    <div className="space-y-2"><Label htmlFor="gender">Jenis Kelamin *</Label><Select onValueChange={(value) => handleSelectChange('gender', value)} value={formData.gender} required><SelectTrigger><SelectValue placeholder="Pilih jenis kelamin" /></SelectTrigger><SelectContent><SelectItem value="MALE">Laki-laki</SelectItem><SelectItem value="FEMALE">Perempuan</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label htmlFor="bloodType">Golongan Darah</Label><Input id="bloodType" value={formData.bloodType} onChange={handleInputChange} placeholder="Contoh: A+" /></div>
                    <div className="space-y-2"><Label htmlFor="statusPerkawinan">Status Perkawinan</Label><Select onValueChange={(value) => handleSelectChange('statusPerkawinan', value)} value={formData.statusPerkawinan}><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger><SelectContent><SelectItem value="BELUM_KAWIN">Belum Kawin</SelectItem><SelectItem value="KAWIN">Kawin</SelectItem><SelectItem value="CERAI_HIDUP">Cerai Hidup</SelectItem><SelectItem value="CERAI_MATI">Cerai Mati</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label htmlFor="agama">Agama</Label><Select onValueChange={(value) => handleSelectChange('agama', value)} value={formData.agama}><SelectTrigger><SelectValue placeholder="Pilih agama" /></SelectTrigger><SelectContent><SelectItem value="ISLAM">Islam</SelectItem><SelectItem value="KRISTEN">Kristen</SelectItem><SelectItem value="KATOLIK">Katolik</SelectItem><SelectItem value="HINDU">Hindu</SelectItem><SelectItem value="BUDDHA">Buddha</SelectItem><SelectItem value="KONGHUCU">Konghucu</SelectItem></SelectContent></Select></div>
                  </div>
                </div>

                {/* --- Kontak & Alamat --- */}
                <div>
                  <h3 className="text-lg font-medium mb-4 border-b pb-2">Kontak & Alamat</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label htmlFor="phone">No. Telepon</Label><Input id="phone" value={formData.phone} onChange={handleInputChange} placeholder="Contoh: 08123456789" /></div>
                    <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="email@contoh.com" /></div>
                    <div className="space-y-2 md:col-span-2"><Label htmlFor="address">Alamat Lengkap</Label><Textarea id="address" value={formData.address} onChange={handleInputChange} placeholder="Masukkan alamat lengkap sesuai KTP" /></div>
                    <div className="space-y-2"><Label htmlFor="pekerjaan">Pekerjaan</Label><Input id="pekerjaan" value={formData.pekerjaan} onChange={handleInputChange} placeholder="Contoh: Karyawan Swasta" /></div>
                    <div className="space-y-2"><Label htmlFor="emergencyContact">Kontak Darurat</Label><Input id="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} placeholder="Nama dan nomor kontak darurat" /></div>
                  </div>
                </div>

                {/* --- Asuransi & Medis Lainnya --- */}
                <div>
                  <h3 className="text-lg font-medium mb-4 border-b pb-2">Asuransi & Medis Lainnya</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label htmlFor="jenisAsuransi">Jenis Asuransi</Label><Select onValueChange={(value) => handleSelectChange('jenisAsuransi', value)} value={formData.jenisAsuransi}><SelectTrigger><SelectValue placeholder="Pilih jenis asuransi" /></SelectTrigger><SelectContent><SelectItem value="UMUM">Umum</SelectItem><SelectItem value="BPJS">BPJS</SelectItem><SelectItem value="ASURANSI_LAIN">Asuransi Lain</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label htmlFor="noAsuransi">No. Asuransi/BPJS</Label><Input id="noAsuransi" value={formData.noAsuransi} onChange={handleInputChange} placeholder="Kosongkan jika umum" /></div>
                    <div className="space-y-2 md:col-span-2"><Label htmlFor="allergies">Riwayat Alergi</Label><Textarea id="allergies" value={formData.allergies} onChange={handleInputChange} placeholder="Sebutkan alergi obat atau makanan jika ada" /></div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    {loading ? 'Menyimpan...' : 'Simpan Data'}
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
