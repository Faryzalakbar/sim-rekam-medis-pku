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
import { Search, Plus, Eye, UserPlus, TextSearch, List } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Tipe data untuk Kunjungan (Visit) dan Pasien (Patient)
interface Visit {
  id: string;
  visitDate: string;
  noRekamMedis: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  patient: { name: string; }; // Mengharapkan 'patient'
}

interface Patient {
  id: string;
  noRekamMedis: string;
  name: string;
  nik: string | null;
  jenisAsuransi: string | null;
}

export default function KunjunganPage() {
  const [user, setUser] = useState<any>(null)
  const [visitList, setVisitList] = useState<Visit[]>([])
  const [patientList, setPatientList] = useState<Patient[]>([])
  const [allPatientsList, setAllPatientsList] = useState<Patient[]>([])
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  
  const [formData, setFormData] = useState({
    klinikTujuan: '',
    jenisAsuransi: 'UMUM',
    alasanKunjungan: '',
    keluhan: ''
  });
  
  const [loadingVisits, setLoadingVisits] = useState(true)
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [loadingAllPatients, setLoadingAllPatients] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [patientSearchTerm, setPatientSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'search' | 'list'>('search')
  
  const [allPatientsPage, setAllPatientsPage] = useState(1)
  const [allPatientsTotalPages, setAllPatientsTotalPages] = useState(1)

  const { toast } = useToast()

  const fetchTodaysVisits = useCallback(async () => {
    setLoadingVisits(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/kunjungan?tanggal=${today}`);
      const result = await response.json();
      if (result.success) setVisitList(result.data);
    } catch (error) {
        toast({ title: "Error", description: "Gagal memuat antrian hari ini.", variant: "destructive" });
    } finally {
      setLoadingVisits(false);
    }
  }, [toast]);

  const fetchAllPatients = useCallback(async (page: number) => {
    setLoadingAllPatients(true);
    try {
        const response = await fetch(`/api/pasien?page=${page}&limit=5`);
        const result = await response.json();
        if(result.success) {
            setAllPatientsList(result.data);
            setAllPatientsTotalPages(result.pagination.totalPages);
        }
    } catch (error) {
        toast({ title: "Error", description: "Gagal memuat daftar pasien.", variant: "destructive" });
    } finally {
        setLoadingAllPatients(false);
    }
  }, [toast]);

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
    fetchTodaysVisits()
  }, [fetchTodaysVisits])

  useEffect(() => {
    if (viewMode === 'list') {
      fetchAllPatients(allPatientsPage);
    }
  }, [viewMode, allPatientsPage, fetchAllPatients]);

  const handlePatientSearch = async () => {
    if (patientSearchTerm.length < 3) {
      toast({ title: "Info", description: "Ketik minimal 3 karakter untuk mencari." });
      return;
    }
    setLoadingPatients(true);
    try {
      const response = await fetch(`/api/pasien?search=${patientSearchTerm}&limit=5`);
      const result = await response.json();
      if (result.success) {
        setPatientList(result.data);
        if (result.data.length === 0) {
            toast({ title: "Info", description: "Pasien tidak ditemukan." });
        }
      }
    } catch (error) {
        toast({ title: "Error", description: "Gagal mencari pasien.", variant: "destructive" });
    } finally {
      setLoadingPatients(false);
    }
  }

  const handleRegisterVisit = async () => {
    if (!selectedPatient || !formData.alasanKunjungan || !formData.klinikTujuan) {
      toast({ title: "Input Tidak Lengkap", description: "Klinik tujuan dan alasan kunjungan wajib diisi.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/kunjungan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          noRekamMedis: selectedPatient.noRekamMedis,
          keluhan: formData.keluhan,
          klinikTujuan: formData.klinikTujuan,
          alasanKunjungan: formData.alasanKunjungan,
          jenisAsuransi: formData.jenisAsuransi,
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast({ title: "Berhasil", description: `${selectedPatient.name} telah ditambahkan ke antrian.` });
        setIsDialogOpen(false);
        fetchTodaysVisits();
      } else {
        toast({ title: "Gagal", description: result.error, variant: "destructive" });
      }
    } catch (error) {
        toast({ title: "Error", description: "Gagal mendaftarkan kunjungan.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const openRegistrationDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({
        klinikTujuan: '',
        alasanKunjungan: '',
        keluhan: '',
        jenisAsuransi: patient.jenisAsuransi || 'UMUM'
    });
    setIsDialogOpen(true);
  }
  
  const getStatusBadge = (status: Visit['status']) => {
    const statusConfig = {
      'WAITING': { variant: 'secondary', label: 'Menunggu' },
      'IN_PROGRESS': { variant: 'default', label: 'Diperiksa' },
      'COMPLETED': { variant: 'outline', label: 'Selesai' },
      'CANCELLED': { variant: 'destructive', label: 'Batal' }
    } as const;
    return <Badge variant={statusConfig[status]?.variant || 'default'}>{statusConfig[status]?.label || status}</Badge>;
  }

  const renderPatientTable = (patients: Patient[]) => (
    <div className="border rounded-md mt-4">
      <Table>
        <TableHeader><TableRow><TableHead>No. RM</TableHead><TableHead>Nama Pasien</TableHead><TableHead>NIK</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
        <TableBody>
          {patients.map(p => (
            <TableRow key={p.id}>
              <TableCell>{p.noRekamMedis}</TableCell>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.nik || '-'}</TableCell>
              <TableCell className="text-right">
                <Button onClick={() => openRegistrationDialog(p)}><Plus className="h-4 w-4 mr-2" />Daftarkan</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (!user) return <div className="flex h-screen items-center justify-center">Loading...</div>

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={user.role} />
      <div className="flex-1 md:ml-64">
        <Navbar user={user} />
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Kunjungan</h1>
            <p className="text-gray-600">Pendaftaran pasien dan pemantauan antrian klinik.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserPlus />Daftarkan Kunjungan Baru</CardTitle>
              <CardDescription>Pilih metode pendaftaran: cari pasien spesifik atau pilih dari daftar.</CardDescription>
            </CardHeader>
            <CardContent>
              {viewMode === 'search' ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="Ketik Nama atau No. RM Pasien..." value={patientSearchTerm} onChange={(e) => setPatientSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePatientSearch()} />
                    <Button onClick={handlePatientSearch} disabled={loadingPatients}><TextSearch className="h-4 w-4 mr-2" />{loadingPatients ? 'Mencari...' : 'Cari'}</Button>
                    <Button variant="outline" onClick={() => setViewMode('list')}><List className="h-4 w-4 mr-2" />Lihat Semua</Button>
                  </div>
                  {loadingPatients ? <Skeleton className="h-20 w-full" /> : patientList.length > 0 && renderPatientTable(patientList)}
                </div>
              ) : (
                <div>
                  <Button variant="outline" onClick={() => setViewMode('search')} className="mb-4"><Search className="h-4 w-4 mr-2" />Kembali ke Pencarian</Button>
                  {loadingAllPatients ? <Skeleton className="h-40 w-full" /> : renderPatientTable(allPatientsList)}
                  <div className="flex items-center justify-end space-x-2 py-4">
                      <Button variant="outline" size="sm" onClick={() => setAllPatientsPage(p => Math.max(p - 1, 1))} disabled={allPatientsPage === 1}>Sebelumnya</Button>
                      <Button variant="outline" size="sm" onClick={() => setAllPatientsPage(p => p + 1)} disabled={allPatientsPage >= allPatientsTotalPages}>Selanjutnya</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Antrian Hari Ini ({new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })})</CardTitle></CardHeader>
            <CardContent>
              {loadingVisits ? <Skeleton className="h-40 w-full" /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Waktu Daftar</TableHead><TableHead>No. RM</TableHead><TableHead>Nama Pasien</TableHead><TableHead>Status</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {visitList.length > 0 ? visitList.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell>{new Date(visit.visitDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                        <TableCell className="font-medium">{visit.noRekamMedis}</TableCell>
                        <TableCell>{visit.patient.name}</TableCell> {/* Menggunakan 'patient' */}
                        <TableCell>{getStatusBadge(visit.status)}</TableCell>
                        <TableCell><Link href={`/kunjungan/${visit.id}`}><Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />Detail</Button></Link></TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={5} className="text-center">Belum ada pasien yang berkunjung hari ini.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Daftarkan Kunjungan untuk {selectedPatient?.name}</DialogTitle>
                  <DialogDescription>No. RM: {selectedPatient?.noRekamMedis}. Lengkapi detail kunjungan.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="klinikTujuan">Klinik Tujuan *</Label>
                    <Select value={formData.klinikTujuan} onValueChange={(value) => setFormData(prev => ({...prev, klinikTujuan: value}))}>
                      <SelectTrigger><SelectValue placeholder="Pilih klinik tujuan" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UMUM">Klinik Umum</SelectItem>
                        <SelectItem value="ANAK">Klinik Anak</SelectItem>
                        <SelectItem value="GIGI">Klinik Gigi</SelectItem>
                        <SelectItem value="KIA">Klinik KIA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="jenisAsuransi">Jenis Asuransi</Label>
                    <Select value={formData.jenisAsuransi} onValueChange={(value) => setFormData(prev => ({...prev, jenisAsuransi: value}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UMUM">Umum</SelectItem>
                        <SelectItem value="BPJS">BPJS</SelectItem>
                        <SelectItem value="ASURANSI_LAIN">Asuransi Lain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alasanKunjungan">Alasan Kunjungan *</Label>
                    <Input id="alasanKunjungan" value={formData.alasanKunjungan} onChange={(e) => setFormData(prev => ({...prev, alasanKunjungan: e.target.value}))} placeholder="Contoh: Kontrol rutin, Sakit kepala" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keluhan">Keluhan Utama (Opsional)</Label>
                    <Textarea id="keluhan" value={formData.keluhan} onChange={(e) => setFormData(prev => ({...prev, keluhan: e.target.value}))} placeholder="Deskripsikan keluhan pasien secara detail..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                  <Button onClick={handleRegisterVisit} disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan Kunjungan'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </main>
      </div>
    </div>
  )
}
