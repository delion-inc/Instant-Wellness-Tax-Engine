export type OrderStatus =
  | "ADDED"
  | "CALCULATED"
  | "OUT_OF_SCOPE"
  | "FAILED_VALIDATION"
  | "PROCESSING";

export interface CreateOrderRequest {
  latitude: number;
  longitude: number;
  timestamp: string;
  subtotal: string;
}

export interface SpecialRate {
  name: string;
  rate: number;
}

export interface OrderJurisdictions {
  city: string | null;
  state: string;
  county: string;
  special: string[] | null;
}

export interface OrderResponse {
  id: number;
  externalId?: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  subtotal: number;
  status: OrderStatus;
  csvImported: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  compositeTaxRate: number;
  taxAmount: number;
  totalAmount: number;
  stateRate: number;
  countyRate: number;
  cityRate: number;
  specialRates: SpecialRate[] | null;
  jurisdictions: OrderJurisdictions;
}

export interface OrdersPageResponse {
  content: OrderResponse[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  sort: string[];
}

export interface OrderFilterParams {
  page?: number;
  pageSize?: number;
  sort?: string;

  id?: number;
  idIn?: string;
  externalId?: number;
  externalIdIn?: string;
  csvImported?: boolean;
  createdBy?: number;

  status?: string;
  statusIn?: string;

  timestampFrom?: string;
  timestampTo?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;

  subtotalMin?: number;
  subtotalMax?: number;
  compositeTaxRateMin?: number;
  compositeTaxRateMax?: number;
  taxAmountMin?: number;
  taxAmountMax?: number;
  totalAmountMin?: number;
  totalAmountMax?: number;

  jurState?: string;
  jurCounty?: string;
  jurCity?: string;
  jurSpecial?: string;
  jurSpecialIn?: string;
  hasSpecial?: boolean;
}

export type DuplicateHandling = "skip" | "overwrite" | "fail";
export type OutOfScopeHandling = "mark" | "fail";

export interface ImportCsvOptions {
  duplicateHandling: DuplicateHandling;
  outOfScopeHandling: OutOfScopeHandling;
}

export type ImportStatus = "PROCESSING" | "COMPLETED" | "COMPLETED_WITH_ERRORS" | "FAILED";

export type ImportErrorReason =
  | "MISSING_COLUMN"
  | "BAD_FORMAT"
  | "INVALID_TIMESTAMP"
  | "INVALID_COORDINATES"
  | "OUT_OF_SCOPE"
  | "NEGATIVE_SUBTOTAL"
  | "DUPLICATE_EXTERNAL_ID"
  | "CALCULATION_FAILED"
  | "UNKNOWN";

export interface ImportSummary {
  totalRows: number;
  parsedRows: number;
  importedRows: number;
  calculatedRows: number;
  failedRows: number;
  skippedDuplicateRows: number;
  outOfScopeRows: number;
}

export interface ImportRowError {
  rowNumber: number;
  externalId: number;
  reason: ImportErrorReason;
  field: string;
  message: string;
  rawRow: string;
}

export interface ImportResponse {
  trackingId: string;
  status: ImportStatus;
  message: string;
  summary: ImportSummary;
  errorsPreview: ImportRowError[];
}

export interface CalculationProgressEvent {
  trackingId: string;
  calculated: number;
  outOfScope: number;
  pending: number;
  total: number;
  batchCalculated: number;
  batchOutOfScope: number;
  batchSize: number;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  terminal: boolean;
}
