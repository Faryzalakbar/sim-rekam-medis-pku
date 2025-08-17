"use client"

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Loader2, UserPlus, Edit, Trash2, AlertTriangle, Building, Users, Upload, FileText, Download } from 'lucide-react'
import { Role } from '@prisma/client'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import * as XLSX from 'xlsx' // Library untuk membaca dan menulis file Excel

// --- DEFINISI TIPE DATA ---
interface LoggedInUser {
  id: string;
  name: string;
  role: Role;
}
interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

// --- KOMPONEN FORM PEGAWAI ---
const EmployeeForm = ({ employee, onFinished }: { employee: Partial<Employee> | null, onFinished: () => void }) => {
    const [formData, setFormData] = useState({
        name: employee?.name || '',
        email: employee?.email || '',
        password: '',
        role: employee?.role || ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const isEditing = !!employee?.id;

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.role || (!isEditing && !formData.password)) {
            toast({ title: "Error", description: "Semua field wajib diisi (password wajib untuk user baru).", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            const url = isEditing ? `/api/pegawai/${employee.id}` : '/api/pegawai';
            const method = isEditing ? 'PUT' : 'POST';
            
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            const result = await response.json();

            if (result.success) {
                toast({ title: "Berhasil", description: `Pegawai berhasil ${isEditing ? 'diperbarui' : 'ditambahkan'}.` });
                onFinished();
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
      <>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nama</Label><Input id="name" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="email" className="text-right">Email</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(p => ({...p, email: e.target.value}))} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="password" className="text-right">Password</Label><Input id="password" type="password" placeholder={isEditing ? 'Kosongkan jika tidak diubah' : 'Wajib diisi'} onChange={(e) => setFormData(p => ({...p, password: e.target.value}))} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="role" className="text-right">Role</Label><Select value={formData.role} onValueChange={(v) => setFormData(p => ({...p, role: v as Role}))}><SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih role" /></SelectTrigger><SelectContent><SelectItem value="DOKTER">Dokter</SelectItem><SelectItem value="APOTIK">Apoteker</SelectItem><SelectItem value="PEGAWAI">Pegawai</SelectItem></SelectContent></Select></div>
        </div>
        <DialogFooter><Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</Button></DialogFooter>
      </>
    );
};

export default function SettingsPage() {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogState, setDialogState] = useState<{ open: boolean, mode: 'add' | 'edit' | 'delete', data: Employee | null }>({ open: false, mode: 'add', data: null });
  
  const [selectedFile, setSelectedFile] = useState<{ file: File, type: 'pasien' | 'obat' } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const { toast } = useToast();

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pegawai');
      const result = await response.json();
      if (result.success) setEmployees(result.data);
      else throw new Error(result.error);
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
      if (parsedUser.role === 'ADMIN') fetchEmployees();
    }
  }, [fetchEmployees]);

  const handleDelete = async () => {
    if (!dialogState.data) return;
    try {
        const response = await fetch(`/api/pegawai/${dialogState.data.id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            toast({ title: "Berhasil", description: "Pegawai berhasil dihapus." });
            closeDialog();
            fetchEmployees();
        } else {
            throw new Error(result.error);
        }
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const openDialog = (mode: 'add' | 'edit' | 'delete', data: Employee | null = null) => setDialogState({ open: true, mode, data });
  const closeDialog = () => setDialogState({ open: false, mode: 'add', data: null });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'pasien' | 'obat') => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile({ file: event.target.files[0], type: type });
    }
  };

  const handleUpload = (type: 'pasien' | 'obat') => {
    if (!selectedFile || selectedFile.type !== type) {
      toast({ title: "Peringatan", description: `Silakan pilih file untuk ${type} terlebih dahulu.`, variant: "destructive" });
      return;
    }
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const response = await fetch(`/api/${type}/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
        });
        const result = await response.json();

        if (result.success) {
            toast({ title: "Berhasil!", description: result.message });
        } else {
            throw new Error(result.error || `Gagal mengimpor data ${type}.`);
        }
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
        const fileInputPasien = document.getElementById('pasien-file-upload') as HTMLInputElement;
        if(fileInputPasien) fileInputPasien.value = '';
        const fileInputObat = document.getElementById('obat-file-upload') as HTMLInputElement;
        if(fileInputObat) fileInputObat.value = '';
      }
    };
    reader.readAsBinaryString(selectedFile.file);
  };
  
  const handleExport = async (dataType: 'pasien' | 'obat') => {
    setIsExporting(true);
    toast({ title: "Memulai Ekspor", description: `Mengambil semua data ${dataType}...` });
    try {
      const response = await fetch(`/api/${dataType}?export=true`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || `Gagal mengambil data ${dataType}.`);
      }
      
      const dataToExport = result.data;
      if (dataToExport.length === 0) {
        toast({ title: "Info", description: `Tidak ada data ${dataType} untuk diekspor.` });
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`);
      const fileName = `data_${dataType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast({ title: "Berhasil!", description: `Data ${dataType} telah diekspor ke ${fileName}.` });

    } catch (error: any) {
      toast({ title: "Error", description: `Gagal mengekspor data. Error: ${error.message}`, variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (user.role !== 'ADMIN') return <div className="flex h-screen items-center justify-center"><p>Hanya Admin yang dapat mengakses halaman ini.</p></div>;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={user.role} />
      <div className="flex-1 md:ml-64">
        <Navbar user={user} />
        <main className="p-6 space-y-6">
          <div><h1 className="text-2xl font-bold">Pengaturan</h1><p className="text-gray-600">Kelola pengaturan sistem dan data.</p></div>
          <Tabs defaultValue="pegawai">
            <TabsList>
                <TabsTrigger value="pegawai"><Users className="h-4 w-4 mr-2" />Manajemen Pegawai</TabsTrigger>
                <TabsTrigger value="impor-ekspor"><FileText className="h-4 w-4 mr-2" />Impor & Ekspor</TabsTrigger>
                <TabsTrigger value="klinik" disabled><Building className="h-4 w-4 mr-2" />Profil Klinik</TabsTrigger>
            </TabsList>
            <TabsContent value="pegawai">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div><CardTitle>Daftar Pegawai</CardTitle><CardDescription>Tambah, edit, atau hapus data pegawai.</CardDescription></div>
                    <Button onClick={() => openDialog('add')}><UserPlus className="h-4 w-4 mr-2" />Tambah Pegawai</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Tanggal Dibuat</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {loading ? <TableRow><TableCell colSpan={5} className="text-center h-40"><Loader2 className="h-6 w-6 animate-spin" /></TableCell></TableRow> : employees.map(emp => (
                        <TableRow key={emp.id}>
                          <TableCell className="font-medium">{emp.name}</TableCell>
                          <TableCell>{emp.email}</TableCell>
                          <TableCell><Badge variant="secondary">{emp.role}</Badge></TableCell>
                          <TableCell>{new Date(emp.createdAt).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="icon" onClick={() => openDialog('edit', emp)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="destructive" size="icon" onClick={() => openDialog('delete', emp)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="impor-ekspor">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Upload /> Impor Data</CardTitle>
                            <CardDescription>Unggah data dari file Excel (.xlsx). Pastikan nama kolom di file sesuai dengan format database.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2 p-4 border rounded-lg">
                                <Label htmlFor="pasien-file-upload" className="font-semibold">Impor Data Pasien</Label>
                                <Input id="pasien-file-upload" type="file" onChange={(e) => handleFileChange(e, 'pasien')} accept=".xlsx, .xls" />
                                {selectedFile?.type === 'pasien' && <p className="text-sm text-gray-500 mt-2">File: {selectedFile.file.name}</p>}
                                <Button onClick={() => handleUpload('pasien')} disabled={isUploading || selectedFile?.type !== 'pasien'}>
                                    {isUploading && selectedFile?.type === 'pasien' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mengunggah...</> : 'Unggah Pasien'}
                                </Button>
                            </div>
                            <div className="space-y-2 p-4 border rounded-lg">
                                <Label htmlFor="obat-file-upload" className="font-semibold">Impor Data Obat</Label>
                                <Input id="obat-file-upload" type="file" onChange={(e) => handleFileChange(e, 'obat')} accept=".xlsx, .xls" />
                                {selectedFile?.type === 'obat' && <p className="text-sm text-gray-500 mt-2">File: {selectedFile.file.name}</p>}
                                <Button onClick={() => handleUpload('obat')} disabled={isUploading || selectedFile?.type !== 'obat'}>
                                    {isUploading && selectedFile?.type === 'obat' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mengunggah...</> : 'Unggah Obat'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Download /> Ekspor Data</CardTitle>
                            <CardDescription>Unduh data sistem ke dalam format Excel.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-md">
                                <p className="font-medium">Data Pasien</p>
                                <Button variant="outline" onClick={() => handleExport('pasien')} disabled={isExporting}>
                                    {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ekspor'}
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-md">
                                <p className="font-medium">Data Obat</p>
                                <Button variant="outline" onClick={() => handleExport('obat')} disabled={isExporting}>
                                    {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ekspor'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
          </Tabs>

          <Dialog open={dialogState.open} onOpenChange={closeDialog}>
            <DialogContent>
              {dialogState.mode === 'add' && (<><DialogHeader><DialogTitle>Tambah Pegawai Baru</DialogTitle><DialogDescription>Isi detail untuk membuat akun baru.</DialogDescription></DialogHeader><EmployeeForm employee={null} onFinished={() => { closeDialog(); fetchEmployees(); }} /></>)}
              {dialogState.mode === 'edit' && (<><DialogHeader><DialogTitle>Edit Data Pegawai</DialogTitle><DialogDescription>Ubah detail untuk {dialogState.data?.name}.</DialogDescription></DialogHeader><EmployeeForm employee={dialogState.data} onFinished={() => { closeDialog(); fetchEmployees(); }} /></>)}
              {dialogState.mode === 'delete' && (<><DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-red-500" />Konfirmasi Hapus</DialogTitle><DialogDescription>Apakah Anda yakin ingin menghapus pegawai bernama <strong>{dialogState.data?.name}</strong>? Tindakan ini tidak dapat dibatalkan.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={closeDialog}>Batal</Button><Button variant="destructive" onClick={handleDelete}>Ya, Hapus</Button></DialogFooter></>)}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
