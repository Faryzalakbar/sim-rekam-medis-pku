"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft } from 'lucide-react'
import { AttendanceStatus, Role } from '@prisma/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton' // PERBAIKAN: Menambahkan impor untuk Skeleton

// --- DEFINISI TIPE DATA ---
interface UserDetails { name: string; role: Role; }
interface AttendanceRecord { id: string; date: string; checkIn: string | null; checkOut: string | null; status: AttendanceStatus; notes: string | null; }
interface LoggedInUser { name: string; role: Role; }

// --- KOMPONEN BADGE STATUS ---
const StatusBadge = ({ status }: { status: AttendanceStatus }) => {
  const statusConfig = useMemo(() => ({
    PRESENT: { className: 'bg-green-100 text-green-800 border-green-200', label: 'Hadir' },
    LATE: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Terlambat' },
    LEAVE: { className: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Izin' },
    SICK: { className: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Sakit' },
    ABSENT: { className: 'bg-red-100 text-red-800 border-red-200', label: 'Alpa' }
  }), []);
  const config = statusConfig[status] || { className: 'bg-gray-100 text-gray-800', label: status };
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
};

export default function RiwayatAbsensiPegawai() {
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [employee, setEmployee] = useState<UserDetails | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk filter
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const userId = params.userId as string;

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/absensi/${userId}?year=${selectedYear}&month=${selectedMonth}`);
      const result = await response.json();
      if (result.success) {
        setEmployee(result.data.user);
        setHistory(result.data.history);
      } else {
        throw new Error(result.error || "Gagal memuat riwayat absensi");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [userId, selectedYear, selectedMonth, toast]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setLoggedInUser(JSON.parse(userData));
    fetchHistory();
  }, [fetchHistory]);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = [
      { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' }, { value: '3', label: 'Maret' },
      { value: '4', label: 'April' }, { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
      { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' }, { value: '9', label: 'September' },
      { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
  ];

  if (!loggedInUser) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={loggedInUser.role} />
      <div className="flex-1 md:ml-64">
        <Navbar user={loggedInUser} />
        <main className="p-4 md:p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <h1 className="text-2xl font-bold">Riwayat Absensi Pegawai</h1>
              {loading ? <Skeleton className="h-5 w-48 mt-1" /> : <p className="text-gray-600">Detail kehadiran untuk {employee?.name}</p>}
            </div>
          </div>

          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Seluruh Riwayat</CardTitle>
                    <div className="flex gap-2">
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Pilih Bulan" /></SelectTrigger>
                            <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Pilih Tahun" /></SelectTrigger>
                            <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Jam Masuk</TableHead><TableHead>Jam Keluar</TableHead><TableHead>Status</TableHead><TableHead>Keterangan</TableHead></TableRow></TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center h-40"><Loader2 className="h-6 w-6 animate-spin inline-block" /></TableCell></TableRow>
                  ) : history.length > 0 ? (
                    history.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{new Date(record.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</TableCell>
                        <TableCell>{formatTime(record.checkIn)}</TableCell>
                        <TableCell>{formatTime(record.checkOut)}</TableCell>
                        <TableCell><StatusBadge status={record.status} /></TableCell>
                        <TableCell>{record.notes || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5} className="text-center h-24">Tidak ada riwayat absensi untuk periode ini.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
