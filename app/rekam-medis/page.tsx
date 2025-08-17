"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
// Import ikon WhatsApp
import { Eye, Search, RefreshCw, Loader2, Stethoscope, List, Clock, MessageCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { debounce } from 'lodash'
import Link from 'next/link'

// Tipe Data
interface VisitQueueItem {
  id: string;
  visitDate: string;
  noRekamMedis: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  patient: { name: string; };
}
interface MedicalRecord {
  id: string;
  createdAt: string;
  noRekamMedis: string;
  patient: { 
    name: string; 
    phone?: string | null; // Tambahkan nomor telepon pasien
  };
  doctor: { name: string; };
  assessment: string;
}
interface User {
    id: string;
    name: string;
    role: string;
}
interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function RekamMedisPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  
  // State untuk Antrian
  const [visitQueue, setVisitQueue] = useState<VisitQueueItem[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);

  // State untuk Riwayat
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const router = useRouter();
  const { toast } = useToast();

  const fetchVisitQueue = useCallback(async () => {
    setLoadingQueue(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/kunjungan?tanggal=${today}`);
      const result = await response.json();
      if (result.success) {
        setVisitQueue(result.data);
      } else {
        toast({ title: "Error", description: "Gagal memuat antrian hari ini.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
    } finally {
      setLoadingQueue(false);
    }
  }, [toast]);

  const fetchMedicalRecords = useCallback(async (page = 1, search = '') => {
    setLoadingHistory(true);
    try {
      const query = new URLSearchParams({ page: page.toString(), limit: pagination.limit.toString(), search }).toString();
      const response = await fetch(`/api/rekam-medis?${query}`);
      const result = await response.json();
      if (result.success) {
        setRecords(result.data);
        setPagination(result.pagination);
      } else {
        toast({ title: "Error", description: "Gagal memuat riwayat rekam medis.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
    } finally {
      setLoadingHistory(false);
    }
  }, [pagination.limit, toast]);
  
  const debouncedSearch = useCallback(debounce((term) => fetchMedicalRecords(1, term), 500), [fetchMedicalRecords]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    else router.push('/login');
    
    fetchVisitQueue();
    fetchMedicalRecords();
  }, [fetchVisitQueue, fetchMedicalRecords, router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
        fetchMedicalRecords(newPage, searchTerm);
    }
  };

  const getStatusBadge = (status: VisitQueueItem['status']) => {
    const statusConfig = {
      'WAITING': { variant: 'secondary', label: 'Menunggu' },
      'IN_PROGRESS': { variant: 'default', label: 'Diperiksa' },
      'COMPLETED': { variant: 'outline', label: 'Selesai' },
      'CANCELLED': { variant: 'destructive', label: 'Batal' }
    } as const;
    return <Badge variant={statusConfig[status]?.variant || 'default'}>{statusConfig[status]?.label || status}</Badge>;
  }

  // Fungsi untuk mengirim rekam medis via WhatsApp
  const handleSendWhatsApp = (record: MedicalRecord) => {
    const patientPhone = record.patient.phone;

    if (!patientPhone) {
      toast({
        title: "Gagal Mengirim",
        description: "Pasien ini tidak memiliki nomor telepon.",
        variant: "destructive",
      });
      return;
    }

    // Format nomor telepon: ganti '0' di depan dengan '62'
    let formattedPhone = patientPhone.startsWith('0') 
      ? `62${patientPhone.substring(1)}` 
      : patientPhone;
    
    // Hapus karakter non-numerik
    formattedPhone = formattedPhone.replace(/[^0-9]/g, '');

    // Buat link PDF (asumsi URL ini ada dan berfungsi)
    const pdfUrl = `${window.location.origin}/api/rekam-medis/${record.id}/pdf`;

    // Buat pesan WhatsApp
    const message = `Yth. Bpk/Ibu ${record.patient.name},\n\nBerikut adalah ringkasan hasil pemeriksaan Anda di Klinik PKU Muhammadiyah pada tanggal ${new Date(record.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}.\n\nAnda dapat melihatnya melalui tautan aman berikut:\n${pdfUrl}\n\nTerima kasih atas kepercayaan Anda. Semoga lekas sembuh.`;

    // Encode pesan untuk URL
    const encodedMessage = encodeURIComponent(message);

    // Buat URL WhatsApp
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    // Buka WhatsApp di tab baru
    window.open(whatsappUrl, '_blank');

    toast({
      title: "Berhasil",
      description: "Pesan WhatsApp sedang disiapkan...",
    });
  };

  const renderQueue = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="flex items-center gap-2"><Clock /> Antrian Pasien Hari Ini</CardTitle>
                <CardDescription>Pasien yang terdaftar dan menunggu untuk diperiksa.</CardDescription>
            </div>
            <Button variant="outline" onClick={fetchVisitQueue} disabled={loadingQueue}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingQueue ? 'animate-spin' : ''}`} /> Refresh
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loadingQueue ? <Skeleton className="h-40 w-full" /> : (
            <div className="border rounded-md">
                <Table>
                    <TableHeader><TableRow><TableHead>Waktu Daftar</TableHead><TableHead>No. RM</TableHead><TableHead>Nama Pasien</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                    <TableBody>
                    {visitQueue.length > 0 ? visitQueue.map((visit) => (
                        <TableRow key={visit.id}>
                        <TableCell>{new Date(visit.visitDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                        <TableCell className="font-medium">{visit.noRekamMedis}</TableCell>
                        <TableCell>{visit.patient.name}</TableCell>
                        <TableCell>{getStatusBadge(visit.status)}</TableCell>
                        <TableCell className="text-right">
                            <Link href={`/rekam-medis/tambah?kunjunganId=${visit.id}`}>
                            <Button disabled={visit.status === 'COMPLETED'}><Stethoscope className="h-4 w-4 mr-2" />{visit.status === 'COMPLETED' ? 'Selesai' : 'Periksa'}</Button>
                            </Link>
                        </TableCell>
                        </TableRow>
                    )) : <TableRow><TableCell colSpan={5} className="text-center h-24">Belum ada pasien dalam antrian hari ini.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
        )}
      </CardContent>
    </Card>
  );

  const renderHistory = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><List /> Riwayat Rekam Medis</CardTitle>
        <CardDescription>Daftar semua rekam medis pasien yang telah tercatat.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input placeholder="Cari nama pasien atau No. RM..." value={searchTerm} onChange={handleSearchChange} className="pl-10" />
          </div>
        </div>
        {loadingHistory ? <Skeleton className="h-64 w-full" /> : (
            <>
            <div className="border rounded-md">
            <Table>
                <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>No. RM</TableHead><TableHead>Nama Pasien</TableHead><TableHead>Dokter</TableHead><TableHead>Diagnosis</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                {records.length > 0 ? records.map((record) => (
                    <TableRow key={record.id}>
                    <TableCell>{new Date(record.createdAt).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{record.noRekamMedis}</TableCell>
                    <TableCell>{record.patient.name}</TableCell>
                    <TableCell>{record.doctor.name}</TableCell>
                    <TableCell className="truncate max-w-xs">{record.assessment}</TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => window.open(`/api/rekam-medis/${record.id}/pdf`, '_blank')}><Eye className="h-4 w-4 mr-2" />Lihat PDF</Button>
                            {/* Tombol Kirim ke WhatsApp */}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleSendWhatsApp(record)} 
                              disabled={!record.patient.phone}
                              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            >
                                <MessageCircle className="h-4 w-4 mr-2" /> Kirim WA
                            </Button>
                        </div>
                    </TableCell>
                    </TableRow>
                )) : <TableRow><TableCell colSpan={6} className="text-center h-24">Tidak ada data riwayat ditemukan.</TableCell></TableRow>}
                </TableBody>
            </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <span className="text-sm text-gray-600">Halaman {pagination.page} dari {pagination.totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1}>Sebelumnya</Button>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>Berikutnya</Button>
            </div>
            </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={user?.role} />
      <div className="flex-1 md:ml-64">
        <Navbar user={user} />
        <main className="p-6 space-y-6">
            <div className="flex border-b">
                <Button variant={activeTab === 'queue' ? 'default' : 'ghost'} onClick={() => setActiveTab('queue')} className="rounded-b-none">Antrian Hari Ini</Button>
                <Button variant={activeTab === 'history' ? 'default' : 'ghost'} onClick={() => setActiveTab('history')} className="rounded-b-none">Riwayat Rekam Medis</Button>
            </div>
            {activeTab === 'queue' ? renderQueue() : renderHistory()}
        </main>
      </div>
    </div>
  )
}
