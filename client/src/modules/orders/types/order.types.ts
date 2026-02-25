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
  latitude: number;
  longitude: number;
  timestamp: string;
  subtotal: number;
  status: "CALCULATED" | "OUT_OF_SCOPE" | "FAILED_VALIDATION";
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
