"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Clock, CheckCircle, Calendar, User, LogIn, LogOut, UserPlus, Loader2 } from 'lucide-react'
import { AttendanceStatus, Role } from '@prisma/client'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// --- DEFINISI TIPE DATA ---
interface LoggedInUser {
  id: string;
  name: string;
  role: Role;
}

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  notes: string | null;
}

interface AttendanceStats {
  bulanIni: number;
  tepatWaktu: number;
  terlambat: number;
  izinSakit: number;
}

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

// --- KOMPONEN FORM TAMBAH PEGAWAI ---
const AddEmployeeForm = ({ onFinished }: { onFinished: () => void }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.password || !formData.role) {
            toast({ title: "Error", description: "Semua field wajib diisi.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/pegawai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (result.success) {
                toast({ title: "Berhasil", description: "Pegawai baru berhasil ditambahkan." });
                onFinished();
            } else {
                throw new Error(result.error || "Gagal menambahkan pegawai.");
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nama</Label><Input id="name" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="email" className="text-right">Email</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(p => ({...p, email: e.target.value}))} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="password" className="text-right">Password</Label><Input id="password" type="password" value={formData.password} onChange={(e) => setFormData(p => ({...p, password: e.target.value}))} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="role" className="text-right">Role</Label><Select value={formData.role} onValueChange={(value) => setFormData(p => ({...p, role: value}))}><SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih role" /></SelectTrigger><SelectContent><SelectItem value="DOKTER">Dokter</SelectItem><SelectItem value="APOTIK">Apoteker</SelectItem><SelectItem value="PEGAWAI">Pegawai</SelectItem></SelectContent></Select></div>
            <DialogFooter><Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan Pegawai'}</Button></DialogFooter>
        </div>
    );
};


export default function PegawaiDashboard() {
  const [user, setUser] = useState<LoggedInUser | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [attendanceToday, setAttendanceToday] = useState<AttendanceRecord | null>(null)
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats>({ bulanIni: 0, tepatWaktu: 0, terlambat: 0, izinSakit: 0 })
  const [loading, setLoading] = useState(true)
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast()

  const fetchAttendanceData = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/absensi/saya?userId=${userId}`);
      const result = await response.json();
      if (result.success) {
        setAttendanceToday(result.data.today);
        setAttendanceHistory(result.data.history); // Pastikan riwayat juga di-set di sini
        setStats(result.data.stats);
      } else {
        throw new Error(result.error || "Gagal memuat data absensi");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchAttendanceData(parsedUser.id);
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [fetchAttendanceData]);

  const handleCheckIn = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/absensi/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) });
      const result = await response.json();
      if (result.success) {
        toast({ title: "Berhasil", description: "Check in berhasil dicatat." });
        // PERBAIKAN: Panggil ulang fetchAttendanceData untuk me-refresh seluruh halaman
        fetchAttendanceData(user.id);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user || !attendanceToday) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/absensi/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ absensiId: attendanceToday.id }) });
      const result = await response.json();
      if (result.success) {
        toast({ title: "Berhasil", description: "Check out berhasil dicatat." });
        // PERBAIKAN: Panggil ulang fetchAttendanceData untuk me-refresh seluruh halaman
        fetchAttendanceData(user.id);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={user.role} />
      <div className="flex-1 md:ml-64">
        <Navbar user={user} />
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className="text-2xl font-bold">Dashboard Pegawai</h1><p className="text-gray-600">Selamat datang, {user.name}</p></div>
            {user.role === 'ADMIN' && (
                <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
                    <DialogTrigger asChild><Button><UserPlus className="h-4 w-4 mr-2" />Tambah Pegawai</Button></DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Tambah Pegawai Baru</DialogTitle><DialogDescription>Isi detail pegawai untuk membuat akun baru.</DialogDescription></DialogHeader><AddEmployeeForm onFinished={() => setIsAddEmployeeOpen(false)} /></DialogContent>
                </Dialog>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock />Waktu Saat Ini</CardTitle></CardHeader><CardContent className="text-center"><div className="text-4xl font-bold text-blue-600 mb-2">{currentTime.toLocaleTimeString('id-ID')}</div><div className="text-lg text-muted-foreground">{currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div></CardContent></Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle />Status Absensi Hari Ini</CardTitle></CardHeader>
              <CardContent>
                {loading ? <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin inline-block" /></div> : attendanceToday ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between"><span className="font-medium">Check In:</span><span className="text-green-600 font-medium">{formatTime(attendanceToday.checkIn)}</span></div>
                    <div className="flex items-center justify-between"><span className="font-medium">Check Out:</span><span className={attendanceToday.checkOut ? "text-red-600 font-medium" : "text-muted-foreground"}>{formatTime(attendanceToday.checkOut)}</span></div>
                    <div className="flex items-center justify-between"><span className="font-medium">Status:</span><StatusBadge status={attendanceToday.status} /></div>
                    {!attendanceToday.checkOut && (attendanceToday.status === 'PRESENT' || attendanceToday.status === 'LATE') && <Button onClick={handleCheckOut} disabled={isSubmitting} className="w-full"><LogOut className="h-4 w-4 mr-2" />{isSubmitting ? 'Memproses...' : 'Check Out'}</Button>}
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <p className="text-muted-foreground">Anda belum melakukan absensi hari ini.</p>
                    <Button onClick={handleCheckIn} disabled={isSubmitting} className="w-full"><LogIn className="h-4 w-4 mr-2" />{isSubmitting ? 'Memproses...' : 'Check In Sekarang'}</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Hadir Bulan Ini</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.bulanIni}</div><p className="text-xs text-muted-foreground">hari</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Tepat Waktu</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.tepatWaktu}</div><p className="text-xs text-muted-foreground">hari</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Terlambat</CardTitle><Clock className="h-4 w-4 text-orange-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{stats.terlambat}</div><p className="text-xs text-muted-foreground">hari</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Izin/Sakit</CardTitle><User className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.izinSakit}</div><p className="text-xs text-muted-foreground">hari</p></CardContent></Card>
          </div>
          
          <Card>
            <CardHeader><CardTitle>Riwayat Absensi</CardTitle><CardDescription>10 hari kerja terakhir</CardDescription></CardHeader>
            <CardContent>
              {loading ? <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin inline-block" /></div> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Hari</TableHead><TableHead>Jam Masuk</TableHead><TableHead>Jam Keluar</TableHead><TableHead>Status</TableHead><TableHead>Keterangan</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {attendanceHistory.length > 0 ? attendanceHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{new Date(record.date).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>{new Date(record.date).toLocaleDateString('id-ID', { weekday: 'long' })}</TableCell>
                        <TableCell><div className="flex items-center gap-1"><LogIn className="h-4 w-4 text-green-600" /><span>{formatTime(record.checkIn)}</span></div></TableCell>
                        <TableCell><div className="flex items-center gap-1"><LogOut className="h-4 w-4 text-red-600" /><span>{formatTime(record.checkOut)}</span></div></TableCell>
                        <TableCell><StatusBadge status={record.status} /></TableCell>
                        <TableCell><span className="text-sm text-gray-600">{record.notes || '-'}</span></TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={6} className="text-center h-24">Tidak ada riwayat absensi untuk ditampilkan.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
