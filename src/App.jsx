import React, { useState } from "react";
import { Package, TrendingUp, AlertTriangle, CheckCircle, Activity, Cpu, RefreshCw } from "lucide-react";

// Mock database for the UI to display the SKUs available
const inventoryData = [
  { sku: "SKU-1001", name: "Wireless Earbuds Basic", stock: 150, reorder: 500, category: "Electronics", trend: 1.4, baseDemand: 12000, orderCost: 250, holdingCost: 5 },
  { sku: "SKU-1002", name: "USB-C Cables (3-Pack)", stock: 850, reorder: 1000, category: "Electronics", trend: 1.0, baseDemand: 50000, orderCost: 100, holdingCost: 0.5 },
  { sku: "SKU-2001", name: "Eco-Friendly Yoga Mat", stock: 80, reorder: 150, category: "Wellness", trend: 0.9, baseDemand: 5000, orderCost: 400, holdingCost: 2.5 },
  { sku: "SKU-3003", name: "Stanley Quencher (Pink)", stock: 5, reorder: 100, category: "Viral/Trending", trend: 3.5, baseDemand: 8000, orderCost: 600, holdingCost: 4 },
  { sku: "SKU-3001", name: "Vintage Graphic Tee", stock: 500, reorder: 200, category: "Apparel", trend: 0.6, baseDemand: 15000, orderCost: 150, holdingCost: 1.5 },
  { sku: "SKU-4001", name: "Pro Cordless Drill", stock: 45, reorder: 30, category: "Hardware", trend: 1.05, baseDemand: 2000, orderCost: 800, holdingCost: 12 }
];

// IMPORTANT: Change this string to your live Render API URL!
// Example: 'https://aetherflow-api-abc1.onrender.com'
const API_URL = 'https://aetherflow-api.onrender.com';

export default function AetherFlowDashboard() {
  const [selectedSku, setSelectedSku] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  const runAgentAnalysis = async (sku) => {
    setSelectedSku(sku);
    setIsAnalyzing(true);
    setResult(null);
    setAnalysisStep(1);
    setApiError(null);

    // Visual delays for the UI steps
    setTimeout(() => setAnalysisStep(2), 1500);
    setTimeout(() => setAnalysisStep(3), 3000);
    
    try {
      // MAKE REAL NETWORK REQUEST TO PYTHON BACKEND
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: sku.sku })
      });

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }

      const data = await response.json();
      
      setTimeout(() => {
        setAnalysisStep(4);
        setResult(data.output || "Analysis completed successfully.");
        setIsAnalyzing(false);
      }, 4500);

    } catch (error) {
      setTimeout(() => {
        setAnalysisStep(4);
        setApiError(`Connection Error: Make sure your Python API is running on ${API_URL}`);
        // Fallback simulated result for demonstration if API is offline
        const mockDemand = sku.baseDemand * sku.trend;
        let finalAction = "";
        
        if (sku.stock < sku.reorder) {
            const eoq = Math.floor(Math.sqrt((2 * mockDemand * sku.orderCost) / sku.holdingCost));
            finalAction = `The current stock for ${sku.sku} ("${sku.name}") is ${sku.stock} units, which is below the reorder point of ${sku.reorder} units. After analyzing social trends, a demand multiplier of ${sku.trend} was applied, and the Dynamic EOQ was calculated to be ${eoq} units. A purchase order for ${eoq} units has been successfully drafted and is pending human approval.`;
        } else {
            finalAction = `The current stock for ${sku.sku} ("${sku.name}") is ${sku.stock} units. This is currently above the reorder point of ${sku.reorder}. No purchase order is required at this time.`;
        }
        
        setResult(`(Fallback Mode - API Offline) ${finalAction}`);
        setIsAnalyzing(false);
      }, 4500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-slate-300 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4">
            <Cpu className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">AetherFlow AI</h1>
          <p className="text-slate-400 text-lg">Autonomous Supply Chain Agent</p>
          <div className="flex items-center justify-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 inline-flex px-3 py-1 rounded-full border border-emerald-400/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Agent Online
          </div>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
            <Package className="w-5 h-5 text-indigo-400" />
            Select SKU to Analyze
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryData.map((item) => (
              <button
                key={item.sku}
                onClick={() => !isAnalyzing && runAgentAnalysis(item)}
                disabled={isAnalyzing}
                className={`text-left p-5 rounded-xl border transition-all duration-200 group relative overflow-hidden
                  ${selectedSku?.sku === item.sku 
                    ? 'bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/50' 
                    : 'bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-800/50'}
                  ${isAnalyzing && selectedSku?.sku !== item.sku ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs font-mono text-indigo-400 mb-1">{item.sku}</div>
                    <div className="font-medium text-slate-200 group-hover:text-white transition-colors">{item.name}</div>
                  </div>
                  {item.stock < item.reorder ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-slate-500 flex items-center gap-1"><Package className="w-3 h-3"/> Stock</div>
                    <div className="text-slate-300 font-medium">{item.stock} / {item.reorder}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-500 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Category</div>
                    <div className="text-slate-300 font-medium">{item.category}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {(isAnalyzing || result) && (
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden mt-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
              {isAnalyzing && (
                <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
                     style={{ width: `${(analysisStep / 4) * 100}%` }} />
              )}
            </div>

            <h2 className="text-xl font-semibold flex items-center gap-2 mb-8 text-white">
              <Activity className="w-5 h-5 text-indigo-400" />
              Agent Analysis Trace
            </h2>

            <div className="space-y-8">
              <div className={`transition-all duration-500 ${analysisStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${analysisStep > 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400 animate-pulse'}`}>
                    1
                  </div>
                  <h3 className="text-lg font-medium text-slate-200">Sensing Internal Inventory</h3>
                </div>
                <div className="ml-11 pl-4 border-l-2 border-gray-800 text-slate-400">
                  Checking ERP system for {selectedSku?.sku}...
                  {analysisStep > 1 && (
                    <div className="mt-2 text-emerald-400">
                      Current Stock: {selectedSku?.stock} | Reorder Point: {selectedSku?.reorder}
                    </div>
                  )}
                </div>
              </div>

              <div className={`transition-all duration-500 ${analysisStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${analysisStep > 2 ? 'bg-emerald-500/20 text-emerald-400' : analysisStep === 2 ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : 'bg-gray-800 text-gray-500'}`}>
                    2
                  </div>
                  <h3 className="text-lg font-medium text-slate-200">Checking External Market Trends</h3>
                </div>
                <div className="ml-11 pl-4 border-l-2 border-gray-800 text-slate-400">
                  {analysisStep === 2 ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                      Agent is scanning social sentiment APIs...
                    </div>
                  ) : analysisStep > 2 && (
                    <div className="text-emerald-400 flex items-center gap-2">
                      Trend Multiplier Identified: {selectedSku?.trend}x
                    </div>
                  )}
                </div>
              </div>

              <div className={`transition-all duration-500 ${analysisStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${analysisStep > 3 ? 'bg-emerald-500/20 text-emerald-400' : analysisStep === 3 ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : 'bg-gray-800 text-gray-500'}`}>
                    3
                  </div>
                  <h3 className="text-lg font-medium text-slate-200">Thinking: Dynamic EOQ</h3>
                </div>
                <div className="ml-11 pl-4 border-l-2 border-gray-800 text-slate-400">
                  {analysisStep === 3 ? (
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 animate-bounce text-indigo-400" />
                      Consulting AetherFlow LLM via LangChain...
                    </div>
                  ) : analysisStep > 3 && (
                    <div className="text-emerald-400">
                      Calculations complete. Formulating final action.
                    </div>
                  )}
                </div>
              </div>

              <div className={`transition-all duration-500 ${analysisStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${result ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-500'}`}>
                    4
                  </div>
                  <h3 className="text-lg font-medium text-white">Final Action (Live from Python)</h3>
                </div>
                {apiError && (
                  <div className="ml-11 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 mb-4 text-sm flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p>{apiError}. Falling back to visual simulation mode.</p>
                  </div>
                )}
                <div className="ml-11 p-6 bg-gray-950 border border-gray-800 rounded-xl">
                  {result ? (
                    <p className="text-slate-300 leading-relaxed">
                      {result}
                    </p>
                  ) : (
                    <div className="h-6 bg-gray-800/50 animate-pulse rounded w-3/4"></div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
