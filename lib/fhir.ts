interface FHIRPatient {
  resourceType: 'Patient'
  id: string
  identifier: Array<{
    use: string
    value: string
  }>
  name: Array<{
    use: string
    family: string
    given: string[]
  }>
  telecom: Array<{
    system: string
    value: string
    use: string
  }>
  gender: 'male' | 'female' | 'other' | 'unknown'
  birthDate: string
  address: Array<{
    use: string
    text: string
  }>
}

interface FHIRObservation {
  resourceType: 'Observation'
  id: string
  status: 'registered' | 'preliminary' | 'final' | 'amended'
  category: Array<{
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }>
  code: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  subject: {
    reference: string
  }
  effectiveDateTime: string
  valueQuantity?: {
    value: number
    unit: string
    system: string
    code: string
  }
  valueString?: string
}

export class FHIRConverter {
  static convertPatientToFHIR(pasien: any): FHIRPatient {
    return {
      resourceType: 'Patient',
      id: pasien.id,
      identifier: [
        {
          use: 'usual',
          value: pasien.noRekamMedis
        }
      ],
      name: [
        {
          use: 'official',
          family: pasien.namaLengkap.split(' ').pop() || '',
          given: pasien.namaLengkap.split(' ').slice(0, -1)
        }
      ],
      telecom: [
        {
          system: 'phone',
          value: pasien.noTelepon,
          use: 'mobile'
        }
      ],
      gender: pasien.jenisKelamin === 'LAKI_LAKI' ? 'male' : 'female',
      birthDate: pasien.tanggalLahir.toISOString().split('T')[0],
      address: [
        {
          use: 'home',
          text: pasien.alamatLengkap
        }
      ]
    }
  }

  static convertVitalSignsToFHIR(rekamMedis: any): FHIRObservation[] {
    const observations: FHIRObservation[] = []

    // Temperature
    if (rekamMedis.suhu) {
      observations.push({
        resourceType: 'Observation',
        id: `${rekamMedis.id}-temperature`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8310-5',
              display: 'Body temperature'
            }
          ]
        },
        subject: {
          reference: `Patient/${rekamMedis.pasienId}`
        },
        effectiveDateTime: rekamMedis.createdAt.toISOString(),
        valueQuantity: {
          value: rekamMedis.suhu,
          unit: 'Cel',
          system: 'http://unitsofmeasure.org',
          code: 'Cel'
        }
      })
    }

    // Heart Rate
    if (rekamMedis.nadi) {
      observations.push({
        resourceType: 'Observation',
        id: `${rekamMedis.id}-heart-rate`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8867-4',
              display: 'Heart rate'
            }
          ]
        },
        subject: {
          reference: `Patient/${rekamMedis.pasienId}`
        },
        effectiveDateTime: rekamMedis.createdAt.toISOString(),
        valueQuantity: {
          value: rekamMedis.nadi,
          unit: '/min',
          system: 'http://unitsofmeasure.org',
          code: '/min'
        }
      })
    }

    // Blood Pressure
    if (rekamMedis.tekananDarah) {
      observations.push({
        resourceType: 'Observation',
        id: `${rekamMedis.id}-blood-pressure`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '85354-9',
              display: 'Blood pressure panel with all children optional'
            }
          ]
        },
        subject: {
          reference: `Patient/${rekamMedis.pasienId}`
        },
        effectiveDateTime: rekamMedis.createdAt.toISOString(),
        valueString: rekamMedis.tekananDarah
      })
    }

    return observations
  }

  static exportToFHIRBundle(pasien: any, rekamMedis: any[]) {
    const patient = this.convertPatientToFHIR(pasien)
    const observations = rekamMedis.flatMap(rm => this.convertVitalSignsToFHIR(rm))

    return {
      resourceType: 'Bundle',
      id: `patient-${pasien.id}-bundle`,
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: patient
        },
        ...observations.map(obs => ({
          resource: obs
        }))
      ]
    }
  }
}
