import React, { useState, useEffect } from 'react';
import { ScrapPrice, CalculatorItem } from '../types';
import { Plus, Trash2, Truck, Calculator as CalcIcon, Save, RotateCcw, TrendingUp, DollarSign } from 'lucide-react';

interface CalculatorProps {
  prices: ScrapPrice[];
  onExport: (items: CalculatorItem[], total: number) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ prices, onExport }) => {
  const [items, setItems] = useState<CalculatorItem[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  
  // Trader Mode State
  const [traderMode, setTraderMode] = useState(false);
  const [marginPercent, setMarginPercent] = useState<number>(20);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('scrapEngine_calcItems');
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (e) {
        console.error("Failed to load saved calculator items");
      }
    }
  }, []);

  // Save to LocalStorage whenever items change
  useEffect(() => {
    localStorage.setItem('scrapEngine_calcItems', JSON.stringify(items));
  }, [items]);

  const handleAddItem = () => {
    if (!selectedMaterial || !weight) return;
    
    const newItem: CalculatorItem = {
      id: Math.random().toString(36).substr(2, 9),
      materialId: selectedMaterial,
      weightKg: parseFloat(weight),
    };

    setItems([...items, newItem]);
    setSelectedMaterial('');
    setWeight('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear the current load?')) {
      setItems([]);
    }
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => {
      const price = prices.find(p => p.id === item.materialId)?.pricePerKg || 0;
      return acc + (price * item.weightKg);
    }, 0);
  };

  const totalValue = calculateTotal();
  
  // Trader Mode Calculations
  const buyPriceTotal = totalValue * (1 - (marginPercent / 100));
  const profitTotal = totalValue - buyPriceTotal;

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${traderMode ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
            {traderMode ? <DollarSign size={24} /> : <Truck size={24} />}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{traderMode ? 'Trader Mode' : 'Van Load Mode'}</h3>
            <p className="text-xs text-gray-500">
              {traderMode ? 'Calculate buying prices & profit margins' : 'Calculate total value of your load'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Enable Trader Tools</span>
          <button 
            onClick={() => setTraderMode(!traderMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${traderMode ? 'bg-purple-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${traderMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="text-blue-600" size={20} />
            Add Material
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
              >
                <option value="">Select Material...</option>
                {prices.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.material} — Yard Price: £{p.pricePerKg.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 50"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
            </div>

            {traderMode && selectedMaterial && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-700 font-medium">Est. Yard Value:</span>
                  <span className="font-bold text-purple-900">
                    £{((prices.find(p => p.id === selectedMaterial)?.pricePerKg || 0) * (parseFloat(weight) || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Max Offer ({100 - marginPercent}%):</span>
                  <span className="font-bold text-gray-800">
                     £{((prices.find(p => p.id === selectedMaterial)?.pricePerKg || 0) * (parseFloat(weight) || 0) * (1 - marginPercent/100)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleAddItem}
              disabled={!selectedMaterial || !weight}
              className={`w-full py-2 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                traderMode 
                  ? 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300' 
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
              } disabled:cursor-not-allowed`}
            >
              <Plus size={18} />
              Add to List
            </button>
          </div>

          {traderMode && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                <span>Target Profit Margin</span>
                <span className="text-purple-600 font-bold">{marginPercent}%</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="50" 
                step="5" 
                value={marginPercent}
                onChange={(e) => setMarginPercent(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0% (Break Even)</span>
                <span>50% (High Profit)</span>
              </div>
            </div>
          )}
        </div>

        {/* Manifest Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <CalcIcon className="text-gray-600" size={20} />
              {traderMode ? 'Trade Calculator' : 'Load Manifest'}
            </h3>
            <div className="flex gap-2">
               {items.length > 0 && (
                 <>
                   <button 
                     onClick={handleClearAll}
                     className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                     title="Clear All"
                   >
                     <RotateCcw size={18} />
                   </button>
                   <button 
                     onClick={() => onExport(items, totalValue)}
                     className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md text-sm font-medium transition-colors"
                   >
                     <Save size={16} />
                     Export
                   </button>
                 </>
               )}
            </div>
          </div>

          <div className="flex-grow">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <Truck size={48} className="mb-2 opacity-20" />
                <p>List is empty.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map(item => {
                  const material = prices.find(p => p.id === item.materialId);
                  const lineTotal = (material?.pricePerKg || 0) * item.weightKg;
                  const buyPrice = lineTotal * (1 - marginPercent/100);
                  
                  return (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{material?.material || 'Unknown'}</p>
                        <div className="flex gap-2 text-xs">
                           <span className="text-gray-500">{item.weightKg} kg @ £{material?.pricePerKg.toFixed(2)}</span>
                           {traderMode && (
                             <span className="text-purple-600 font-medium">• Offer Max: £{(buyPrice / item.weightKg).toFixed(2)}/kg</span>
                           )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="block font-mono font-bold text-gray-700">£{lineTotal.toFixed(2)}</span>
                        </div>
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            {traderMode ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-bold">Total Weight</p>
                  <p className="text-lg font-semibold text-gray-700">{items.reduce((acc, curr) => acc + curr.weightKg, 0).toFixed(1)} kg</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                   <p className="text-xs text-purple-600 uppercase font-bold">Max Buy Price</p>
                   <p className="text-xl font-bold text-purple-700">£{buyPriceTotal.toFixed(2)}</p>
                   <p className="text-[10px] text-purple-400">What you pay</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                   <p className="text-xs text-green-600 uppercase font-bold">Est. Profit</p>
                   <p className="text-xl font-bold text-green-700">£{profitTotal.toFixed(2)}</p>
                   <p className="text-[10px] text-green-400">Yard Value: £{totalValue.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-500">Total Weight</p>
                  <p className="text-xl font-semibold text-gray-700">
                    {items.reduce((acc, curr) => acc + curr.weightKg, 0).toFixed(1)} kg
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Yard Value</p>
                  <p className="text-4xl font-bold text-green-600 tracking-tight">
                    £{totalValue.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;