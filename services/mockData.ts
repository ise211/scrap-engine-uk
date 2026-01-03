import { ScrapPrice, MetalSpotPrice } from '../types';

const TODAY = new Date().toISOString().split('T')[0];

// Simulated data that would come from "eurecycleinfo.com" or similar
export const MOCK_SCRAP_PRICES: ScrapPrice[] = [
  { id: '1', material: 'Dry Bright Wire', location: 'Birmingham', pricePerKg: 6.20, date: TODAY, trend: 'up', changePercentage: 2.5 },
  { id: '2', material: 'Clean Copper Tube', location: 'Manchester', pricePerKg: 5.80, date: TODAY, trend: 'flat', changePercentage: 0 },
  { id: '3', material: 'Braziery Copper', location: 'Leeds', pricePerKg: 4.95, date: TODAY, trend: 'down', changePercentage: -1.2 },
  { id: '4', material: 'Mixed Brass', location: 'London', pricePerKg: 3.50, date: TODAY, trend: 'up', changePercentage: 0.8 },
  { id: '5', material: 'Clean Brass', location: 'Bristol', pricePerKg: 3.80, date: TODAY, trend: 'flat', changePercentage: 0.1 },
  { id: '6', material: 'Gun Metal', location: 'Glasgow', pricePerKg: 4.10, date: TODAY, trend: 'up', changePercentage: 1.5 },
  { id: '7', material: 'Lead Scrap', location: 'Liverpool', pricePerKg: 1.45, date: TODAY, trend: 'down', changePercentage: -0.5 },
  { id: '8', material: 'Aluminium Cuttings', location: 'Sheffield', pricePerKg: 1.10, date: TODAY, trend: 'flat', changePercentage: 0 },
  { id: '9', material: 'Old Rolled Aluminium', location: 'Newcastle', pricePerKg: 0.95, date: TODAY, trend: 'down', changePercentage: -2.1 },
  { id: '10', material: 'Stainless Steel 304', location: 'Cardiff', pricePerKg: 1.25, date: TODAY, trend: 'up', changePercentage: 3.2 },
  { id: '11', material: 'Stainless Steel 316', location: 'Nottingham', pricePerKg: 1.75, date: TODAY, trend: 'up', changePercentage: 1.8 },
  { id: '12', material: 'Electric Motors', location: 'Southampton', pricePerKg: 0.55, date: TODAY, trend: 'flat', changePercentage: 0 },
  { id: '13', material: 'Household Cable', location: 'Leicester', pricePerKg: 1.80, date: TODAY, trend: 'up', changePercentage: 0.5 },
  { id: '14', material: 'Low Grade Cable', location: 'Coventry', pricePerKg: 0.90, date: TODAY, trend: 'down', changePercentage: -1.0 },
  { id: '15', material: 'Lead Acid Batteries', location: 'Stoke', pricePerKg: 0.65, date: TODAY, trend: 'flat', changePercentage: 0 },
];

export const MOCK_SPOT_PRICES: MetalSpotPrice[] = [
  { metal: 'Copper', priceUsdPerTonne: 8500, priceGbpPerKg: 6.71, lastUpdated: TODAY },
  { metal: 'Aluminium', priceUsdPerTonne: 2200, priceGbpPerKg: 1.74, lastUpdated: TODAY },
  { metal: 'Zinc', priceUsdPerTonne: 2500, priceGbpPerKg: 1.97, lastUpdated: TODAY },
  { metal: 'Lead', priceUsdPerTonne: 2100, priceGbpPerKg: 1.66, lastUpdated: TODAY },
  { metal: 'Nickel', priceUsdPerTonne: 16000, priceGbpPerKg: 12.64, lastUpdated: TODAY },
];

// Helper to simulate data fetching delay
export const fetchMockData = <T,>(data: T, delay = 800): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};