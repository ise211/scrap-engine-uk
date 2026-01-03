export interface ScrapPrice {
  id: string;
  material: string;
  location: string;
  pricePerKg: number;
  date: string; // ISO date string
  trend: 'up' | 'down' | 'flat';
  changePercentage: number;
  spotPriceDiff?: number; // Difference from LME/Spot price
}

export interface MetalSpotPrice {
  metal: string;
  priceUsdPerTonne: number;
  priceGbpPerKg: number;
  lastUpdated: string;
}

export interface CalculatorItem {
  id: string;
  materialId: string;
  weightKg: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CALCULATOR = 'CALCULATOR',
  ANALYSIS = 'ANALYSIS',
  REGIONAL = 'REGIONAL',
  HISTORY = 'HISTORY'
}