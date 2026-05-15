import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FlaskConical, 
  Beaker, 
  Search, 
  Loader2, 
  CheckCircle2, 
  Info,
  Droplets,
  ArrowRight,
  AlertCircle,
  Clock,
  ShieldAlert,
  Leaf,
  Target,
  BarChart3
} from 'lucide-react';
import { getFertilizerRecommendation } from '../../lib/gemini';
import { cn } from '../../lib/utils';

export function FertilizerRecommendation() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [soilParams, setSoilParams] = useState('');
  const [cropName, setCropName] = useState('');
  const [progress, setProgress] = useState(0);

  const [error, setError] = useState<string | null>(null);

  const [loadingStep, setLoadingStep] = useState(0);
  React.useEffect(() => {
    let interval: any;
    let progressInterval: any;
    
    if (loading) {
      setLoadingStep(0);
      setProgress(0);
      
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % 4);
      }, 2500);

      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 40) return prev + 1.5;
          if (prev < 70) return prev + 0.8;
          if (prev < 90) return prev + 0.3;
          if (prev < 98) return prev + 0.1;
          return prev;
        });
      }, 100);
    } else {
      setLoadingStep(0);
      setProgress(0);
    }
    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [loading]);

  const loadingMessages = [
    "Analyzing nutrient profiles...",
    "Optimizing soil structure...",
    "Matching microbial needs...",
    "Calculating sustainable dosage..."
  ];

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soilParams || !cropName) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await getFertilizerRecommendation(soilParams, cropName);
      if (res.error) {
        if (res.code === 'QUOTA_EXCEEDED') {
          setError(res.error || 'AI service is currently at its free-tier limit. Please wait 1-2 minutes or use a billing-enabled API key.');
        } else {
          setError(res.error || 'Failed to get recommendation');
        }
        setLoading(false);
        return;
      }
      setResult(res);
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black text-black dark:text-white mb-2">Fertilizer Assistant</h1>
        <p className="text-slate-700 dark:text-slate-300">Intelligent nutrient management for precision agriculture.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-green-50 dark:border-slate-800">
        <form onSubmit={handleRecommend} className="grid md:grid-cols-2 gap-8 items-end">
          <div className="space-y-4">
             <label className="text-sm font-bold text-black dark:text-slate-200 block">Soil Condition / Deficiency</label>
             <div className="relative">
                <FlaskConical className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                 <input 
                  type="text" 
                  value={soilParams}
                  onChange={(e) => setSoilParams(e.target.value)}
                  placeholder="e.g. Low Nitrogen, yellow leaves, high pH"
                  className="w-full bg-green-50/50 dark:bg-slate-800 border border-green-100 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-4 outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-green-500/20 text-black dark:text-white placeholder:text-slate-500"
                />
             </div>
          </div>
          <div className="space-y-4">
             <label className="text-sm font-bold text-black dark:text-slate-200 block">Target Crop</label>
             <div className="flex gap-4">
                <input 
                  type="text" 
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Wheat"
                  className="flex-1 bg-green-50/50 dark:bg-slate-800 border border-green-100 dark:border-slate-700 rounded-2xl px-4 py-4 outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-green-500/20 text-black dark:text-white placeholder:text-slate-500"
                />
                <button 
                  disabled={loading}
                  className="bg-green-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-800 transition-all disabled:opacity-50 min-w-[160px] flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <span className={cn("transition-transform duration-300", loading ? "translate-y-10" : "group-hover:scale-105")}>
                    Get Action Plan
                  </span>
                  {loading && (
                    <motion.div 
                      className="absolute inset-0 bg-green-800 flex items-center justify-center"
                      initial={{ y: -40 }}
                      animate={{ y: 0 }}
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </motion.div>
                  )}
                </button>
             </div>
          </div>
        </form>

        <AnimatePresence>
          {loading && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 pt-8 border-t border-green-50 dark:border-slate-800"
            >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full max-w-md bg-green-50 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-green-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <motion.p 
                    key={loadingStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-sm font-bold text-green-700 dark:text-green-400"
                  >
                    {loadingMessages[loadingStep]}
                  </motion.p>
                </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 shadow-sm rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Main Result Panel */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-gradient-to-br from-green-700 via-green-800 to-emerald-900 p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FlaskConical className="w-48 h-48 rotate-12" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-1 border-t-2 border-green-300" />
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase text-green-300">Expert Recommendation</span>
                  </div>
                  <h2 className="text-5xl font-black mb-6 tracking-tight">{result.fertilizerName}</h2>
                  <p className="text-green-100/80 text-xl leading-relaxed italic max-w-2xl mb-12">
                    "{result.reason}"
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                      <Clock className="w-6 h-6 text-green-300 mb-2" />
                      <p className="text-[10px] font-bold uppercase text-green-300 mb-1">Optimal Time</p>
                      <p className="font-bold text-sm leading-tight">{result.bestApplicationTime}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                      <Target className="w-6 h-6 text-green-300 mb-2" />
                      <p className="text-[10px] font-bold uppercase text-green-300 mb-1">Expected Result</p>
                      <p className="font-bold text-sm leading-tight">{result.expectedResults}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 col-span-2 sm:col-span-1">
                      <BarChart3 className="w-6 h-6 text-green-300 mb-2" />
                      <p className="text-[10px] font-bold uppercase text-green-300 mb-1">Soil Impact</p>
                      <p className="font-bold text-sm leading-tight">{result.soilImpact}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-green-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                       <Droplets className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                       <h3 className="font-bold dark:text-white">Application Guide</h3>
                       <p className="text-xs text-slate-500">Methodology & Technique</p>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                    {result.applicationMethod}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-green-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
                       <Beaker className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                       <h3 className="font-bold dark:text-white">Dosage Protocol</h3>
                       <p className="text-xs text-slate-500">Strict Quantitative Limits</p>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                    {result.dosageInfo}
                  </p>
                </div>
              </div>
            </div>

            {/* Side Panel: Organic & Security */}
            <div className="space-y-8">
              <div className="bg-green-50 dark:bg-green-950/20 p-8 rounded-[2.5rem] border border-green-100 dark:border-green-900/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-600 rounded-xl">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-green-900 dark:text-green-100">Organic Alternative</h3>
                    <p className="text-xs text-green-700 dark:text-green-400">Eco-friendly substitute</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-green-100 dark:border-green-900/30 shadow-sm italic text-sm text-green-800 dark:text-green-200">
                  {result.alternativeOrganic}
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-950/20 p-8 rounded-[2.5rem] border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-red-600 rounded-xl">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-black text-red-900 dark:text-red-100">Safety First</h3>
                </div>
                <ul className="space-y-3">
                  {result.precautions.map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-xs font-semibold text-red-700 dark:text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-8 bg-blue-50 dark:bg-blue-950/20 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/30">
                 <p className="text-[10px] uppercase font-black tracking-widest text-blue-600 dark:text-blue-400 mb-2">Sustainable Note</p>
                 <p className="text-xs font-medium text-blue-800 dark:text-blue-200 leading-relaxed">
                   Proper nutrient management prevents groundwater contamination and maintains biodiversity.
                 </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

