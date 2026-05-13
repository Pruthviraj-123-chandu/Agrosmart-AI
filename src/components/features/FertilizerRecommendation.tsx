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
  AlertCircle
} from 'lucide-react';
import { getFertilizerRecommendation } from '../../lib/gemini';
import { cn } from '../../lib/utils';

export function FertilizerRecommendation() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [soilParams, setSoilParams] = useState('');
  const [cropName, setCropName] = useState('');

  const [error, setError] = useState<string | null>(null);

  const [loadingStep, setLoadingStep] = useState(0);
  React.useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % 3);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    "Analyzing nutrient deficiencies...",
    "Matching soil conditions to crop needs...",
    "Calculating optimal dosage..."
  ];

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soilParams || !cropName) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getFertilizerRecommendation(soilParams, cropName);
      if (res.error) {
        if (res.code === 'QUOTA_EXCEEDED') {
          setError('AI service is busy. Please wait a minute and try again.');
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black text-black mb-2">Fertilizer Assistant</h1>
        <p className="text-slate-700 dark:text-slate-300">Provide your soil health and intended crop to find the perfect nutrient balance.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-green-50 dark:border-slate-800">
        <form onSubmit={handleRecommend} className="grid md:grid-cols-2 gap-8 items-end">
          <div className="space-y-4">
             <label className="text-sm font-bold text-black dark:text-slate-200 block">Soil Condition / Deficiency</label>
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
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
                  className="bg-green-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-800 transition-all disabled:opacity-50 min-w-[160px] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> 
                      <span className="text-xs">{loadingMessages[loadingStep]}</span>
                    </>
                  ) : "Analyze"}
                </button>
             </div>
          </div>
        </form>

        <AnimatePresence>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-8"
          >
            <div className="bg-gradient-to-br from-green-600 to-emerald-800 p-10 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between">
              <div>
                 <FlaskConical className="w-12 h-12 mb-6 text-green-200" />
                 <h2 className="text-3xl font-black mb-2">{result.fertilizerName}</h2>
                 <p className="text-green-100 text-lg mb-8 leading-relaxed italic">"{result.reason}"</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-200">Recommended</p>
                    <p className="font-bold">Fertilizer</p>
                 </div>
                 <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-200">Confidence</p>
                    <p className="font-bold text-green-400">High</p>
                 </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="bg-white p-8 rounded-[2.5rem] border border-green-50 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-50 rounded-2xl">
                       <Droplets className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                       <h3 className="font-bold">Application Method</h3>
                       <p className="text-sm text-slate-500">How to apply correctly</p>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed bg-blue-50/30 p-4 rounded-2xl border border-blue-100">
                    {result.applicationMethod}
                  </p>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-green-50 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-amber-50 rounded-2xl">
                       <Info className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                       <h3 className="font-bold">Dosage instructions</h3>
                       <p className="text-sm text-slate-500">Strictly follow these limits</p>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed bg-amber-50/30 p-4 rounded-2xl border border-amber-100">
                    {result.dosageInfo}
                  </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
