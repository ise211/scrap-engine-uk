import { MetalSpotPrice } from '../types';
import { MOCK_SPOT_PRICES } from './mockData';

// Configuration from user request
const API_KEY = 'd010e3a7723ea0a77529739518a01ad4';
const BASE_URL = 'https://api.metalpriceapi.com/v1/latest';

// Mapping API symbols to Display Names
const METAL_MAPPING: Record<string, string> = {
  'XCU': 'Copper',
  'ALU': 'Aluminium',
  'ZNC': 'Zinc',
  'XPB': 'Lead',
  'NI':  'Nickel',
  'XSN': 'Tin',
  'IRON': 'Iron Ore',
  'XLI': 'Lithium'
};

export const fetchLiveSpotPrices = async (): Promise<MetalSpotPrice[]> => {
  try {
    // Request metals + GBP for conversion
    // Using comma separated as per standard API usage
    const currencies = [...Object.keys(METAL_MAPPING), 'GBP'].join(',');
    const url = `${BASE_URL}?api_key=${API_KEY}&base=USD&currencies=${currencies}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!data.success || !data.rates) {
      console.warn('Live API returned unsuccessful response, using mock data.', data);
      return MOCK_SPOT_PRICES;
    }

    const rates = data.rates;
    const gbpRate = rates.GBP || 0.79; // Fallback if GBP missing

    const livePrices: MetalSpotPrice[] = Object.entries(METAL_MAPPING).map(([code, name]) => {
      const rate = rates[code];
      if (!rate) return null;

      // MetalPriceAPI (Base USD): 1 USD = [rate] Units of Metal
      // Therefore, Price (USD per Unit) = 1 / rate
      // Note: API usually returns Metric Tonnes for base metals.
      
      let priceUsd = 1 / rate;
      
      // Heuristic: Copper (XCU) sometimes returns per Ounce/Lb in different API tiers/providers.
      // If price is very low (< 100), it's likely not per Tonne.
      // Copper Tonne ~ $9000. Copper Lb ~ $4.00.
      if (code === 'XCU' && priceUsd < 100) {
        priceUsd = priceUsd * 2204.62; // Convert Lb to Tonne approx
      }

      const priceGbpPerKg = (priceUsd * gbpRate) / 1000;

      return {
        metal: name,
        priceUsdPerTonne: priceUsd,
        priceGbpPerKg: priceGbpPerKg,
        lastUpdated: new Date(data.timestamp * 1000).toISOString().split('T')[0]
      };
    }).filter((item): item is MetalSpotPrice => item !== null);

    if (livePrices.length === 0) return MOCK_SPOT_PRICES;

    // Sort for display consistency
    const sortOrder = ['Copper', 'Aluminium', 'Zinc', 'Lead', 'Nickel', 'Tin', 'Lithium', 'Iron Ore'];
    livePrices.sort((a, b) => sortOrder.indexOf(a.metal) - sortOrder.indexOf(b.metal));

    return livePrices;

  } catch (error) {
    console.error('Error fetching live spot prices:', error);
    return MOCK_SPOT_PRICES;
  }
};