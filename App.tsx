import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Calculator as CalcIcon, 
  TrendingUp, 
  Menu, 
  X,
  Coins,
  Map,
  Timer,
  RotateCcw,
  History,
  Code
} from 'lucide-react';
import { MOCK_SCRAP_PRICES, fetchMockData } from './services/mockData';
import { fetchLiveSpotPrices } from './services/livePricing';
import { exportToExcel } from './services/excelService';
import { ScrapPrice, MetalSpotPrice, AppView, CalculatorItem } from './types';

// Components
import PriceTable from './components/PriceTable';
import Calculator from './components/Calculator';
import MarketAnalysis from './components/MarketAnalysis';
import RegionalPrices from './components/RegionalPrices';
import HistoricalCharts from './components/HistoricalCharts';
import PythonScriptModal from './components/PythonScriptModal';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prices, setPrices] = useState<ScrapPrice[]>([]);
  const [spotPrices, setSpotPrices] = useState<MetalSpotPrice[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Timer State
  const [nextUpdate, setNextUpdate] = useState<number>(Date.now() + REFRESH_INTERVAL_MS);
  const [timeRemaining, setTimeRemaining] = useState<string>('10:00');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State
  const [scriptModalOpen, setScriptModalOpen] = useState(false);

  const loadData = useCallback(async (isAutoRefresh = false) => {
    if (!isAutoRefresh) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      // Hybrid Approach: Fetch Mock Scrap Prices (simulating yard data) AND Live Spot Prices
      const [scrapedData, spotData] = await Promise.all([
        fetchMockData(MOCK_SCRAP_PRICES),
        fetchLiveSpotPrices()
      ]);
      setPrices(scrapedData);
      setSpotPrices(spotData);
      
      // Reset timer
      setNextUpdate(Date.now() + REFRESH_INTERVAL_MS);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial Data Load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto Refresh Interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadData(true);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [loadData]);

  // Countdown Timer
  useEffect(() => {
    const timerId = setInterval(() => {
      const now = Date.now();
      const diff = nextUpdate - now;
      
      if (diff <= 0) {
        setTimeRemaining('00:00');
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [nextUpdate]);

  const handleExportPrices = () => {
    exportToExcel(prices, [], 0);
  };

  const handleExportReceipt = (items: CalculatorItem[], total: number) => {
    exportToExcel(prices, items, total);
  };

  const NavItem = ({ label, icon: Icon, targetView }: { label: string, icon: any, targetView: AppView }) => (
    <button
      onClick={() => {
        setView(targetView);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
        view === targetView 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      <PythonScriptModal isOpen={scriptModalOpen} onClose={() => setScriptModalOpen(false)} />
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-full z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Coins size={28} />
            <span className="font-bold text-xl tracking-tight text-white">ScrapEngine</span>
          </div>
          <p className="text-xs text-slate-500">Professional Pricing Tool</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem label="Live Prices" icon={LayoutDashboard} targetView={AppView.DASHBOARD} />
          <NavItem label="Regional Database" icon={Map} targetView={AppView.REGIONAL} />
          <NavItem label="Historical Trends" icon={History} targetView={AppView.HISTORY} />
          <NavItem label="Load Calculator" icon={CalcIcon} targetView={AppView.CALCULATOR} />
          <NavItem label="AI Analysis" icon={TrendingUp} targetView={AppView.ANALYSIS} />
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-400 uppercase font-bold mb-2">Market Status</p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-green-400">Markets Open</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">API: MetalPriceAPI Live</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 transition-all duration-300">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-2">
             <Coins size={24} className="text-blue-400" />
             <span className="font-bold text-lg">ScrapEngine</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setScriptModalOpen(true)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <Code size={20} />
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 p-4 absolute w-full z-20 shadow-xl border-b border-slate-700">
            <nav className="space-y-2">
              <NavItem label="Live Prices" icon={LayoutDashboard} targetView={AppView.DASHBOARD} />
              <NavItem label="Regional Database" icon={Map} targetView={AppView.REGIONAL} />
              <NavItem label="Historical Trends" icon={History} targetView={AppView.HISTORY} />
              <NavItem label="Load Calculator" icon={CalcIcon} targetView={AppView.CALCULATOR} />
              <NavItem label="AI Analysis" icon={TrendingUp} targetView={AppView.ANALYSIS} />
            </nav>
          </div>
        )}

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Fetching live market data...</p>
            </div>
          ) : (
            <>
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {view === AppView.DASHBOARD && 'Live Scrap Prices'}
                    {view === AppView.REGIONAL && 'Regional Price Database'}
                    {view === AppView.HISTORY && 'Price Trends (7 Days)'}
                    {view === AppView.CALCULATOR && 'Van Load Calculator'}
                    {view === AppView.ANALYSIS && 'Market Intelligence'}
                  </h1>
                  <p className="text-gray-500 mt-1">
                    {view === AppView.DASHBOARD && `Updated: ${new Date().toLocaleDateString()}`}
                    {view === AppView.REGIONAL && 'Sourced from euRecycleInfo.com'}
                    {view === AppView.HISTORY && 'Historical volatility analysis'}
                    {view === AppView.CALCULATOR && 'Estimate value based on current yard averages'}
                    {view === AppView.ANALYSIS && 'AI-powered insights from Gemini'}
                  </p>
                </div>

                {/* Right Top Controls */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setScriptModalOpen(true)}
                    className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-slate-800 transition-colors"
                  >
                    <Code size={16} className="text-blue-400" />
                    <span className="text-sm font-medium">Get Script</span>
                  </button>

                  {/* Refresh Timer Widget (Visible on Dashboard) */}
                  {view === AppView.DASHBOARD && (
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center gap-2 text-sm font-mono text-slate-600 min-w-[140px]">
                        <Timer size={16} className="text-blue-500" />
                        <span>Update: {timeRemaining}</span>
                      </div>
                      <div className="h-4 w-px bg-gray-200"></div>
                      <button 
                        onClick={() => loadData(false)} 
                        disabled={isRefreshing || loading}
                        className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${isRefreshing ? 'animate-spin text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                        title="Refresh Now"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {view === AppView.DASHBOARD && (
                <div className="space-y-6">
                  {/* Spot Ticker - Hybrid Live Data */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                    {spotPrices.map((spot) => (
                       <div key={spot.metal} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{spot.metal}</p>
                          <div className="mt-1">
                             <p className="text-base font-mono font-bold text-gray-800">£{spot.priceGbpPerKg.toFixed(2)}</p>
                             <p className="text-[10px] text-gray-400">/kg Spot</p>
                          </div>
                       </div>
                    ))}
                  </div>
                  <PriceTable prices={prices} spotPrices={spotPrices} onExport={handleExportPrices} />
                </div>
              )}

              {view === AppView.REGIONAL && (
                <RegionalPrices />
              )}

              {view === AppView.HISTORY && (
                <HistoricalCharts />
              )}

              {view === AppView.CALCULATOR && (
                <Calculator prices={prices} onExport={handleExportReceipt} />
              )}

              {view === AppView.ANALYSIS && (
                <MarketAnalysis prices={prices} spotPrices={spotPrices} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;