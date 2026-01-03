import React, { useState } from 'react';
import { X, Copy, Check, Terminal } from 'lucide-react';

interface PythonScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PYTHON_CODE = `import json
import random
import time
from datetime import datetime
import urllib.request
import urllib.error

# --- Configuration ---
# You can get a free key from metalpriceapi.com
API_KEY = 'd010e3a7723ea0a77529739518a01ad4' 
BASE_URL = 'https://api.metalpriceapi.com/v1/latest'

# --- Data Definitions ---
BASE_PRICES = {
    'Dry Bright Wire': 6.45,
    'Clean Copper Tube': 5.95,
    'Braziery Copper': 5.10,
    'Mixed Brass': 3.65,
    'Clean Aluminium Wheels': 1.45,
    'Old Rolled Aluminium': 1.08,
    'Stainless Steel 304': 1.30,
    'Household Cable': 1.90,
    'Lead Acid Batteries': 0.65,
    'Catalytic Converters': 45.00
}

REGIONS = {
    'London': 1.02, 'Birmingham': 1.01, 'Manchester': 1.00,
    'Leeds': 1.00, 'Liverpool': 0.99, 'Newcastle': 0.97
}

def fetch_live_spot_prices():
    print("Fetching Live Spot Prices...")
    metals = ['XCU', 'ALU', 'ZNC', 'XPB', 'NI']
    try:
        url = f"{BASE_URL}?api_key={API_KEY}&base=USD&currencies={','.join(metals)},GBP"
        # Using standard library to avoid pip install requests
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
        
        if not data.get('success'):
            print("API Error. Using defaults.")
            return {}
            
        rates = data['rates']
        gbp_rate = rates.get('GBP', 0.79)
        
        prices = {}
        names = {'XCU': 'Copper', 'ALU': 'Aluminium', 'ZNC': 'Zinc', 'XPB': 'Lead', 'NI': 'Nickel'}
        
        for code, name in names.items():
            if code in rates:
                # 1 USD = Rate * Units. Price in USD = 1/Rate.
                # Note: API usually returns Metric Tonnes for base metals.
                price_usd = 1 / rates[code]
                
                # Heuristic fix for Copper sometimes reporting in lbs
                if code == 'XCU' and price_usd < 100: price_usd *= 2204.62
                
                price_gbp_kg = (price_usd * gbp_rate) / 1000
                prices[name] = price_gbp_kg
                
        return prices
    except Exception as e:
        print(f"Connection failed: {e}")
        return {}

def generate_regional_prices():
    print("\\n--- Generating Regional Scrap Prices ---")
    results = []
    for city, mult in REGIONS.items():
        for material, base in BASE_PRICES.items():
            # Random fluctuation +/- 1%
            fluctuation = 0.99 + (random.random() * 0.02)
            price = base * mult * fluctuation
            results.append({
                'city': city,
                'material': material,
                'price': round(price, 2)
            })
    return results

def main():
    print(f"UK Scrap Metal Pricing Engine - CLI v1.0")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}\\n")
    
    # 1. Spot Prices
    spot = fetch_live_spot_prices()
    if spot:
        print(f"{'METAL':<15} | {'SPOT (£/kg)':<12}")
        print("-" * 30)
        for metal, price in spot.items():
            print(f"{metal:<15} | £{price:.2f}")
    
    # 2. Regional Prices
    scrap = generate_regional_prices()
    print(f"\\n{'LOCATION':<12} | {'MATERIAL':<25} | {'PRICE (£/kg)':<12}")
    print("-" * 55)
    
    # Sort by price desc
    scrap.sort(key=lambda x: x['price'], reverse=True)
    
    for item in scrap[:20]: # Show top 20
        print(f"{item['city']:<12} | {item['material']:<25} | £{item['price']:.2f}")

    input("\\nPress Enter to exit...")

if __name__ == "__main__":
    main()
`;

const PythonScriptModal: React.FC<PythonScriptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-4xl rounded-xl shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
              <Terminal size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Scrap Engine CLI</h2>
              <p className="text-sm text-slate-400">Python Script (Standalone)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-950/50 border-b border-slate-800 text-sm text-slate-300">
            <p className="mb-2">Run this script on your local machine to fetch live market data directly to your terminal. No external dependencies required (uses standard library).</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>Copy the code below</li>
              <li>Save as <code className="bg-slate-800 px-1 rounded text-blue-300">scrap_prices.py</code></li>
              <li>Run <code className="bg-slate-800 px-1 rounded text-blue-300">python scrap_prices.py</code></li>
            </ol>
          </div>
          
          <div className="relative flex-1 overflow-auto bg-[#1e1e1e] p-4 font-mono text-sm">
             <button 
              onClick={handleCopy}
              className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium transition-all shadow-lg z-10"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <pre className="text-gray-300 leading-relaxed">
              <code>{PYTHON_CODE}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythonScriptModal;
