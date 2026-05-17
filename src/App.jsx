import React, { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Cpu,
  ArrowRight,
  RefreshCw,
  Loader2
} from 'lucide-react';

const API_URL = 'https://aetherflow-api.onrender.com';

export default function AetherFlowDashboard() {
  const [inventoryData, setInventoryData] = useState([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [inventoryError, setInventoryError] = useState(null);
  
  const [selectedSku, setSelectedSku] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [results, setResults] = useState(null);

  // Fetch the inventory data from the Python Backend when the dashboard loads
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/inventory`);
        
        if (!response.ok) throw new Error("Failed to fetch inventory from server");
        
        const json = await response.json();
        if (json.status === "success") {
          setInventoryData(json.data);
        } else {
          throw new Error(json.message || "Unknown API error");
        }
      } catch (error) {
        console.error("Inventory Load Error:", error);
        setInventoryError(`Could not load inventory database. Make sure your FastAPI server is running on ${API_URL}`);
      } finally {
        setIsLoadingInventory(false);
      }
    };
    
    fetchInventory();
  }, []);

  const runAgentAnalysis = async (sku) => {
    setIsAnalyzing(true);
    setAnalysisStep(1);
    setResults(null);

    // Advance UI steps to visually simulate agent "thinking" phases while we wait for the network
    const stepTimer = setInterval(() => {
      setAnalysisStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 2000);

    try {
      // MAKE REAL NETWORK REQUEST TO PYTHON BACKEND
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku })
      });

      const data = await response.json();
      
      // Stop the visual timer and jump to the final result step
      clearInterval(stepTimer);
      setAnalysisStep(4); 

      // Handle the response from LangChain
      if (data.status === 'success') {
        setResults({
          success: true,
          action: data.agent_output
        });
      } else {
        setResults({
          success: false,
          action: `Error from Agent: ${data.message}`
        });
      }
    } catch (error) {
      clearInterval(stepTimer);
      setAnalysisStep(4);
      setResults({
        success: false,
        action: `Connection Error: Make sure your FastAPI server is running on ${API_URL}. Detail: ${error.message}`
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectedItem = inventoryData.find(item => item.sku === selectedSku);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">AetherFlow AI</h1>
              <p className="text-sm text-slate-400">Autonomous Supply Chain Agent</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Agent Online
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: SKU Selection */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              Select SKU to Analyze
            </h2>
            
            {isLoadingInventory ? (
              <div className="flex flex-col items-center justify-center py-12 border border-slate-800 rounded-xl bg-slate-900/50">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400">Syncing with ERP Database...</p>
              </div>
            ) : inventoryError ? (
              <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>{inventoryError}</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {inventoryData.map((item) => {
                  const isSelected = selectedSku === item.sku;
                  const isLowStock = item.current_stock <= item.reorder_point;
                  
                  return (
                    <button
                      key={item.sku}
                      onClick={() => {
                        setSelectedSku(item.sku);
                        runAgentAnalysis(item.sku);
                      }}
                      disabled={isAnalyzing}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                        isSelected 
                          ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                          : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                      } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-mono text-blue-400 mb-1 block">{item.sku}</span>
                          <h3 className="font-medium text-slate-100">{item.name}</h3>
                        </div>
                        {isLowStock ? (
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm mt-3">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Package className="w-4 h-4" />
                          <span className={isLowStock ? "text-amber-400 font-medium" : ""}>
                            {item.current_stock} / {item.reorder_point}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Activity className="w-4 h-4" />
                          <span>{item.category}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Column: Agent Workflow & Results */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full min-h-[500px] flex flex-col">
              
              {!selectedSku && !isAnalyzing && !results ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <Cpu className="w-16 h-16 opacity-20" />
                  <p>Select an SKU from the left to trigger the AI Agent.</p>
                </div>
              ) : null}

              {(isAnalyzing || results) && selectedItem && (
                <div className="space-y-8 flex-1">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Agent Analysis Trace
                  </h2>

                  {/* Step 1 */}
                  <div className={`flex gap-4 transition-opacity duration-500 ${analysisStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="mt-1"><Package className={`w-5 h-5 ${analysisStep === 1 && isAnalyzing ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`} /></div>
                    <div>
                      <h4 className="font-medium text-slate-200">1. Sensing Internal Inventory</h4>
                      {analysisStep >= 1 && (
                        <p className="text-sm text-slate-400 mt-1">
                          Current Stock: <span className="text-white">{selectedItem.current_stock}</span> | 
                          Reorder Point: <span className="text-white">{selectedItem.reorder_point}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className={`flex gap-4 transition-opacity duration-500 ${analysisStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="mt-1"><TrendingUp className={`w-5 h-5 ${analysisStep === 2 && isAnalyzing ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`} /></div>
                    <div>
                      <h4 className="font-medium text-slate-200">2. Checking External Market Trends</h4>
                      {analysisStep >= 2 && (
                         <p className="text-sm text-slate-400 mt-1">
                           Agent is scanning social sentiment APIs...
                         </p>
                      )}
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className={`flex gap-4 transition-opacity duration-500 ${analysisStep >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="mt-1"><RefreshCw className={`w-5 h-5 ${analysisStep === 3 && isAnalyzing ? 'text-blue-400 animate-spin' : 'text-slate-400'}`} /></div>
                    <div>
                      <h4 className="font-medium text-slate-200">3. Thinking: Dynamic EOQ</h4>
                      {analysisStep >= 3 && (
                        <div className="text-sm text-slate-400 mt-1 space-y-1">
                          <p>Consulting AetherFlow LLM via LangChain...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 4 / Result */}
                  <div className={`flex gap-4 transition-opacity duration-500 ${analysisStep >= 4 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="mt-1"><ShoppingCart className={`w-5 h-5 ${results?.success ? 'text-emerald-400' : 'text-rose-400'}`} /></div>
                    <div className="w-full">
                      <h4 className="font-medium text-slate-200">4. Final Action (Live from Python)</h4>
                      {analysisStep >= 4 && results && (
                        <div className={`mt-3 p-4 rounded-lg border ${results.success ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                          <p className={`text-sm font-medium whitespace-pre-wrap leading-relaxed ${results.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {results.action}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
