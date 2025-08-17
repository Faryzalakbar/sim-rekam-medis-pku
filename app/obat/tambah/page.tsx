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

export default function TambahObatPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Tambahkan expiryDate ke state formData
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: '',
    unit: '',
    price: 0,
    stock: 0,
    minStock: 0,
    expiryDate: '', // State baru untuk tanggal kedaluwarsa
    description: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target
    // Proses nilai berdasarkan tipe input
    const processedValue = type === 'number' ? parseFloat(value) || 0 : value
    setFormData(prev => ({ ...prev, [id]: processedValue }))
  }

  const handleSelectChange = (id: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    // Validasi input, termasuk tanggal kedaluwarsa
    if (!formData.name || !formData.type || formData.price <= 0 || formData.stock < 0 || !formData.expiryDate) {
        toast({
            title: "Input Tidak Lengkap",
            description: "Nama, Jenis, Harga, Stok, dan Tanggal Kedaluwarsa wajib diisi.",
            variant: "destructive"
        })
        setLoading(false)
        return
    }

    try {
      // Pastikan data yang dikirim sesuai dengan skema
      const payload = {
        ...formData,
        expiryDate: new Date(formData.expiryDate).toISOString() // Konversi ke format ISO string
      }

      const response = await fetch('/api/obat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Berhasil!",
          description: "Data obat baru berhasil disimpan."
        })
        router.push('/obat')
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
              <h1 className="text-2xl font-bold">Tambah Obat Baru</h1>
              <p className="text-gray-600">Isi formulir untuk menambahkan obat ke inventori.</p>
            </div>
            <Link href="/obat"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Kembali</Button></Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Formulir Data Obat</CardTitle>
              <CardDescription>Pastikan semua data diisi dengan benar.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Obat *</Label>
                    <Input id="name" value={formData.name} onChange={handleInputChange} placeholder="Contoh: Paracetamol 500mg" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Kode Obat (SKU) *</Label>
                    <Input id="code" value={formData.code} onChange={handleInputChange} placeholder="Contoh: PCT500" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type">Jenis Obat *</Label>
                    <Select onValueChange={(value) => handleSelectChange('type', value)} value={formData.type} required>
                      <SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tablet">Tablet</SelectItem>
                        <SelectItem value="Kapsul">Kapsul</SelectItem>
                        <SelectItem value="Sirup">Sirup</SelectItem>
                        <SelectItem value="Cair">Cair</SelectItem>
                        <SelectItem value="Salep">Salep</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Satuan</Label>
                    <Input id="unit" value={formData.unit} onChange={handleInputChange} placeholder="Contoh: Strip, Botol, Tube" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Harga Jual (Rp) *</Label>
                    <Input id="price" type="number" min="0" value={formData.price} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stok Awal *</Label>
                    <Input id="stock" type="number" min="0" value={formData.stock} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStock">Stok Minimum</Label>
                    <Input id="minStock" type="number" min="0" value={formData.minStock} onChange={handleInputChange} />
                  </div>
                  {/* Input baru untuk Tanggal Kedaluwarsa */}
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Tanggal Kedaluwarsa *</Label>
                    <Input id="expiryDate" type="date" value={formData.expiryDate} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi / Catatan</Label>
                  <Textarea id="description" value={formData.description} onChange={handleInputChange} placeholder="Informasi tambahan tentang obat" />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Menyimpan...</> : <><Save className="h-4 w-4 mr-2" />Simpan Obat</>}
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
