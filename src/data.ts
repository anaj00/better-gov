import type {
  DrillLocation,
  Geography,
  ProcessCatalogItem,
  ProcessId,
  RegionStat,
  RequestRecord,
  TimeWindow,
} from "./types";

export type AgencyService = {
  id: ProcessId;
  name: string;
  agency: string;
  estimate: string;
  description: string;
};

export const birServices: AgencyService[] = [
  {
    id: "bir-registration",
    name: "Business Tax Registration and TIN",
    agency: "Bureau of Internal Revenue",
    estimate: "5-10 business days",
    description:
      "Register a business taxpayer and secure a Tax Identification Number.",
  },
  {
    id: "bir-certificate-registration",
    name: "Certificate of Registration",
    agency: "Bureau of Internal Revenue",
    estimate: "3-5 business days",
    description: "Process the issuance of a BIR Certificate of Registration.",
  },
  {
    id: "bir-authority-print",
    name: "Authority to Print Invoices",
    agency: "Bureau of Internal Revenue",
    estimate: "3-5 business days",
    description: "Request authority to print official invoices and receipts.",
  },
  {
    id: "bir-books-accounts",
    name: "Registration of Books of Accounts",
    agency: "Bureau of Internal Revenue",
    estimate: "1-3 business days",
    description:
      "Register manual, loose-leaf, or computerized accounting books.",
  },
  {
    id: "bir-branch-registration",
    name: "Branch or Facility Registration",
    agency: "Bureau of Internal Revenue",
    estimate: "5-10 business days",
    description:
      "Register an additional branch, warehouse, or business facility.",
  },
  {
    id: "bir-registration-update",
    name: "Update of Registration Information",
    agency: "Bureau of Internal Revenue",
    estimate: "3-5 business days",
    description:
      "Update a taxpayer's registered business information or details.",
  },
  {
    id: "bir-tax-clearance",
    name: "Tax Clearance Application",
    agency: "Bureau of Internal Revenue",
    estimate: "7-15 business days",
    description:
      "Apply for certification that tax obligations are in good standing.",
  },
  {
    id: "bir-business-closure",
    name: "Business Closure or Registration Cancellation",
    agency: "Bureau of Internal Revenue",
    estimate: "10-20 business days",
    description:
      "Process business closure and cancellation of BIR registration.",
  },
  {
    id: "bir-accounting-system",
    name: "Computerized Accounting System Registration",
    agency: "Bureau of Internal Revenue",
    estimate: "10-15 business days",
    description: "Register a computerized accounting or bookkeeping system.",
  },
];

export const activeProcesses: Record<
  ProcessId,
  { name: string; agency: string; estimate: string }
> = {
  "business-permit": {
    name: "New Business Permit",
    agency: "Quezon City Business Permits and Licensing Department",
    estimate: "3-7 business days",
  },
  ...Object.fromEntries(
    birServices.map(({ id, name, agency, estimate }) => [
      id,
      { name, agency, estimate },
    ]),
  ) as Record<
    Exclude<ProcessId, "business-permit">,
    { name: string; agency: string; estimate: string }
  >,
};

const catalogGroups: Array<[string, string[], "national" | "local"]> = [
  [
    "Department of Trade and Industry",
    [
      "Business Name Registration",
      "Business Name Renewal",
      "Business Name Information Update",
    ],
    "national",
  ],
  [
    "Securities and Exchange Commission",
    [
      "Stock Corporation Registration",
      "One Person Corporation Registration",
      "Non-stock Corporation Registration",
      "Partnership Registration",
      "Amendment of Articles or Company Information",
      "General Information Sheet Filing",
      "Audited Financial Statements Filing",
    ],
    "national",
  ],
  [
    "Cooperative Development Authority",
    ["Cooperative Registration", "Amendment of Cooperative Registration"],
    "national",
  ],
  [
    "Bureau of Internal Revenue",
    [
      "Business Tax Registration and TIN",
      "Certificate of Registration",
      "Authority to Print Invoices",
      "Registration of Books of Accounts",
      "Branch or Facility Registration",
      "Update of Registration Information",
      "Tax Clearance Application",
      "Business Closure or Registration Cancellation",
      "Computerized Accounting System Registration",
    ],
    "national",
  ],
  [
    "Barangay and Local Government Units",
    [
      "Barangay Business Clearance",
      "New Business or Mayor's Permit",
      "Business Permit Renewal",
      "Business Permit Amendment",
      "Business Retirement or Closure",
      "Locational or Zoning Clearance",
      "Sanitary Permit",
      "Health Certificate for Business Employees",
    ],
    "local",
  ],
  [
    "Office of the Building Official",
    ["Building Permit", "Occupancy Permit", "Signage or Sign Permit"],
    "local",
  ],
  [
    "Bureau of Fire Protection",
    [
      "Fire Safety Inspection Certificate for New Business",
      "Fire Safety Inspection Certificate Renewal",
    ],
    "national",
  ],
  [
    "Social Security System",
    ["Employer Registration", "Employee Registration or Reporting"],
    "national",
  ],
  [
    "PhilHealth",
    ["Employer Registration", "Employee Registration or Reporting"],
    "national",
  ],
  [
    "Pag-IBIG Fund",
    ["Employer Registration", "Employee Registration or Reporting"],
    "national",
  ],
  [
    "Department of Labor and Employment",
    ["Establishment Registration under Rule 1020", "Alien Employment Permit"],
    "national",
  ],
  [
    "Food and Drug Administration",
    [
      "License to Operate for Food Establishment",
      "License to Operate for Drug Establishment",
      "License to Operate for Medical Device Establishment",
      "Product Registration or Notification",
    ],
    "national",
  ],
  [
    "DENR / Environmental Management Bureau",
    ["Environmental Compliance Certificate", "Certificate of Non-Coverage"],
    "national",
  ],
  ["Bureau of Customs", ["Importer Accreditation"], "national"],
  [
    "Intellectual Property Office of the Philippines",
    ["Trademark Registration"],
    "national",
  ],
];

export const processCatalog: ProcessCatalogItem[] = catalogGroups.flatMap(
  ([agencyName, names, governmentLevel], group) =>
    names.map((name, index) => ({
      id: `process-${group + 1}-${index + 1}`,
      name,
      agencyName,
      category: agencyName,
      governmentLevel,
      isRequestable:
        (agencyName === "Bureau of Internal Revenue" && index === 0) ||
        (agencyName === "Barangay and Local Government Units" && index === 1),
    })),
);

const today = new Date();
const isoDaysAgo = (days: number) =>
  new Date(today.getTime() - days * 86400000).toISOString();

export const seedRequests: RequestRecord[] = [
  [
    "GOVTRACK-2026-7K9M2Q",
    "bir-registration",
    "Luntian Foods Trading",
    "Maria Santos",
    "New",
    2,
    "Documents received and queued for initial review.",
  ],
  [
    "GOVTRACK-2026-4T8R1P",
    "business-permit",
    "Northstar Print Studio",
    "Paolo Reyes",
    "Completed",
    8,
    "Your permit has been approved and is ready for release.",
  ],
  [
    "GOVTRACK-2026-2B6N5W",
    "bir-registration",
    "Haraya Digital Works",
    "Ana Cruz",
    "Completed",
    14,
    "Registration is complete. Please retain your receipt.",
  ],
  [
    "GOVTRACK-2026-9C3X7L",
    "business-permit",
    "Common Ground Cafe",
    "Luis Garcia",
    "New",
    1,
    "Application received. Our team will review it shortly.",
  ],
  [
    "GOVTRACK-2026-5J1D8A",
    "bir-registration",
    "Mabuhay Home Goods",
    "Carla Lim",
    "New",
    4,
    "Documents are being checked for completeness.",
  ],
  [
    "GOVTRACK-2026-6F2H9S",
    "business-permit",
    "Brightline Consulting",
    "Jose Mendoza",
    "Completed",
    21,
    "Your business permit request has been completed.",
  ],
  [
    "GOVTRACK-2026-3G7V4E",
    "bir-registration",
    "Isla Creative Co.",
    "Sofia Tan",
    "Completed",
    32,
    "BIR registration has been completed.",
  ],
].map(
  ([
    serialCode,
    processId,
    businessName,
    applicantName,
    status,
    days,
    requesterNote,
  ]) => {
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
  return processCatalog
    .filter((p) => processIds.length === 0 || processIds.includes(p.id))
    .map((process, index) => {
      const base = index < 12
        ? 42000 - index * 1700
        : index < 35
        ? 14000 - (index - 12) * 370
        : 2600 - (index - 35) * 95;
      const total = Math.max(20, Math.round(base * scale));
      const completed = Math.round(total * (0.72 + (index % 6) * 0.03));
      const monthly = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"].map(
        (month, monthIndex) => ({
          month,
          new: Math.round(
            (total / 18) * (0.82 + monthIndex * 0.045 + (index % 3) * 0.03),
          ),
          completed: Math.round((completed / 17) * (0.86 + monthIndex * 0.035)),
        }),
      );
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

export const regionNames = [
  "Region I (Ilocos Region)",
  "Region II (Cagayan Valley)",
  "Region III (Central Luzon)",
  "Region IV-A (CALABARZON)",
  "Region V (Bicol Region)",
  "Region VI (Western Visayas)",
  "Region VII (Central Visayas)",
  "Region VIII (Eastern Visayas)",
  "Region IX (Zamboanga Peninsula)",
  "Region X (Northern Mindanao)",
  "Region XI (Davao Region)",
  "Region XII (SOCCSKSARGEN)",
  "National Capital Region (NCR)",
  "Cordillera Administrative Region (CAR)",
  "Region XIII (Caraga)",
  "MIMAROPA Region",
  "Bangsamoro Autonomous Region In Muslim Mindanao (BARMM)",
];

// Approximate share of request volume distributed to each region (sums to ~1)
const regionFactors = [
  0.055,
  0.03,
  0.11,
  0.13,
  0.05,
  0.07,
  0.075,
  0.04,
  0.035,
  0.05,
  0.065,
  0.045,
  0.13,
  0.028,
  0.028,
  0.025,
  0.024,
];

export function statisticsByRegion(processIds: string[]): RegionStat[] {
  const national = statisticsFor("Philippines", processIds).reduce(
    (acc, row) => {
      acc.total += row.total;
      acc.completed += row.completed;
      acc.weightedDays += row.avgDays * row.total;
      acc.weightedOnTime += row.onTime * row.completed;
      return acc;
    },
    { total: 0, completed: 0, weightedDays: 0, weightedOnTime: 0 },
  );
  const avgDays = national.total ? national.weightedDays / national.total : 0;
  const onTimePct = national.completed
    ? national.weightedOnTime / national.completed
    : 0;
  return regionNames.map((region, index) => {
    const factor = regionFactors[index] ?? 0;
    const total = Math.round(national.total * factor);
    const completed = Math.round(
      total * (national.total ? national.completed / national.total : 0.72),
    );
    const jitter = (index * 7) % 9;
    return {
      region,
      total,
      completed,
      newRequests: total - completed,
      overdue: Math.round((total - completed) * 0.18),
      avgDays: Math.max(1, Math.round(avgDays) + (jitter - 4)),
      onTimePct: Math.max(
        0,
        Math.min(100, Math.round(onTimePct) + ((index * 11) % 13) - 6),
      ),
    };
  });
}

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const regionCities: Record<string, string[]> = {
  "Region I (Ilocos Region)": [
    "San Fernando (La Union)",
    "Dagupan",
    "Laoag",
    "Vigan",
  ],
  "Region II (Cagayan Valley)": ["Tuguegarao", "Santiago", "Cauayan", "Ilagan"],
  "Region III (Central Luzon)": [
    "San Fernando (Pampanga)",
    "Angeles",
    "Olongapo",
    "Malolos",
    "Tarlac City",
    "Cabanatuan",
  ],
  "Region IV-A (CALABARZON)": [
    "Calamba",
    "Antipolo",
    "Batangas City",
    "Lucena",
    "Lipa",
    "Santa Rosa",
  ],
  "Region V (Bicol Region)": [
    "Legazpi",
    "Naga City",
    "Sorsogon City",
    "Masbate City",
  ],
  "Region VI (Western Visayas)": [
    "Iloilo City",
    "Bacolod",
    "Bago",
    "Kabankalan",
  ],
  "Region VII (Central Visayas)": [
    "Cebu City",
    "Lapu-Lapu",
    "Mandaue",
    "Tagbilaran",
    "Dumaguete",
  ],
  "Region VIII (Eastern Visayas)": ["Tacloban", "Ormoc", "Calbayog", "Maasin"],
  "Region IX (Zamboanga Peninsula)": ["Zamboanga City", "Pagadian", "Dipolog"],
  "Region X (Northern Mindanao)": [
    "Cagayan de Oro",
    "Iligan",
    "Malaybalay",
    "Valencia",
  ],
  "Region XI (Davao Region)": ["Davao City", "Tagum", "Digos", "Panabo"],
  "Region XII (SOCCSKSARGEN)": [
    "General Santos",
    "Koronadal",
    "Tacurong",
    "Kidapawan",
  ],
  "National Capital Region (NCR)": [
    "Quezon City",
    "Manila",
    "Pasig",
    "Makati",
    "Taguig",
    "Marikina",
  ],
  "Cordillera Administrative Region (CAR)": ["Baguio", "Tabuk", "La Trinidad"],
  "Region XIII (Caraga)": ["Butuan", "Surigao City", "Bayugan"],
  "MIMAROPA Region": ["Puerto Princesa", "Calapan", "Odiongan"],
  "Bangsamoro Autonomous Region In Muslim Mindanao (BARMM)": [
    "Cotabato City",
    "Marawi",
    "Lamitan",
  ],
};

export function citiesForRegion(region: string): string[] {
  return regionCities[region] ?? [];
}

const barangayPool = [
  "Poblacion",
  "San Isidro",
  "Santo Niño",
  "San Roque",
  "San Jose",
  "San Juan",
  "San Nicolas",
  "San Vicente",
  "Santa Cruz",
  "Santa Rosa",
  "San Miguel",
  "San Rafael",
  "San Antonio",
  "San Pedro",
  "Mabini",
  "Rizal",
  "Bonifacio",
  "Malvar",
  "Del Pilar",
  "Magsaysay",
  "Luna",
  "Burgos",
  "Sto. Rosario",
  "Kalawakan",
  "Pandan",
];

export function barangaysForCity(city: string): string[] {
  const forced = city === "Quezon City" ? ["Greater Lagro"] : [];
  const count = 3 + (hash(city + ":b") % 2);
  const start = hash(city) % barangayPool.length;
  const picked = new Set<string>(forced);
  const result = [...forced];
  for (let i = 0; i < barangayPool.length && result.length < count; i++) {
    const name = barangayPool[(start + i) % barangayPool.length];
    if (!picked.has(name)) {
      picked.add(name);
      result.push(name);
    }
  }
  return result;
}

export function shortRegionName(region: string): string {
  if (region === "National Capital Region (NCR)") return "NCR";
  const match = region.match(/\(([^)]+)\)/);
  if (match) return match[1];
  return region.replace(/^Region /, "");
}

function scaleMedian(
  median: number,
  location: DrillLocation,
  window: TimeWindow,
): number {
  if (location.region) {
    const index = regionNames.indexOf(location.region);
    median *= 0.9 + ((index * 7) % 19) / 100;
  }
  if (location.city) median *= 0.88 + (hash(location.city) % 18) / 100;
  if (location.barangay) median *= 0.85 + (hash(location.barangay) % 22) / 100;
  if (window === "30d") {
    const key = `${location.region ?? "ph"}|${location.city ?? ""}|${
      location.barangay ?? ""
    }`;
    median *= 0.86 + (hash(key + "w") % 14) / 100;
  }
  return Math.round(median * 10) / 10;
}

export function medianDaysFor(
  location: DrillLocation,
  processIds: string[],
  window: TimeWindow,
): number {
  const rows = statisticsFor("Philippines", processIds);
  const total = rows.reduce((sum, row) => sum + row.total, 0) || 1;
  const median = rows.reduce(
    (sum, row) => sum + row.avgDays * row.total,
    0,
  ) / total;
  return scaleMedian(median, location, window);
}

export function processMedianDays(
  id: string,
  location: DrillLocation,
  window: TimeWindow,
): number {
  const projectIndex = processCatalog.findIndex((p) => p.id === id);
  const base =
    2 +
    (projectIndex % 11) +
    ((hash(id) % 7) / 10) +
    (projectIndex % 4) * 0.5 +
    (hash(id + "d") % 20) / 10;
  return scaleMedian(base, location, window);
}

export function drillLevelLabel(location: DrillLocation): string {
  if (location.barangay) return "Barangay";
  if (location.city) return "City";
  if (location.region) return "Regional";
  return "National";
}

function downScale(
  scope: {
    total: number;
    completed: number;
    avgDays: number;
    onTimePct: number;
  },
  factor: number,
  key: string,
) {
  const total = Math.max(1, Math.round(scope.total * factor));
  const completed = Math.min(
    total,
    Math.max(0, Math.round(total * (0.72 + (hash(key + "x") % 9) / 100))),
  );
  return {
    total,
    completed,
    avgDays: scope.avgDays * (0.94 + (hash(key + "d") % 11) / 100),
    onTimePct: Math.max(
      0,
      Math.min(100, scope.onTimePct + (hash(key + "o") % 15) - 7),
    ),
  };
}

export function drillStats(
  location: DrillLocation,
  processIds: string[],
  window: TimeWindow,
): Pick<
  RegionStat,
  "total" | "completed" | "newRequests" | "overdue" | "avgDays" | "onTimePct"
> {
  const rows = statisticsFor("Philippines", processIds);
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const completed = rows.reduce((sum, row) => sum + row.completed, 0);
  let scope = {
    total,
    completed,
    avgDays: total
      ? rows.reduce((sum, row) => sum + row.avgDays * row.total, 0) / total
      : 0,
    onTimePct: completed
      ? rows.reduce((sum, row) => sum + row.onTime * row.completed, 0) /
        completed
      : 0,
  };
  if (location.region) {
    const region = statisticsByRegion(processIds).find(
      (row) => row.region === location.region,
    );
    if (region) {
      scope = {
        total: region.total,
        completed: region.completed,
        avgDays: region.avgDays,
        onTimePct: region.onTimePct,
      };
    }
  }
  if (location.city) {
    scope = downScale(
      scope,
      0.25 + (hash(location.city) % 10) / 100,
      location.city,
    );
  }
  if (location.barangay) {
    scope = downScale(
      scope,
      0.2 + (hash(location.barangay) % 10) / 100,
      location.barangay,
    );
  }
  if (window === "30d") {
    const key = `${location.region ?? "ph"}|${location.city ?? ""}|${
      location.barangay ?? ""
    }`;
    scope = downScale(scope, 0.06 + (hash(key + "r") % 7) / 100, key);
  }
  const newRequests = scope.total - scope.completed;
  return {
    total: scope.total,
    completed: scope.completed,
    newRequests,
    overdue: Math.round(newRequests * 0.18),
    avgDays: Math.round(scope.avgDays * 10) / 10,
    onTimePct: Math.round(scope.onTimePct),
  };
}
