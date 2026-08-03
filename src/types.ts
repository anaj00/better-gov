export type Status = 'New' | 'Completed'

export type ProcessId = 'bir-registration' | 'business-permit'

export type RequestRecord = {
  serialCode: string
  processId: ProcessId
  processName: string
  agency: string
  businessName: string
  applicantName: string
  email: string
  contactNumber: string
  region: string
  city: string
  barangay: string
  address: string
  dateSubmitted: string
  status: Status
  approvalDate: string
  requesterNote: string
  internalNotes: string
  lastUpdated: string
  registrationType?: string
  taxpayerType?: string
  businessType: string
  lineOfBusiness?: string
  registrationNumber?: string
}

export type ProcessCatalogItem = {
  id: string
  name: string
  agencyName: string
  category: string
  governmentLevel: 'national' | 'local'
  isRequestableInDemo: boolean
}

export type Geography = 'Philippines' | 'National Capital Region' | 'Quezon City' | 'Greater Lagro'
