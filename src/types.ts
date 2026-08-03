export type Status = "New" | "Completed" | "Rejected";

export type ProcessId =
  | "bir-registration"
  | "bir-certificate-registration"
  | "bir-authority-print"
  | "bir-books-accounts"
  | "bir-branch-registration"
  | "bir-registration-update"
  | "bir-tax-clearance"
  | "bir-business-closure"
  | "bir-accounting-system"
  | "business-permit";

export type RequestRecord = {
  serialCode: string;
  processId: ProcessId;
  processName: string;
  agency: string;
  businessName?: string;
  applicantName?: string;
  email?: string;
  contactNumber?: string;
  region?: string;
  city?: string;
  barangay?: string;
  address?: string;
  dateSubmitted: string;
  status: Status;
  requesterNote?: string;
  internalNotes?: string;
  lastUpdated: string;
  registrationType?: string;
  taxpayerType?: string;
  businessType?: string;
  lineOfBusiness?: string;
  registrationNumber?: string;
};

export type ProcessCatalogItem = {
  id: string;
  name: string;
  agencyName: string;
  category: string;
  governmentLevel: "national" | "local";
  isRequestable: boolean;
};

export type Geography =
  | "Philippines"
  | "National Capital Region"
  | "Quezon City"
  | "Greater Lagro";

export type RegionStat = {
  region: string;
  total: number;
  completed: number;
  newRequests: number;
  overdue: number;
  avgDays: number;
  onTimePct: number;
};

export type TimeWindow = "all" | "30d";

export type DrillLocation = {
  region?: string;
  city?: string;
  barangay?: string;
};
