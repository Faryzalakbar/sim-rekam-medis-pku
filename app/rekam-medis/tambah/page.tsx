"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Loader2, Plus, Trash2, Search, List } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { debounce } from 'lodash'

// --- Tipe Data ---
interface User { id: string; name: string; role: string; }
interface Patient { id: string; name: string; noRekamMedis: string; }
interface Visit { id: string; patientId: string; complaint: string | null; patient: Patient; }
// PERBAIKAN: Tambahkan 'description' ke tipe Medicine
interface Medicine { id: string; name: string; stock: number; unit: string; description?: string; }
interface PrescriptionItem { medicineId: string; name: string; quantity: number; dosage: string; notes?: string; }

export default function TambahRekamMedisLengkapPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [visit, setVisit] = useState<Visit | null>(null)
  
  // State komprehensif untuk semua data rekam medis
  const [formData, setFormData] = useState({
    // Pengkajian Awal
    hubunganKeluarga: '',
    statusPsikologis: { tenang: false, cemas: false, takut: false, marah: false, sedih: false, lainLain: false, lainLainText: '' },
    statusFungsional: { mandiri: false, perluBantuan: false, bantuanText: '' },
    skriningGizi: { penurunanBB: false, nafsuMakanTurun: false },
    // Tanda Vital & Asesmen Lanjutan
    vitalSigns: { suhu: '', nadi: '', respirasi: '', tekananDarah: '' },
    asesmenNyeri: { tingkat: '', skala: '' },
    risikoJatuh: '',
    // Masalah & Rencana Keperawatan
    masalahKeperawatan: { kurangPengetahuan: false, gizi: false, infeksi: false, nyeriAkut: false, cemas: false },
    rencanaIntervensi: { edukasi: false, edukasiGizi: false, pengawasanJatuh: false, perawatanLuka: false, manajemenNyeri: false },
    // SOAP Dokter
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  })
  
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [availableMedicines, setAvailableMedicines] = useState<Medicine[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const kunjunganId = searchParams.get('kunjunganId')

  // --- Functions ---

  const fetchVisitData = useCallback(async () => {
    if (!kunjunganId) return;
    try {
      const response = await fetch(`/api/kunjungan/${kunjunganId}`);
      const result = await response.json();
      if (result.success) {
        setVisit(result.data);
        setFormData(prev => ({ ...prev, subjective: result.data.complaint || '' }));
      } else {
        toast({ title: "Error", description: "Gagal memuat data kunjungan.", variant: "destructive" });
        router.push('/rekam-medis');
      }
    } catch (error) {
      toast({ title: "Error", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
    } finally {
      setPageLoading(false);
    }
  }, [kunjunganId, router, toast]);
  
  const fetchMedicines = useCallback(async (search = '') => {
    try {
      const response = await fetch(`/api/obat?search=${search}&limit=100`);
      const result = await response.json();
      if (result.success) setAvailableMedicines(result.data);
    } catch (error) {
      console.error("Gagal memuat data obat:", error);
    }
  }, []);

  const debouncedSearch = useCallback(debounce((term) => fetchMedicines(term), 300), [fetchMedicines]);

  // --- useEffect Hooks ---

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    else router.push('/login');
    fetchVisitData();
  }, [fetchVisitData, router]);
  
  useEffect(() => {
    if (isModalOpen) fetchMedicines();
  }, [isModalOpen, fetchMedicines]);

  // --- Event Handlers ---

  const handleNestedChange = (parentKey: keyof typeof formData, childKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentKey]: { ...(prev[parentKey] as object), [childKey]: value }
    }));
  };

  const addMedicineToPrescription = (medicine: Medicine) => {
    if (prescriptionItems.some(item => item.medicineId === medicine.id)) {
      toast({ title: "Info", description: `${medicine.name} sudah ada di resep.` });
      return;
    }
    setPrescriptionItems(prev => [...prev, { medicineId: medicine.id, name: medicine.name, quantity: 1, dosage: '3x1', notes: '' }]);
    setIsModalOpen(false);
  };
  
  const updatePrescriptionItem = (index: number, field: keyof PrescriptionItem, value: any) => {
    const newItems = [...prescriptionItems];
    (newItems[index] as any)[field] = value;
    setPrescriptionItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visit || !user) return;
    setLoading(true);

    const payload = {
      visitId: visit.id,
      patientId: visit.patientId,
      noRekamMedis: visit.patient.noRekamMedis,
      doctorId: user.id,
      ...formData,
      prescriptionItems,
    };

    try {
      const response = await fetch('/api/rekam-medis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        toast({ title: "Berhasil", description: "Rekam medis dan resep telah berhasil disimpan." });
        router.push('/rekam-medis');
      } else {
        toast({ title: "Error", description: result.error || "Gagal menyimpan data.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Terjadi kesalahan pada server.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading || !user) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={user?.role} />
      <div className="flex-1 md:ml-64">
        <Navbar user={user} />
        <main className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold">Rekam Medis Rawat Jalan</h1>
                    <p className="text-gray-600">Pasien: {visit?.patient.name} ({visit?.patient.noRekamMedis})</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-2" />Kembali</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Menyimpan...</> : <><Save className="h-4 w-4 mr-2" />Simpan Data</>}
                    </Button>
                </div>
            </div>
            
            {/* --- Pengkajian Awal --- */}
            <Card>
              <CardHeader><CardTitle>1. Pengkajian Awal Keperawatan</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div>
                    <Label className="font-semibold">Riwayat Psikososial & Status Psikologis</Label>
                    <Select value={formData.hubunganKeluarga} onValueChange={(v) => setFormData(p => ({...p, hubunganKeluarga: v}))}><SelectTrigger className="mt-2"><SelectValue placeholder="Hubungan dengan anggota keluarga..." /></SelectTrigger><SelectContent><SelectItem value="Baik">Baik</SelectItem><SelectItem value="Tidak Baik">Tidak Baik</SelectItem></SelectContent></Select>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                        {Object.keys(formData.statusPsikologis).filter(k => k !== 'lainLainText').map(key => (
                            <div key={key} className="flex items-center space-x-2"><Checkbox id={`psikologis-${key}`} checked={!!formData.statusPsikologis[key as keyof typeof formData.statusPsikologis]} onCheckedChange={(c) => handleNestedChange('statusPsikologis', key, Boolean(c))} /><Label htmlFor={`psikologis-${key}`}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label></div>
                        ))}
                    </div>
                </div>
                <div>
                    <Label className="font-semibold">Skrining Gizi (Anak & Dewasa)</Label>
                    <div className="flex items-center space-x-2 mt-2"><Checkbox id="penurunanBB" checked={formData.skriningGizi.penurunanBB} onCheckedChange={(c) => handleNestedChange('skriningGizi', 'penurunanBB', Boolean(c))} /><Label htmlFor="penurunanBB">Ada penurunan berat badan yang tidak diinginkan dalam 6 bulan terakhir</Label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="nafsuMakanTurun" checked={formData.skriningGizi.nafsuMakanTurun} onCheckedChange={(c) => handleNestedChange('skriningGizi', 'nafsuMakanTurun', Boolean(c))} /><Label htmlFor="nafsuMakanTurun">Nafsu makan menurun karena tidak nafsu makan</Label></div>
                </div>
              </CardContent>
            </Card>

            {/* --- Tanda Vital & Asesmen Lanjutan --- */}
            <Card>
              <CardHeader><CardTitle>2. Tanda Vital & Asesmen Lanjutan</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label>Suhu (°C)</Label><Input value={formData.vitalSigns.suhu} onChange={(e) => handleNestedChange('vitalSigns', 'suhu', e.target.value)} /></div>
                <div><Label>Nadi (x/menit)</Label><Input value={formData.vitalSigns.nadi} onChange={(e) => handleNestedChange('vitalSigns', 'nadi', e.target.value)} /></div>
                <div><Label>Respirasi (x/menit)</Label><Input value={formData.vitalSigns.respirasi} onChange={(e) => handleNestedChange('vitalSigns', 'respirasi', e.target.value)} /></div>
                <div><Label>Tekanan Darah (mmHg)</Label><Input value={formData.vitalSigns.tekananDarah} onChange={(e) => handleNestedChange('vitalSigns', 'tekananDarah', e.target.value)} /></div>
                <div><Label>Tingkat Nyeri (0-10)</Label><Input type="number" min="0" max="10" value={formData.asesmenNyeri.tingkat} onChange={(e) => handleNestedChange('asesmenNyeri', 'tingkat', e.target.value)} /></div>
                <div><Label>Risiko Jatuh</Label><Select value={formData.risikoJatuh} onValueChange={(v) => setFormData(p => ({...p, risikoJatuh: v}))}><SelectTrigger><SelectValue placeholder="Pilih risiko..." /></SelectTrigger><SelectContent><SelectItem value="Tidak Berisiko">Tidak Berisiko</SelectItem><SelectItem value="Risiko Rendah">Risiko Rendah</SelectItem><SelectItem value="Risiko Tinggi">Risiko Tinggi</SelectItem></SelectContent></Select></div>
              </CardContent>
            </Card>
            
            {/* --- Pemeriksaan Dokter (SOAP) --- */}
            <Card>
              <CardHeader><CardTitle>3. Pemeriksaan Dokter (SOAP)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label htmlFor="subjective" className="font-semibold">S (Subjective)</Label><Textarea id="subjective" value={formData.subjective} onChange={(e) => setFormData(p => ({...p, subjective: e.target.value}))} rows={4} placeholder="Keluhan utama pasien, riwayat penyakit sekarang dan dahulu..."/></div>
                <div><Label htmlFor="objective" className="font-semibold">O (Objective)</Label><Textarea id="objective" value={formData.objective} onChange={(e) => setFormData(p => ({...p, objective: e.target.value}))} rows={4} placeholder="Hasil pemeriksaan fisik, tanda vital, hasil lab..."/></div>
                <div><Label htmlFor="assessment" className="font-semibold">A (Assessment / Diagnosis)</Label><Textarea id="assessment" value={formData.assessment} onChange={(e) => setFormData(p => ({...p, assessment: e.target.value}))} rows={4} placeholder="Diagnosis kerja dan diagnosis banding..."/></div>
                <div><Label htmlFor="plan" className="font-semibold">P (Plan / Rencana Perawatan)</Label><Textarea id="plan" value={formData.plan} onChange={(e) => setFormData(p => ({...p, plan: e.target.value}))} rows={4} placeholder="Rencana terapi (farmakologi & non-farmakologi), edukasi, rujukan..."/></div>
              </CardContent>
            </Card>

            {/* --- Resep Obat --- */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>4. Resep Obat (Prescription)</CardTitle>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogTrigger asChild><Button type="button" variant="outline"><List className="h-4 w-4 mr-2" />Daftar Obat</Button></DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader><DialogTitle>Daftar Semua Obat</DialogTitle></DialogHeader>
                        <div className="relative my-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Cari obat..." className="pl-10" onChange={(e) => debouncedSearch(e.target.value)} /></div>
                        <div className="max-h-[60vh] overflow-y-auto">
                          <Table>
                            {/* PERBAIKAN: Tambahkan kolom Deskripsi / Catatan */}
                            <TableHeader><TableRow><TableHead className="w-[30%]">Nama Obat</TableHead><TableHead className="w-[40%]">Deskripsi / Catatan</TableHead><TableHead>Stok</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader>
                            <TableBody>{availableMedicines.map(med => (
                                <TableRow key={med.id}>
                                    <TableCell className="font-medium">{med.name}</TableCell>
                                    {/* PERBAIKAN: Tampilkan deskripsi obat */}
                                    <TableCell className="text-sm text-gray-500">{med.description || '-'}</TableCell>
                                    <TableCell>{med.stock} {med.unit}</TableCell>
                                    <TableCell><Button size="sm" onClick={() => addMedicineToPrescription(med)}>Tambah</Button></TableCell>
                                </TableRow>
                            ))}</TableBody>
                          </Table>
                        </div>
                      </DialogContent>
                    </Dialog>
                </div>
                <CardDescription>Cari atau pilih obat dari daftar untuk ditambahkan ke resep.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {prescriptionItems.length > 0 ? (
                  prescriptionItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start p-2 border rounded-md">
                      <div className="col-span-12 font-medium">{item.name}</div>
                      <div className="col-span-3"><Label>Jumlah</Label><Input type="number" min="1" value={item.quantity} onChange={(e) => updatePrescriptionItem(index, 'quantity', parseInt(e.target.value) || 1)} /></div>
                      <div className="col-span-4"><Label>Dosis</Label><Input value={item.dosage} onChange={(e) => updatePrescriptionItem(index, 'dosage', e.target.value)} /></div>
                      <div className="col-span-4"><Label>Catatan</Label><Input placeholder="Cth: Sesudah makan" value={item.notes} onChange={(e) => updatePrescriptionItem(index, 'notes', e.target.value)} /></div>
                      <div className="col-span-1 flex items-end h-full"><Button type="button" variant="destructive" size="icon" onClick={() => setPrescriptionItems(prev => prev.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button></div>
                    </div>
                  ))
                ) : <p className="text-center text-sm text-gray-500 py-4">Belum ada obat yang ditambahkan ke resep.</p>}
              </CardContent>
            </Card>

            <div className="flex justify-end"><Button type="submit" disabled={loading} size="lg">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : <><Save className="mr-2 h-4 w-4" />Simpan Semua Data Pemeriksaan</>}</Button></div>
          </form>
        </main>
      </div>
    </div>
  )
}
