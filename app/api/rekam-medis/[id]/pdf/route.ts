import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Menghasilkan halaman HTML untuk dicetak sebagai PDF
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 1. Ambil data rekam medis lengkap, termasuk data resep obat
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { select: { name: true } },
        visit: true, // Ambil juga data kunjungan untuk info Tanda Vital
        prescriptions: { // Mengambil data resep terkait
          include: {
            items: {
              include: {
                medicine: {
                  select: { name: true, unit: true }
                }
              }
            }
          }
        }
      },
    });

    if (!medicalRecord) {
      return new NextResponse('Rekam medis tidak ditemukan', { status: 404 });
    }

    // Helper function untuk merender data JSON menjadi daftar HTML
    const renderJsonData = (data: any) => {
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
            return '<p>-</p>';
        }
        return `<ul>${Object.entries(data)
            .filter(([key, value]) => value === true || (typeof value === 'string' && value.length > 0))
            .map(([key, value]) => `<li><strong>${key.replace(/([A-Z])/g, ' $1').trim()}:</strong> ${value === true ? 'Ya' : value}</li>`)
            .join('')}</ul>`;
    };

    // Helper function untuk merender tabel resep obat
    const renderPrescriptionData = (prescriptions: any[]) => {
      if (!prescriptions || prescriptions.length === 0) {
        return '<p>Tidak ada resep obat yang diberikan.</p>';
      }
      
      let html = '<table><thead><tr><th>Nama Obat</th><th>Jumlah</th><th>Aturan Pakai</th></tr></thead><tbody>';
      
      prescriptions.forEach(prescription => {
        prescription.items.forEach((item: any) => {
          html += `
            <tr>
              <td>${item.medicine.name}</td>
              <td>${item.quantity} ${item.medicine.unit}</td>
              <td>${item.dosage || '-'}</td>
            </tr>
          `;
        });
      });

      html += '</tbody></table>';
      return html;
    };

    // 2. Buat struktur HTML dari data yang telah diambil
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rekam Medis - ${medicalRecord.patient.name}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 1rem; 
            color: #333; 
          }
          .container { 
            max-width: 800px; 
            margin: auto; 
            border: 1px solid #ddd; 
            padding: 2rem; 
            border-radius: 8px; 
          }
          h1, h2, h3 { 
            color: #2c3e50; 
            border-bottom: 2px solid #3498db; 
            padding-bottom: 10px; 
            margin-top: 1.5rem;
          }
          h1 { text-align: center; margin-bottom: 2rem; }
          .section { margin-bottom: 1.5rem; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          .grid-item strong { 
            display: block; 
            color: #555; 
            font-size: 0.9rem; 
            margin-bottom: 4px; 
          }
          .grid-item p { margin: 0; font-size: 1rem; }
          .soap-section { margin-top: 1rem; padding-left: 1rem; border-left: 3px solid #ecf0f1; }
          .soap-section strong { color: #3498db; }
          .footer { text-align: right; margin-top: 3rem; font-style: italic; color: #777; font-size: 0.8rem; }
          ul { padding-left: 20px; margin: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          @media print {
            body { padding: 0; }
            .container { box-shadow: none; border: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Rekam Medis Rawat Jalan</h1>

          <h2>Informasi Pasien</h2>
          <div class="section grid">
            <div class="grid-item"><strong>Nama Pasien:</strong> <p>${medicalRecord.patient.name}</p></div>
            <div class="grid-item"><strong>No. Rekam Medis:</strong> <p>${medicalRecord.noRekamMedis}</p></div>
            <div class="grid-item"><strong>Tanggal Lahir:</strong> <p>${new Date(medicalRecord.patient.birthDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p></div>
            <div class="grid-item"><strong>Jenis Kelamin:</strong> <p>${medicalRecord.patient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</p></div>
          </div>

          <h2>Detail Pemeriksaan</h2>
          <div class="section grid">
             <div class="grid-item"><strong>Dokter Pemeriksa:</strong> <p>${medicalRecord.doctor.name}</p></div>
             <div class="grid-item"><strong>Tanggal Periksa:</strong> <p>${new Date(medicalRecord.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p></div>
             <div class="grid-item"><strong>Klinik Tujuan:</strong> <p>${medicalRecord.visit?.klinikTujuan || '-'}</p></div>
          </div>
          
          <div class="section">
            <h3>Tanda Vital</h3>
            <p>
              Suhu: <strong>${(medicalRecord.visit?.vitalSigns as any)?.suhu || '-'} °C</strong> | 
              Nadi: <strong>${(medicalRecord.visit?.vitalSigns as any)?.nadi || '-'} x/mnt</strong> | 
              Respirasi: <strong>${(medicalRecord.visit?.vitalSigns as any)?.respirasi || '-'} x/mnt</strong> | 
              Tekanan Darah: <strong>${(medicalRecord.visit?.vitalSigns as any)?.tekananDarah || '-'} mmHg</strong>
            </p>
          </div>

          <h2>Pengkajian Lanjutan</h2>
          <div class="section grid">
            <div class="grid-item"><strong>Hubungan Keluarga:</strong> <p>${medicalRecord.hubunganKeluarga || '-'}</p></div>
            <div class="grid-item"><strong>Risiko Jatuh:</strong> <p>${medicalRecord.risikoJatuh || '-'}</p></div>
            <div class="grid-item"><strong>Status Psikologis:</strong> ${renderJsonData(medicalRecord.statusPsikologis)}</div>
            <div class="grid-item"><strong>Skrining Gizi:</strong> ${renderJsonData(medicalRecord.skriningGizi)}</div>
          </div>

          <h2>Catatan SOAP</h2>
          <div class="section">
            <div class="soap-section">
              <strong>S (Subjective):</strong>
              <p>${medicalRecord.subjective || 'Tidak ada data.'}</p>
            </div>
            <div class="soap-section">
              <strong>O (Objective):</strong>
              <p>${medicalRecord.objective || 'Tidak ada data.'}</p>
            </div>
            <div class="soap-section">
              <strong>A (Assessment / Diagnosis):</strong>
              <p>${medicalRecord.assessment || 'Tidak ada data.'}</p>
            </div>
            <div class="soap-section">
              <strong>P (Plan / Perawatan):</strong>
              <p>${medicalRecord.plan || 'Tidak ada data.'}</p>
            </div>
          </div>

          <h2>Resep Obat</h2>
          <div class="section">
            ${renderPrescriptionData(medicalRecord.prescriptions)}
          </div>

          <div class="footer">
            <p>Dokumen ini dibuat secara otomatis oleh Sistem Informasi Klinik.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 3. Kembalikan HTML sebagai respons untuk dicetak
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return new NextResponse('Gagal membuat dokumen rekam medis', { status: 500 });
  }
}
