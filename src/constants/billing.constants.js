export const vatConditions = [
  { value: 1, label: 'IVA Responsable Inscripto' },
  { value: 4, label: 'IVA Sujeto Exento' },
  { value: 5, label: 'Consumidor Final' },
  { value: 6, label: 'Responsable Monotributo' },
  { value: 13, label: 'Monotributista Social' },
  { value: 15, label: 'IVA No Alcanzado' },
  { value: 16, label: 'Monotributo Trabajador Independiente Promovido' }
]

export const vatRates = [
  { value: 3, label: '0%' },
  { value: 9, label: '2,5%' },
  { value: 8, label: '5%' },
  { value: 4, label: '10,5%' },
  { value: 5, label: '21%' },
  { value: 6, label: '27%' }
]

export const taxTreatments = [
  { value: 'taxed', label: 'Gravado' },
  { value: 'exempt', label: 'Exento' },
  { value: 'untaxed', label: 'No gravado' },
  { value: 'not_discriminated', label: 'No discriminado' }
]

export const invoiceTypes = [
  { value: 1, label: 'Factura A' },
  { value: 6, label: 'Factura B' },
  { value: 11, label: 'Factura C' }
]

export const creditNoteTypes = [
  { value: 3, label: 'Nota de crédito A' },
  { value: 8, label: 'Nota de crédito B' },
  { value: 13, label: 'Nota de crédito C' }
]
