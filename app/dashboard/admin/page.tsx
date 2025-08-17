"use client"

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Activity, Package, UserCheck, Loader2, RefreshCw, AlertCircle, Search, Plus, TextSearch, List } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

// --- DEFINISI TIPE DATA ---
interface AdminStats {
  totalPasien: number;
  kunjunganHariIni: number;
  stokObatMenipis: number;
  pegawaiHadir: number;
  pegawaiTotal: number;
}

interface User {
    name: string;
    role: 'ADMIN' | 'DOKTER' | 'APOTEKER';
}

interface Patient {
  id: string;
  noRekamMedis: string;
  name: string;
  nik: string | null;
  jenisAsuransi: string | null;
}

// --- KOMPONEN SKELETON ---
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
    {Array.from({ length: 4 }).map((_, index) => (
      <Card key={index}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-4 rounded-full" /></CardHeader><CardContent><Skeleton className="h-7 w-1/3" /></CardContent></Card>
    ))}
  </div>
);

export default function AdminDashboard() {
  // --- STATE DASBOR ---
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null)
  
  // --- STATE UNTUK DIALOG TAMBAH KUNJUNGAN ---
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [visitDialogViewMode, setVisitDialogViewMode] = useState<'list' | 'search'>('list');
  const [patientList, setPatientList] = useState<Patient[]>([]); // Untuk hasil pencarian
  const [allPatientsList, setAllPatientsList] = useState<Patient[]>([]); // Untuk daftar semua pasien
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({ klinikTujuan: '', jenisAsuransi: 'UMUM', alasanKunjungan: '', keluhan: '' });
  const [loadingPatients, setLoadingPatients] = useState(false); // Untuk search
  const [loadingAllPatients, setLoadingAllPatients] = useState(false); // Untuk list
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [allPatientsPage, setAllPatientsPage] = useState(1);
  const [allPatientsTotalPages, setAllPatientsTotalPages] = useState(1);
  
  const { toast } = useToast();

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const kunjunganBulanan = [ { name: 'Jan', kunjungan: 400 }, { name: 'Feb', kunjungan: 300 }, { name: 'Mar', kunjungan: 500 }, { name: 'Apr', kunjungan: 450 }, { name: 'Mei', kunjungan: 610 }, { name: 'Jun', kunjungan: 570 }, ];

  // --- FUNGSI API ---
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true); setStatsError(null);
    try {
      const response = await fetch('/api/dashboard/stats?role=ADMIN');
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Gagal memuat statistik.');
      setStats(result.data);
    } catch (err: any) { setStatsError(err.message); } finally { setIsLoadingStats(false); }
  }, []);

  // --- FUNGSI UNTUK DIALOG TAMBAH KUNJUNGAN ---
  const fetchAllPatients = useCallback(async (page: number) => {
    setLoadingAllPatients(true);
    try {
        const response = await fetch(`/api/pasien?page=${page}&limit=5`);
        const result = await response.json();
        if(result.success) {
            setAllPatientsList(result.data);
            setAllPatientsTotalPages(result.pagination.totalPages);
        } else { throw new Error(result.error || "Gagal memuat daftar pasien."); }
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); } 
    finally { setLoadingAllPatients(false); }
  }, [toast]);

  const handlePatientSearch = async () => {
    if (patientSearchTerm.length < 3) { toast({ title: "Info", description: "Ketik minimal 3 karakter untuk mencari." }); return; }
    setLoadingPatients(true); setPatientList([]);
    try {
      const response = await fetch(`/api/pasien?search=${patientSearchTerm}&limit=5`);
      const result = await response.json();
      if (result.success) {
        setPatientList(result.data);
        if (result.data.length === 0) toast({ title: "Info", description: "Pasien tidak ditemukan." });
      } else { throw new Error(result.error || "Gagal mencari pasien."); }
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); } 
    finally { setLoadingPatients(false); }
  };

  const handleRegisterVisit = async () => {
    if (!selectedPatient || !formData.alasanKunjungan || !formData.klinikTujuan) { toast({ title: "Input Tidak Lengkap", description: "Klinik tujuan dan alasan kunjungan wajib diisi.", variant: "destructive" }); return; }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/kunjungan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: selectedPatient.id, noRekamMedis: selectedPatient.noRekamMedis, keluhan: formData.keluhan, klinikTujuan: formData.klinikTujuan, alasanKunjungan: formData.alasanKunjungan, jenisAsuransi: formData.jenisAsuransi, }), });
      const result = await response.json();
      if (result.success) {
        toast({ title: "Berhasil", description: `${selectedPatient.name} telah ditambahkan ke antrian.` });
        setIsVisitDialogOpen(false);
        fetchStats();
      } else { toast({ title: "Gagal", description: result.error, variant: "destructive" }); }
    } catch (error) { toast({ title: "Error", description: "Gagal mendaftarkan kunjungan.", variant: "destructive" }); } 
    finally { setIsSubmitting(false); }
  };

  const openRegistrationForm = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({ klinikTujuan: '', alasanKunjungan: '', keluhan: '', jenisAsuransi: patient.jenisAsuransi || 'UMUM' });
  };
  
  const resetDialog = () => {
    setSelectedPatient(null); setPatientList([]); setPatientSearchTerm('');
    setAllPatientsList([]); setAllPatientsPage(1); setVisitDialogViewMode('list');
  }

  // --- EFEK SAMPING & OTENTIKASI ---
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser: User = JSON.parse(userData);
      if (parsedUser.role === 'ADMIN') { setUser(parsedUser); fetchStats(); }
    }
    setIsCheckingAuth(false);
  }, [fetchStats]);
  
  useEffect(() => {
    if (isVisitDialogOpen && visitDialogViewMode === 'list' && !selectedPatient) {
      fetchAllPatients(allPatientsPage);
    }
  }, [isVisitDialogOpen, visitDialogViewMode, allPatientsPage, fetchAllPatients, selectedPatient]);

  const renderPatientTable = (patients: Patient[]) => (
    <div className="border rounded-md mt-4">
      <Table><TableHeader><TableRow><TableHead>No. RM</TableHead><TableHead>Nama Pasien</TableHead><TableHead>NIK</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
      <TableBody>{patients.map(p => (<TableRow key={p.id}><TableCell>{p.noRekamMedis}</TableCell><TableCell>{p.name}</TableCell><TableCell>{p.nik || '-'}</TableCell><TableCell className="text-right"><Button size="sm" onClick={() => openRegistrationForm(p)}><Plus className="h-4 w-4 mr-2" />Daftarkan</Button></TableCell></TableRow>))}</TableBody></Table>
    </div>
  );

  // --- RENDER ---
  if (isCheckingAuth) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  if (!user) return <div className="flex h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-center p-4"><AlertCircle className="h-16 w-16 text-red-500 mb-4" /><h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1><p className="text-gray-600 dark:text-gray-400">Anda harus masuk sebagai Administrator untuk melihat halaman ini.</p><Link href="/login"><Button className="mt-6">Kembali ke Halaman Login</Button></Link></div>;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={user.role} />
      <div className="flex-1 md:ml-64">
        <Navbar user={user} />
        <main className="p-4 md:p-6 space-y-6">
          <div><h1 className="text-2xl font-bold">Dashboard Administrator</h1><p className="text-gray-600">{today}</p></div>
          {isLoadingStats ? <StatsSkeleton /> : statsError ? (<div className="text-center bg-red-50 p-4 rounded-lg flex flex-col items-center justify-center gap-3"><p className="text-red-600">Error: {statsError}</p><Button variant="destructive" onClick={fetchStats}><RefreshCw className="mr-2 h-4 w-4" />Coba Lagi</Button></div>) : stats && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Pasien</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalPasien}</div></CardContent></Card><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Kunjungan Hari Ini</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.kunjunganHariIni}</div></CardContent></Card><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Stok Obat Menipis</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{stats.stokObatMenipis}</div></CardContent></Card><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pegawai Hadir</CardTitle><UserCheck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.pegawaiHadir}/{stats.pegawaiTotal}</div></CardContent></Card></div>)}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Grafik Kunjungan</CardTitle><CardDescription>Total kunjungan pasien per bulan.</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={kunjunganBulanan} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="kunjungan" fill="#3b82f6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
            <Card><CardHeader><CardTitle>Aksi Cepat</CardTitle><CardDescription>Akses cepat ke fitur manajemen utama.</CardDescription></CardHeader><CardContent><div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><Link href="/pasien/tambah"><Button variant="outline" className="w-full h-20 flex flex-col gap-2"><Users className="h-6 w-6" /><span>Tambah Pasien</span></Button></Link>
              <Dialog open={isVisitDialogOpen} onOpenChange={(isOpen) => { setIsVisitDialogOpen(isOpen); if (!isOpen) resetDialog(); }}>
                <DialogTrigger asChild><Button variant="outline" className="w-full h-20 flex flex-col gap-2"><Activity className="h-6 w-6" /><span>Tambah Kunjungan</span></Button></DialogTrigger>
                <DialogContent className="sm:max-w-[725px]">
                  {selectedPatient ? (<>
                    <DialogHeader><DialogTitle>Detail Kunjungan untuk {selectedPatient.name}</DialogTitle><DialogDescription>No. RM: {selectedPatient.noRekamMedis}. Lengkapi detail kunjungan.</DialogDescription></DialogHeader>
                    <div className="py-4 space-y-4"><div className="space-y-2"><Label>Klinik Tujuan *</Label><Select value={formData.klinikTujuan} onValueChange={(v) => setFormData(p => ({...p, klinikTujuan: v}))}><SelectTrigger><SelectValue placeholder="Pilih klinik" /></SelectTrigger><SelectContent><SelectItem value="UMUM">Umum</SelectItem><SelectItem value="ANAK">Anak</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Jenis Asuransi</Label><Select value={formData.jenisAsuransi} onValueChange={(v) => setFormData(p => ({...p, jenisAsuransi: v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="UMUM">Umum</SelectItem><SelectItem value="BPJS">BPJS</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Alasan Kunjungan *</Label><Input value={formData.alasanKunjungan} onChange={(e) => setFormData(p => ({...p, alasanKunjungan: e.target.value}))} /></div><div className="space-y-2"><Label>Keluhan Utama</Label><Textarea value={formData.keluhan} onChange={(e) => setFormData(p => ({...p, keluhan: e.target.value}))} /></div></div>
                    <DialogFooter><Button variant="outline" onClick={resetDialog}>Batal</Button><Button onClick={handleRegisterVisit} disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</Button></DialogFooter>
                  </>) : visitDialogViewMode === 'list' ? (<>
                    <DialogHeader><DialogTitle>Daftarkan Kunjungan Baru</DialogTitle><DialogDescription>Pilih pasien dari daftar, atau cari pasien spesifik.</DialogDescription></DialogHeader>
                    <div className="flex justify-end"><Button variant="outline" size="sm" onClick={() => setVisitDialogViewMode('search')}><Search className="h-4 w-4 mr-2" />Cari Pasien</Button></div>
                    {loadingAllPatients ? <Skeleton className="h-40 w-full" /> : renderPatientTable(allPatientsList)}
                    <div className="flex items-center justify-end space-x-2 pt-4"><Button variant="outline" size="sm" onClick={() => setAllPatientsPage(p => Math.max(p - 1, 1))} disabled={allPatientsPage === 1}>Sebelumnya</Button><Button variant="outline" size="sm" onClick={() => setAllPatientsPage(p => p + 1)} disabled={allPatientsPage >= allPatientsTotalPages}>Selanjutnya</Button></div>
                  </>) : (<>
                    <DialogHeader><DialogTitle>Cari Pasien</DialogTitle><DialogDescription>Cari pasien berdasarkan Nama atau No. RM.</DialogDescription></DialogHeader>
                    <div className="flex gap-2"><Input placeholder="Ketik Nama atau No. RM..." value={patientSearchTerm} onChange={(e) => setPatientSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePatientSearch()} /><Button onClick={handlePatientSearch} disabled={loadingPatients}><TextSearch className="h-4 w-4 mr-2" />{loadingPatients ? 'Mencari...' : 'Cari'}</Button></div>
                    {loadingPatients ? <Skeleton className="h-24 w-full mt-4" /> : patientList.length > 0 && renderPatientTable(patientList)}
                    <DialogFooter><Button variant="outline" onClick={() => setVisitDialogViewMode('list')}>Kembali ke Daftar</Button></DialogFooter>
                  </>)}
                </DialogContent>
              </Dialog>
              <Link href="/obat/tambah"><Button variant="outline" className="w-full h-20 flex flex-col gap-2"><Package className="h-6 w-6" /><span>Tambah Obat</span></Button></Link>
            </div></CardContent></Card>
          </div>
        </main>
      </div>
    </div>
  )
}
