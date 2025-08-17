"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, Edit, User, Calendar, Stethoscope, FileText, Briefcase, Phone, Mail, 
  HeartPulse, Shield, Home, Info, ShieldAlert, BookUser, Pill, Loader2, Users, Droplets
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Tipe data untuk Detail Pasien Lengkap
interface PatientDetails {
  id: string;
  noRekamMedis: string;
  name: string;
  nik: string | null;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  tempatLahir: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  pekerjaan: string | null;
  statusPerkawinan: string | null;
  agama: string | null;
  jenisAsuransi: string | null;
  noAsuransi: string | null;
  bloodType: string | null;
  allergies: string | null;
  emergencyContact: string | null;
}

// Tipe data untuk Riwayat Rekam Medis Lengkap
interface MedicalHistory {
  id: string;
  createdAt: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  hubunganKeluarga: string | null;
  statusPsikologis: any;
  skriningGizi: any;
  asesmenNyeri: any;
  risikoJatuh: string | null;
  doctor: { name: string };
  visit: { vitalSigns: any; };
  prescriptions: {
    items: {
      id: string;
      quantity: number;
      dosage: string;
      medicine: { name: string; unit: string; };
    }[];
  }[];
}

export default function DetailPasienPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  const [user, setUser] = useState<any>(null)
  const [patient, setPatient] = useState<PatientDetails | null>(null)
  const [history, setHistory] = useState<MedicalHistory[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [patientRes, historyRes] = await Promise.all([
        fetch(`/api/pasien/${id}`),
        fetch(`/api/pasien/${id}/rekam-medis`)
      ]);

      const patientResult = await patientRes.json();
      const historyResult = await historyRes.json();

      if (patientResult.success) {
        setPatient(patientResult.data);
      } else {
        toast({ title: "Error", description: "Gagal memuat data pasien.", variant: "destructive" });
        router.push('/pasien');
      }

      if (historyResult.success) {
        setHistory(historyResult.data);
      } else {
        toast({ title: "Error", description: "Gagal memuat riwayat rekam medis.", variant: "destructive" });
      }

    } catch (error) {
      toast({ title: "Error", description: "Gagal terhubung ke server.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [id, router, toast])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
    if (id) fetchData()
  }, [id, fetchData])

  const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined | null }) => (
    <div className="flex items-start space-x-3 rounded-lg p-3 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <div className="flex-shrink-0 text-gray-500 mt-1">{icon}</div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value || '-'}</p>
      </div>
    </div>
  )
  
  const renderJsonDetails = (data: any, title: string) => {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) return null;
    const entries = Object.entries(data).filter(([_, value]) => value === true || (typeof value === 'string' && value.length > 0));
    if (entries.length === 0) return null;

    return (
      <div>
        <h5 className="font-semibold text-sm mt-3">{title}</h5>
        <ul className="list-disc list-inside text-sm text-gray-600 pl-2">
          {entries.map(([key, value]) => (
            <li key={key}>{key.replace(/([A-Z])/g, ' $1').trim()}: {String(value === true ? 'Ya' : value)}</li>
          ))}
        </ul>
      </div>
    );
  };

  if (loading) return (
     <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role={user?.role} />
        <div className="flex-1 md:ml-64 p-6">
            <div className="flex items-center justify-between mb-6"><div><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-48 mt-2" /></div><div className="flex gap-2"><Skeleton className="h-10 w-24" /><Skeleton className="h-10 w-24" /></div></div>
            <Skeleton className="h-64 w-full mb-6" />
            <Skeleton className="h-80 w-full" />
        </div>
    </div>
  )
  if (!patient) return <div className="flex h-screen items-center justify-center">Pasien tidak ditemukan.</div>

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={user?.role} />
      <div className="flex-1 md:ml-64">
        <Navbar user={user} />
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{patient.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">No. Rekam Medis: <span className="font-semibold text-blue-600">{patient.noRekamMedis}</span></p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/pasien')}><ArrowLeft className="h-4 w-4 mr-2" />Kembali</Button>
              <Link href={`/pasien/${id}/edit`}><Button><Edit className="h-4 w-4 mr-2" />Edit Data</Button></Link>
            </div>
          </div>

          {/* BAGIAN 1: DATA PASIEN LENGKAP */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User />Informasi Detail Pasien</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
              <DetailItem icon={<Info size={18} />} label="Nama Lengkap" value={patient.name} />
              <DetailItem icon={<BookUser size={18} />} label="NIK" value={patient.nik} />
              <DetailItem icon={<HeartPulse size={18} />} label="Gender" value={patient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'} />
              <DetailItem icon={<Calendar size={18} />} label="Tempat, Tgl Lahir" value={`${patient.tempatLahir}, ${new Date(patient.birthDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`} />
              <DetailItem icon={<Droplets size={18} />} label="Golongan Darah" value={patient.bloodType} />
              <DetailItem icon={<Users size={18} />} label="Status Perkawinan" value={patient.statusPerkawinan?.replace('_', ' ')} />
              <DetailItem icon={<Briefcase size={18} />} label="Pekerjaan" value={patient.pekerjaan} />
              <DetailItem icon={<Phone size={18} />} label="No. Telepon" value={patient.phone} />
              <DetailItem icon={<Mail size={18} />} label="Email" value={patient.email} />
              <DetailItem icon={<Home size={18} />} label="Alamat" value={patient.address} />
              <DetailItem icon={<Shield size={18} />} label="Jenis Asuransi" value={patient.jenisAsuransi} />
              <DetailItem icon={<ShieldAlert size={18} />} label="Riwayat Alergi" value={patient.allergies} />
            </CardContent>
          </Card>
          
          {/* BAGIAN 2: RIWAYAT MEDIS LENGKAP */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText />Riwayat Rekam Medis Lengkap</CardTitle></CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {history.map((record) => (
                    <AccordionItem value={record.id} key={record.id}>
                      <AccordionTrigger>
                        <div className="flex justify-between w-full pr-4">
                          <span className="font-semibold">{new Date(record.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
                          <span className="text-gray-500">dr. {record.doctor.name}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                        {/* Pengkajian Awal */}
                        <div>
                            <h4 className="font-semibold text-md mb-2">Pengkajian Awal</h4>
                            <div className="text-sm space-y-2 pl-4 border-l-2 ml-2">
                                <p><strong>Hubungan Keluarga:</strong> {record.hubunganKeluarga || '-'}</p>
                                {renderJsonDetails(record.statusPsikologis, "Status Psikologis")}
                                {renderJsonDetails(record.skriningGizi, "Skrining Gizi")}
                            </div>
                        </div>
                        {/* Tanda Vital & Nyeri */}
                        <div>
                            <h4 className="font-semibold text-md mb-2">Tanda Vital & Asesmen Nyeri</h4>
                            <div className="text-sm space-y-2 pl-4 border-l-2 ml-2">
                                <p><strong>Tanda Vital:</strong> Suhu: {record.visit?.vitalSigns?.suhu || '-'}°C, Nadi: {record.visit?.vitalSigns?.nadi || '-'}x/m, TD: {record.visit?.vitalSigns?.tekananDarah || '-'}mmHg</p>
                                <p><strong>Asesmen Nyeri:</strong> Tingkat {record.asesmenNyeri?.tingkat || '-'} ({record.asesmenNyeri?.skala || '-'})</p>
                                <p><strong>Risiko Jatuh:</strong> {record.risikoJatuh || '-'}</p>
                            </div>
                        </div>
                        {/* SOAP */}
                        <div>
                            <h4 className="font-semibold text-md mb-2 flex items-center gap-2"><Stethoscope size={16}/>Pemeriksaan (SOAP)</h4>
                            <div className="text-sm space-y-2 pl-4 border-l-2 ml-2">
                                <p><strong>Subjective:</strong> {record.subjective || '-'}</p>
                                <p><strong>Objective:</strong> {record.objective || '-'}</p>
                                <p><strong>Assessment:</strong> {record.assessment || '-'}</p>
                                <p><strong>Plan:</strong> {record.plan || '-'}</p>
                            </div>
                        </div>
                        {/* Resep Obat */}
                        {record.prescriptions && record.prescriptions.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-md mb-2 flex items-center gap-2"><Pill size={16}/>Resep Obat</h4>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Nama Obat</TableHead><TableHead>Jumlah</TableHead><TableHead>Aturan Pakai</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {record.prescriptions[0].items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.medicine.name}</TableCell>
                                                <TableCell>{item.quantity} {item.medicine.unit}</TableCell>
                                                <TableCell>{item.dosage}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center text-gray-500 py-10">Belum ada riwayat rekam medis untuk pasien ini.</div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
