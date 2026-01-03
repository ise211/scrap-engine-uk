import React, { useState } from 'react';
import { ScrapPrice, MetalSpotPrice } from '../types';
import { ArrowUp, ArrowDown, Minus, Download } from 'lucide-react';

interface PriceTableProps {
  prices: ScrapPrice[];
  spotPrices: MetalSpotPrice[];
  onExport: () => void;
}

const PriceTable: React.FC<PriceTableProps> = ({ prices, spotPrices, onExport }) => {
  const [filter, setFilter] = useState('');

  const filteredPrices = prices.filter(p => 
    p.material.toLowerCase().includes(filter.toLowerCase()) || 
    p.location.toLowerCase().includes(filter.toLowerCase())
  );

  const getSpotPriceReference = (materialName: string) => {
    // Simple fuzzy matching for demo purposes
    const lower = materialName.toLowerCase();
    if (lower.includes('copper') || lower.includes('wire') || lower.includes('tube')) return spotPrices.find(s => s.metal === 'Copper');
    if (lower.includes('brass') || lower.includes('gun')) return spotPrices.find(s => s.metal === 'Copper'); // Often pegged to copper/zinc
    if (lower.includes('alu')) return spotPrices.find(s => s.metal === 'Aluminium');
    if (lower.includes('lead') || lower.includes('batter')) return spotPrices.find(s => s.metal === 'Lead');
    if (lower.includes('stainless')) return spotPrices.find(s => s.metal === 'Nickel');
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Live Market Feed</h2>
          <p className="text-sm text-gray-500">Aggregated prices from UK yards (Simulated)</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search material or location..."
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <button 
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
            <tr>
              <th className="px-6 py-4">Material</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4 text-right">Price (£/t)</th>
              <th className="px-6 py-4 text-right">Price (£/kg)</th>
              <th className="px-6 py-4 text-center">Trend</th>
              <th className="px-6 py-4 text-right">vs Spot (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPrices.map((price) => {
              const spotRef = getSpotPriceReference(price.material);
              const percentageOfSpot = spotRef 
                ? Math.round((price.pricePerKg / spotRef.priceGbpPerKg) * 100) 
                : null;

              return (
                <tr key={price.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{price.material}</td>
                  <td className="px-6 py-4">{price.location}</td>
                  <td className="px-6 py-4 text-right font-mono text-gray-600">
                    £{(price.pricePerKg * 1000).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">
                    £{price.pricePerKg.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      {price.trend === 'up' && <ArrowUp size={16} className="text-green-500" />}
                      {price.trend === 'down' && <ArrowDown size={16} className="text-red-500" />}
                      {price.trend === 'flat' && <Minus size={16} className="text-gray-400" />}
                      <span className={`text-xs font-medium ${
                        price.trend === 'up' ? 'text-green-600' : 
                        price.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {Math.abs(price.changePercentage)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {percentageOfSpot ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        percentageOfSpot > 80 ? 'bg-green-100 text-green-700' : 
                        percentageOfSpot > 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {percentageOfSpot}%
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filteredPrices.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No materials found matching your search.
        </div>
      )}
    </div>
  );
};

export default PriceTable;