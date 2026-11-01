export const accountTypes = [
  { label: 'Activo', value: 'ASSET' },
  { label: 'Pasivo', value: 'LIABILITY' },
  { label: 'Patrimonio neto', value: 'EQUITY' },
  { label: 'Ingresos', value: 'REVENUE' },
  { label: 'Gastos', value: 'EXPENSE' }
]

export const journalEntryStatuses = [
  { label: 'Borrador', value: 'DRAFT' },
  { label: 'Publicado', value: 'POSTED' },
  { label: 'Revertido', value: 'REVERSED' }
]

export const journalEntrySources = [
  { label: 'Manual', value: 'MANUAL' },
  { label: 'Factura', value: 'INVOICE' },
  { label: 'Pago', value: 'PAYMENT' },
  { label: 'Importación', value: 'IMPORT' }
]