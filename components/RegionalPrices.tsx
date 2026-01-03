import React, { useState } from 'react';
import { EU_RECYCLE_DATA } from '../services/euRecycleData';
import { MapPin, Search, Calendar, Tag, Filter, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { ScrapPrice } from '../types';

// Simple Sparkline Component
const Sparkline = ({ price, trend, id }: { price: number, trend: 'up' | 'down' | 'flat', id: string }) => {
  // Generate consistent fake history based on ID
  const generateHistory = () => {
    let seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rand = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const history = [price];
    let current = price;
    
    // Generate 6 previous points walking backwards
    for (let i = 0; i < 6; i++) {
        const volatility = 0.03; 
        let change = (rand() - 0.5) * volatility;
        
        // Bias based on trend to ensure visual matches the trend indicator
        if (trend === 'up') change += 0.015;  // Previous was lower (current is higher) -> wait, walking backwards: price = current / (1+change). 
                                              // To make previous lower, we need positive growth to reach current. 
                                              // So if trend is UP, yesterday was lower.
        if (trend === 'down') change -= 0.015; // Previous was higher
        
        current = current * (1 - change);
        history.unshift(current);
    }
    return history;
  };

  const data = generateHistory();
  const width = 60;
  const height = 20;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height; 
    return `${x},${y}`;
  }).join(' ');

  const color = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#94a3b8';

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle 
          cx={width} 
          cy={height - ((data[data.length - 1] - min) / range) * height} 
          r="2" 
          fill={color} 
        />
      </svg>
    </div>
  );
};

const RegionalPrices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Extract unique cities
  const cities = ['All', ...Array.from(new Set(EU_RECYCLE_DATA.map(item => item.location))).sort()];

  // Helper to categorize materials for filtering and sorting
  const getCategory = (material: string): string => {
    const mat = material.toLowerCase();
    if (mat.includes('copper') || mat.includes('wire')) return 'Copper';
    if (mat.includes('alu')) return 'Aluminium';
    if (mat.includes('brass') || mat.includes('gun')) return 'Brass';
    if (mat.includes('lead') || mat.includes('batter')) return 'Lead';
    if (mat.includes('steel') || mat.includes('iron')) return 'Steel';
    if (mat.includes('motor')) return 'Motors';
    return 'Other';
  };

  const categories = ['All', 'Copper', 'Aluminium', 'Brass', 'Lead', 'Steel', 'Motors', 'Other'];

  // 1. Filter Data
  const filteredData = EU_RECYCLE_DATA.filter(item => {
    const matchesSearch = item.material.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'All' || item.location === selectedCity;
    const matchesCategory = selectedCategory === 'All' || getCategory(item.material) === selectedCategory;
    return matchesSearch && matchesCity && matchesCategory;
  });

  // 2. Sort Data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;
    let valA: string | number;
    let valB: string | number;

    // Handle computed columns specifically
    if (key === 'category') {
      valA = getCategory(a.material);
      valB = getCategory(b.material);
    } else if (key === 'pricePerTonne') {
      valA = a.pricePerKg; // Sorting by kg is strictly monotonic with tonne
      valB = b.pricePerKg;
    } else {
      // Handle standard properties
      valA = a[key as keyof ScrapPrice] as string | number;
      valB = b[key as keyof ScrapPrice] as string | number;
    }

    // Convert strings to lowercase for case-insensitive sorting
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) {
      return direction === 'asc' ? -1 : 1;
    }
    if (valA > valB) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    }
    return <ArrowUpDown size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
  };

  const SortableHeader = ({ label, sortKey, alignRight = false }: { label: string, sortKey: string, alignRight?: boolean }) => (
    <th 
      className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors group select-none ${alignRight ? 'text-right' : 'text-left'}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className={`flex items-center gap-2 ${alignRight ? 'justify-end' : 'justify-start'}`}>
        {label}
        {renderSortIcon(sortKey)}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 p-6 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MapPin className="text-blue-400" />
          UK Regional Price Database
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Comprehensive price list by city. Data sourced and aggregated from euRecycleInfo.com
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search material..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            {cities.map(city => (
              <option key={city} value={city}>{city === 'All' ? 'All Locations' : city}</option>
            ))}
          </select>

          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
             {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Metals' : cat}</option>
            ))}
          </select>
        </div>
        
        <div className="ml-auto text-xs text-gray-500 flex items-center gap-1">
          <Filter size={12} />
          Showing {sortedData.length} entries
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-white text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
            <tr>
              <SortableHeader label="Location" sortKey="location" />
              <SortableHeader label="Material" sortKey="material" />
              <th className="px-6 py-4">Trend (7d)</th>
              <SortableHeader label="Category" sortKey="category" />
              <SortableHeader label="Date" sortKey="date" />
              <SortableHeader label="Price (£/Tonne)" sortKey="pricePerTonne" alignRight />
              <SortableHeader label="Price (£/kg)" sortKey="pricePerKg" alignRight />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedData.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="font-medium text-gray-900">{item.location}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-800">{item.material}</td>
                <td className="px-6 py-4">
                  <Sparkline price={item.pricePerKg} trend={item.trend} id={item.id} />
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    <Tag size={10} />
                    {getCategory(item.material)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                   <Calendar size={14} className="text-gray-400" />
                   {item.date}
                </td>
                <td className="px-6 py-4 text-right font-mono text-slate-600">
                  £{(item.pricePerKg * 1000).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </td>
                <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                  £{item.pricePerKg.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedData.length === 0 && (
        <div className="p-12 text-center text-gray-400">
          <p>No prices found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default RegionalPrices;