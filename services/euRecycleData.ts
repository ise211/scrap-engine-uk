import { ScrapPrice } from '../types';

const TODAY = new Date().toISOString().split('T')[0];
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split('T')[0];

// Helper to generate a consistent ID
const generateId = (city: string, material: string) => 
  `${city.toLowerCase().substring(0, 3)}-${material.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Math.floor(Math.random() * 1000)}`;

// Base prices to derive regional variations from
const BASE_PRICES: Record<string, number> = {
  'Dry Bright Wire': 6.45,
  'Clean Copper Tube': 5.95,
  'Heavy Copper': 5.65,
  'Braziery Copper': 5.10,
  'Copper Tanks': 5.25,
  'Mixed Brass': 3.65,
  'Clean Brass': 3.85,
  'Brass Cuttings': 3.75,
  'Gun Metal': 4.25,
  'Lead Scrap': 1.48,
  'Lead Acid Batteries': 0.65,
  'Clean Aluminium Wheels': 1.45,
  'Old Rolled Aluminium': 1.08,
  'Clean Aluminium Cuttings': 1.12,
  'Cast Aluminium': 1.18,
  'Aluminium Turnings': 0.75,
  'Aluminium Cans': 0.85,
  'Stainless Steel 304': 1.30,
  'Stainless Steel 316': 1.80,
  'Light Iron': 0.18,
  'HMS 1/2 Steel': 0.25,
  'Electric Motors': 0.58,
  'Household Cable': 1.90,
  'Low Grade Cable': 0.95,
  'Armoured Cable': 1.50,
  'Zinc': 1.15,
  'Alternators': 0.65,
  'Starter Motors': 0.60,
  'Catalytic Converters': 45.00 // Average unit price treated as kg for simplicity in this schema or per piece
};

// Regional variance factors (e.g., London pays 2% more, Newcastle 2% less)
const REGIONS: Record<string, number> = {
  'London': 1.02,
  'Birmingham': 1.01,
  'Manchester': 1.00,
  'Liverpool': 0.99,
  'Glasgow': 0.98,
  'Leeds': 1.00,
  'Sheffield': 1.01, // Steel city
  'Bristol': 0.99,
  'Newcastle': 0.97,
  'Leicester': 0.99,
  'Cardiff': 0.98,
  'Belfast': 0.96,
  'Nottingham': 0.99,
  'Southampton': 1.01,
  'Portsmouth': 1.00
};

const generateData = (): ScrapPrice[] => {
  const data: ScrapPrice[] = [];

  Object.entries(REGIONS).forEach(([city, multiplier]) => {
    Object.entries(BASE_PRICES).forEach(([material, basePrice]) => {
      // Add some random daily fluctuation (-1% to +1%)
      const randomFluctuation = 0.99 + (Math.random() * 0.02);
      
      // Calculate final regional price
      let finalPrice = basePrice * multiplier * randomFluctuation;
      
      // Round to 2 decimal places
      finalPrice = Math.round(finalPrice * 100) / 100;

      // Determine trend based on random fluctuation
      let trend: 'up' | 'down' | 'flat' = 'flat';
      let change = 0;
      
      if (randomFluctuation > 1.002) {
        trend = 'up';
        change = Number(((randomFluctuation - 1) * 100).toFixed(1));
      } else if (randomFluctuation < 0.998) {
        trend = 'down';
        change = Number(((1 - randomFluctuation) * 100).toFixed(1));
      }

      data.push({
        id: generateId(city, material),
        material: material,
        location: city,
        pricePerKg: finalPrice,
        date: Math.random() > 0.3 ? TODAY : YESTERDAY, // Mix of today and yesterday
        trend: trend,
        changePercentage: trend === 'down' ? -change : change
      });
    });
  });

  return data;
};

export const EU_RECYCLE_DATA: ScrapPrice[] = generateData();
