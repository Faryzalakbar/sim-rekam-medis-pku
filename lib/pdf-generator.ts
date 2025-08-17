import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface RekamMedisData {
  pasien: {
    noRekamMedis: string
    namaLengkap: string
    tanggalLahir: string
    jenisKelamin: string
    alamatLengkap: string
    noTelepon: string
  }
  kunjungan: {
    tanggal: string
    klinikTujuan: string
    alasanKunjungan: string
    keluhan: string
  }
  rekamMedis: {
    subjective: string
    objective: string
    assessment: string
    plan: string
    suhu: number
    nadi: number
    respirasi: number
    tekananDarah: string
    tinggiBadan: number
    beratBadan: number
  }
  dokter: {
    name: string
  }
}

export class PDFGenerator {
  private doc: jsPDF

  constructor() {
    this.doc = new jsPDF()
  }

  generateRekamMedisPDF(data: RekamMedisData): Uint8Array {
    // Header
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('KLINIK PKU MUHAMMADIYAH KERTOSONO', 105, 20, { align: 'center' })
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Jl. Raya Lengkong No. 68, Lambangkuning, Kertosono, Nganjuk 64316', 105, 28, { align: 'center' })
    this.doc.text('Phone: (0358) 551461 Hp: 085230233687', 105, 34, { align: 'center' })
    this.doc.text('Email: kripkumuhammadiyahkts@gmail.com', 105, 40, { align: 'center' })

    // Line separator
    this.doc.line(20, 45, 190, 45)

    // Title
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('REKAM MEDIS RAWAT JALAN', 105, 55, { align: 'center' })

    // Patient Info
    let yPos = 70
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    
    this.doc.text(`No. RM: ${data.pasien.noRekamMedis}`, 20, yPos)
    this.doc.text(`Tanggal: ${new Date(data.kunjungan.tanggal).toLocaleDateString('id-ID')}`, 140, yPos)
    
    yPos += 8
    this.doc.text(`Nama: ${data.pasien.namaLengkap}`, 20, yPos)
    this.doc.text(`Klinik: ${data.kunjungan.klinikTujuan}`, 140, yPos)
    
    yPos += 8
    this.doc.text(`Jenis Kelamin: ${data.pasien.jenisKelamin}`, 20, yPos)
    this.doc.text(`Dokter: ${data.dokter.name}`, 140, yPos)
    
    yPos += 8
    this.doc.text(`Tanggal Lahir: ${new Date(data.pasien.tanggalLahir).toLocaleDateString('id-ID')}`, 20, yPos)
    
    yPos += 8
    this.doc.text(`Alamat: ${data.pasien.alamatLengkap}`, 20, yPos)
    
    yPos += 8
    this.doc.text(`Telepon: ${data.pasien.noTelepon}`, 20, yPos)

    // Vital Signs
    yPos += 15
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('TANDA VITAL:', 20, yPos)
    
    yPos += 8
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`Suhu: ${data.rekamMedis.suhu}°C`, 20, yPos)
    this.doc.text(`Nadi: ${data.rekamMedis.nadi} x/mnt`, 70, yPos)
    this.doc.text(`Respirasi: ${data.rekamMedis.respirasi} x/mnt`, 120, yPos)
    
    yPos += 8
    this.doc.text(`Tekanan Darah: ${data.rekamMedis.tekananDarah} mmHg`, 20, yPos)
    this.doc.text(`TB: ${data.rekamMedis.tinggiBadan} cm`, 120, yPos)
    this.doc.text(`BB: ${data.rekamMedis.beratBadan} kg`, 160, yPos)

    // SOAP Notes
    yPos += 15
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('SOAP NOTES:', 20, yPos)

    // Subjective
    yPos += 10
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('S (Subjective):', 20, yPos)
    yPos += 6
    this.doc.setFont('helvetica', 'normal')
    const subjectiveLines = this.doc.splitTextToSize(data.rekamMedis.subjective || data.kunjungan.keluhan, 170)
    this.doc.text(subjectiveLines, 20, yPos)
    yPos += subjectiveLines.length * 5

    // Objective
    yPos += 5
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('O (Objective):', 20, yPos)
    yPos += 6
    this.doc.setFont('helvetica', 'normal')
    const objectiveLines = this.doc.splitTextToSize(data.rekamMedis.objective || '-', 170)
    this.doc.text(objectiveLines, 20, yPos)
    yPos += objectiveLines.length * 5

    // Assessment
    yPos += 5
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('A (Assessment):', 20, yPos)
    yPos += 6
    this.doc.setFont('helvetica', 'normal')
    const assessmentLines = this.doc.splitTextToSize(data.rekamMedis.assessment || '-', 170)
    this.doc.text(assessmentLines, 20, yPos)
    yPos += assessmentLines.length * 5

    // Plan
    yPos += 5
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('P (Plan):', 20, yPos)
    yPos += 6
    this.doc.setFont('helvetica', 'normal')
    const planLines = this.doc.splitTextToSize(data.rekamMedis.plan || '-', 170)
    this.doc.text(planLines, 20, yPos)
    yPos += planLines.length * 5

    // Footer
    yPos += 20
    this.doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 20, yPos)
    
    // Signature area
    yPos += 15
    this.doc.text('Dokter Pemeriksa,', 140, yPos)
    yPos += 20
    this.doc.text(`(${data.dokter.name})`, 140, yPos)

    return this.doc.output('arraybuffer') as Uint8Array
  }

  generateLaporanKunjunganPDF(data: any[]): Uint8Array {
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('LAPORAN KUNJUNGAN PASIEN', 105, 20, { align: 'center' })
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`Periode: ${new Date().toLocaleDateString('id-ID')}`, 105, 30, { align: 'center' })

    // Table
    const tableData = data.map(item => [
      item.tanggal,
      item.noRekamMedis,
      item.namaLengkap,
      item.klinikTujuan,
      item.dokter,
      item.status
    ])

    ;(this.doc as any).autoTable({
      head: [['Tanggal', 'No. RM', 'Nama Pasien', 'Klinik', 'Dokter', 'Status']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    })

    return this.doc.output('arraybuffer') as Uint8Array
  }
}

export const pdfGenerator = new PDFGenerator()
