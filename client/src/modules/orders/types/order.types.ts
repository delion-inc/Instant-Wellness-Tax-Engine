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
  city: string;
  state: string;
  county: string;
  special: string[];
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
  specialRates: SpecialRate[];
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

  include?: string;
  fields?: string;
}

export type DuplicateHandling = "skip" | "overwrite" | "fail";
export type OutOfScopeHandling = "mark" | "fail";

export interface ImportCsvOptions {
  duplicateHandling: DuplicateHandling;
  outOfScopeHandling: OutOfScopeHandling;
}

export interface ImportCsvResponse {
  imported: number;
  calculated: number;
  message: string;
}
