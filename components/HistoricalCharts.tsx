import React, { useState, useMemo } from 'react';
import { EU_RECYCLE_DATA } from '../services/euRecycleData';
import { Search, History, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { ScrapPrice } from '../types';

// Helper to generate deterministic dates and prices for the last 7 days
const generateHistoryData = (item: ScrapPrice) => {
  const days = 7;
  const data = [];
  const today = new Date();
  
  // Create a seed from the ID string for deterministic random numbers
  let seed = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  let currentPrice = item.pricePerKg;

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.unshift({
      date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      price: currentPrice
    });

    // Walk price backwards based on trend to ensure the "current" price matches the end of the chart
    const volatility = 0.02 + (random() * 0.03); // 2-5% volatility
    let change = (random() - 0.5) * volatility;

    // If trend is UP, yesterday needs to be LOWER, so we subtract less or add.
    // Mathematical reverse engineering of "growth":
    // If today is 100 and trend is UP, yesterday was maybe 98. 
    // So walking back: current * (1 - change). 
    
    if (item.trend === 'up') change += 0.01; 
    if (item.trend === 'down') change -= 0.01;

    currentPrice = currentPrice * (1 - change);
  }
  return data;
};

// Simple icon wrapper to avoid importing MapPin from lucide in the sub-component if not passed
const MapPinIcon = ({ size }: { size: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ChartCard: React.FC<{ item: ScrapPrice }> = ({ item }) => {
  const history = useMemo(() => generateHistoryData(item), [item.id, item.pricePerKg]);
  
  // Dimensions
  const width = 300;
  const height = 120;
  const padding = 20;

  // Scales
  const prices = history.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.99;
  const maxPrice = Math.max(...prices) * 1.01;
  const range = maxPrice - minPrice || 1;

  // Path Generation
  const points = history.map((d, i) => {
    const x = padding + (i / (history.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.price - minPrice) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  // Area Path (for gradient)
  const areaPoints = `
    ${padding},${height - padding} 
    ${points} 
    ${width - padding},${height - padding}
  `;

  const color = item.trend === 'up' ? '#10b981' : item.trend === 'down' ? '#ef4444' : '#64748b';
  const gradientId = `grad-${item.id}`;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-800">{item.material}</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <MapPinIcon size={10} /> {item.location}
          </p>
        </div>
        <div className={`text-right ${item.trend === 'up' ? 'text-green-600' : item.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
          <div className="text-xl font-mono font-bold">£{item.pricePerKg.toFixed(2)}</div>
          <div className="text-xs font-medium flex items-center justify-end gap-1">
            {item.trend === 'up' && <TrendingUp size={12} />}
            {item.trend === 'down' && <TrendingDown size={12} />}
            {item.trend === 'flat' && <Minus size={12} />}
            {item.changePercentage > 0 ? '+' : ''}{item.changePercentage}%
          </div>
        </div>
      </div>

      <div className="relative h-[120px] w-full flex justify-center">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
          <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
          <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#f1f5f9" strokeWidth="1" />

          {/* Area Fill */}
          <polygon points={areaPoints} fill={`url(#${gradientId})`} />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {history.map((d, i) => {
             const x = padding + (i / (history.length - 1)) * (width - 2 * padding);
             const y = height - padding - ((d.price - minPrice) / range) * (height - 2 * padding);
             return (
               <circle key={i} cx={x} cy={y} r="3" fill="white" stroke={color} strokeWidth="2" />
             );
          })}
        </svg>
      </div>

      <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-medium px-2">
        <span>{history[0].date}</span>
        <span>{history[history.length - 1].date}</span>
      </div>
    </div>
  );
};

const HistoricalCharts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter only unique materials per location to show a representative sample, 
  // or allow searching everything.
  const filteredData = EU_RECYCLE_DATA.filter(item => 
    item.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 24); // Limit to 24 items for performance in this demo view

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <History className="text-purple-600" />
              7-Day Historical Trends
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Visualizing price movements over the last week across UK regions.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter by material or city..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredData.map(item => (
          <ChartCard key={item.id} item={item} />
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-20" />
          <p>No data found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default HistoricalCharts;