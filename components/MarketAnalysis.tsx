import React, { useState } from 'react';
import { Bot, Sparkles, RefreshCw, Settings, Key } from 'lucide-react';
import { ScrapPrice, MetalSpotPrice } from '../types';
import { generateMarketAnalysis } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface MarketAnalysisProps {
  prices: ScrapPrice[];
  spotPrices: MetalSpotPrice[];
}

const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ prices, spotPrices }) => {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');

  const handleGenerate = async () => {
    setLoading(true);
    // Pass the custom API key if the user has entered one
    const result = await generateMarketAnalysis(prices, spotPrices, apiKey);
    setReport(result);
    setLoading(false);
    setHasLoaded(true);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl text-white shadow-xl overflow-hidden">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Bot className="text-cyan-300" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Market Analyst</h2>
            <p className="text-xs text-indigo-200">Powered by Gemini 2.5</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-indigo-200'}`}
            title="API Settings"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-800 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                {hasLoaded ? 'Regenerate' : 'Generate'}
              </>
            )}
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-indigo-950/50 p-4 border-b border-white/10 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-indigo-200">
            <Key size={16} />
            <label>Custom Gemini API Key</label>
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your API key here (starts with AIza...)"
            className="w-full px-4 py-2 bg-indigo-950 border border-indigo-700/50 rounded-lg text-white text-sm placeholder:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          />
          <p className="text-xs text-indigo-400 mt-2">
            Leave blank if you have configured the API_KEY environment variable. Your key is not stored permanently.
          </p>
        </div>
      )}

      <div className="p-8 min-h-[300px]">
        {!hasLoaded && !loading ? (
          <div className="h-full flex flex-col items-center justify-center text-indigo-300 opacity-60">
            <Sparkles size={48} className="mb-4" />
            <p className="text-center max-w-md">
              Click "Generate" to have the AI analyst compare local scrap prices against global spot markets and provide actionable insights.
            </p>
          </div>
        ) : loading ? (
           <div className="space-y-4 animate-pulse">
             <div className="h-4 bg-white/10 rounded w-3/4"></div>
             <div className="h-4 bg-white/10 rounded w-1/2"></div>
             <div className="h-4 bg-white/10 rounded w-5/6"></div>
             <div className="h-32 bg-white/5 rounded w-full mt-6"></div>
           </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            {/* We render markdown safely */}
             <ReactMarkdown>{report}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketAnalysis;