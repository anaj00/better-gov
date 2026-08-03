import type {
  Geography,
  ProcessCatalogItem,
  ProcessId,
  RequestRecord,
} from "./types";

export const activeProcesses: Record<
  ProcessId,
  { name: string; agency: string; estimate: string; icon: string }
> = {
  "bir-registration": {
    name: "BIR Registration",
    agency: "Bureau of Internal Revenue",
    estimate: "5-10 business days",
    icon: "BIR",
  },
  "business-permit": {
    name: "New Business Permit",
    agency: "Quezon City Business Permits and Licensing Department",
    estimate: "3-7 business days",
    icon: "QC",
  },
};

const catalogGroups: Array<[string, string[], "national" | "local"]> = [
  ["Department of Trade and Industry", [
    "Business Name Registration",
    "Business Name Renewal",
    "Business Name Information Update",
  ], "national"],
  ["Securities and Exchange Commission", [
    "Stock Corporation Registration",
    "One Person Corporation Registration",
    "Non-stock Corporation Registration",
    "Partnership Registration",
    "Amendment of Articles or Company Information",
    "General Information Sheet Filing",
    "Audited Financial Statements Filing",
  ], "national"],
  ["Cooperative Development Authority", [
    "Cooperative Registration",
    "Amendment of Cooperative Registration",
  ], "national"],
  ["Bureau of Internal Revenue", [
    "Business Tax Registration and TIN",
    "Certificate of Registration",
    "Authority to Print Invoices",
    "Registration of Books of Accounts",
    "Branch or Facility Registration",
    "Update of Registration Information",
    "Tax Clearance Application",
    "Business Closure or Registration Cancellation",
    "Computerized Accounting System Registration",
  ], "national"],
  ["Barangay and Local Government Units", [
    "Barangay Business Clearance",
    "New Business or Mayor's Permit",
    "Business Permit Renewal",
    "Business Permit Amendment",
    "Business Retirement or Closure",
    "Locational or Zoning Clearance",
    "Sanitary Permit",
    "Health Certificate for Business Employees",
  ], "local"],
  ["Office of the Building Official", [
    "Building Permit",
    "Occupancy Permit",
    "Signage or Sign Permit",
  ], "local"],
  ["Bureau of Fire Protection", [
    "Fire Safety Inspection Certificate for New Business",
    "Fire Safety Inspection Certificate Renewal",
  ], "national"],
  ["Social Security System", [
    "Employer Registration",
    "Employee Registration or Reporting",
  ], "national"],
  ["PhilHealth", [
    "Employer Registration",
    "Employee Registration or Reporting",
  ], "national"],
  ["Pag-IBIG Fund", [
    "Employer Registration",
    "Employee Registration or Reporting",
  ], "national"],
  ["Department of Labor and Employment", [
    "Establishment Registration under Rule 1020",
    "Alien Employment Permit",
  ], "national"],
  ["Food and Drug Administration", [
    "License to Operate for Food Establishment",
    "License to Operate for Drug Establishment",
    "License to Operate for Medical Device Establishment",
    "Product Registration or Notification",
  ], "national"],
  ["DENR / Environmental Management Bureau", [
    "Environmental Compliance Certificate",
    "Certificate of Non-Coverage",
  ], "national"],
  ["Bureau of Customs", ["Importer Accreditation"], "national"],
  ["Intellectual Property Office of the Philippines", [
    "Trademark Registration",
  ], "national"],
];

export const processCatalog: ProcessCatalogItem[] = catalogGroups.flatMap((
  [agencyName, names, governmentLevel],
  group,
) =>
  names.map((name, index) => ({
    id: `process-${group + 1}-${index + 1}`,
    name,
    agencyName,
    category: agencyName,
    governmentLevel,
    isRequestable:
      (agencyName === "Bureau of Internal Revenue" && index === 0) ||
      (agencyName === "Barangay and Local Government Units" && index === 1),
  }))
);

const today = new Date();
const isoDaysAgo = (days: number) =>
  new Date(today.getTime() - days * 86400000).toISOString();

export const seedRequests: RequestRecord[] = [
  [
    "EASE-2026-7K9M2Q",
    "bir-registration",
    "Luntian Foods Trading",
    "Maria Santos",
    "New",
    2,
    "Documents received and queued for initial review.",
  ],
  [
    "EASE-2026-4T8R1P",
    "business-permit",
    "Northstar Print Studio",
    "Paolo Reyes",
    "Completed",
    8,
    "Your permit has been approved and is ready for release.",
  ],
  [
    "EASE-2026-2B6N5W",
    "bir-registration",
    "Haraya Digital Works",
    "Ana Cruz",
    "Completed",
    14,
    "Registration is complete. Please retain your receipt.",
  ],
  [
    "EASE-2026-9C3X7L",
    "business-permit",
    "Common Ground Cafe",
    "Luis Garcia",
    "New",
    1,
    "Application received. Our team will review it shortly.",
  ],
  [
    "EASE-2026-5J1D8A",
    "bir-registration",
    "Mabuhay Home Goods",
    "Carla Lim",
    "New",
    4,
    "Documents are being checked for completeness.",
  ],
  [
    "EASE-2026-6F2H9S",
    "business-permit",
    "Brightline Consulting",
    "Jose Mendoza",
    "Completed",
    21,
    "Your business permit request has been completed.",
  ],
  [
    "EASE-2026-3G7V4E",
    "bir-registration",
    "Isla Creative Co.",
    "Sofia Tan",
    "Completed",
    32,
    "BIR registration has been completed.",
  ],
].map(
  (
    [
      serialCode,
      processId,
      businessName,
      applicantName,
      status,
      days,
      requesterNote,
    ],
  ) => {
    const process = activeProcesses[processId as ProcessId];
    const submitted = isoDaysAgo(days as number);
    return {
      serialCode: serialCode as string,
      processId: processId as ProcessId,
      processName: process.name,
      agency: process.agency,
      businessName: businessName as string,
      applicantName: applicantName as string,
      contactNumber: "+63 917 555 0123",
      region: "National Capital Region",
      city: "Quezon City",
      barangay: "Greater Lagro",
      address: "123 Commonwealth Avenue, Greater Lagro, Quezon City",
      dateSubmitted: submitted,
      status: status as "New" | "Completed",
      approvalDate: status === "Completed"
        ? isoDaysAgo((days as number) - 3).slice(0, 10)
        : "",
      requesterNote: requesterNote as string,
      internalNotes: "Request imported into the service workspace.",
      lastUpdated: status === "Completed"
        ? isoDaysAgo((days as number) - 3)
        : submitted,
      businessType: "Sole proprietorship",
    };
  },
);

export const geographies: Geography[] = [
  "Philippines",
  "National Capital Region",
  "Quezon City",
  "Greater Lagro",
];

export function statisticsFor(geography: Geography, processIds: string[]) {
  const scale = [1, 0.22, 0.065, 0.008][geographies.indexOf(geography)];
  return processCatalog.filter((p) =>
    processIds.length === 0 || processIds.includes(p.id)
  ).map((process, index) => {
    const base = index < 12
      ? 42000 - index * 1700
      : index < 35
      ? 14000 - (index - 12) * 370
      : 2600 - (index - 35) * 95;
    const total = Math.max(20, Math.round(base * scale));
    const completed = Math.round(total * (0.72 + (index % 6) * 0.03));
    const monthly = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((
      month,
      monthIndex,
    ) => ({
      month,
      new: Math.round(
        (total / 18) * (0.82 + monthIndex * 0.045 + (index % 3) * 0.03),
      ),
      completed: Math.round((completed / 17) * (0.86 + monthIndex * 0.035)),
    }));
    return {
      process,
      total,
      completed,
      newRequests: total - completed,
      overdue: Math.round((total - completed) * 0.18),
      avgDays: 2 + (index % 11),
      onTime: 74 + (index % 20),
      monthly,
    };
  });
}
