import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Search, 
  Loader2, 
  Activity, 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Mountain,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { getCropRequirements } from '../../lib/gemini';
import { cn } from '../../lib/utils';

export function CropGuide() {
  const [crop, setCrop] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const [loadingStep, setLoadingStep] = useState(0);
  React.useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % 3);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    "Searching agricultural records...",
    "Retrieving climate requirement data...",
    "Compiling agronomic fact sheet..."
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crop.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getCropRequirements(crop);
      if (result.error) {
        if (result.code === 'QUOTA_EXCEEDED') {
           setError(result.error || 'AI service is currently at its free-tier limit. Please wait 1-2 minutes or use a billing-enabled API key.');
        } else {
           setError(result.error || 'Failed to fetch crop data.');
        }
        setLoading(false);
        return;
      }
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Connection error. Failed to reach agronomy database.');
    } finally {
      setLoading(false);
    }
  };

  const RequirementCard = ({ icon: Icon, label, value, unit, color }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-green-50 shadow-sm flex items-center gap-4">
      <div className={cn("p-3 rounded-2xl", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-lg font-black text-slate-900">
          {value} <span className="text-sm font-medium text-slate-500">{unit}</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="text-center">
        <h1 className="text-4xl font-black text-black mb-2">Crop Encyclopedia</h1>
        <p className="text-slate-700 dark:text-slate-300">Search for any crop to discover its ideal growing conditions and NPK requirements.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-green-50 dark:border-slate-800 max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="e.g. Tomato, Coffee, Corn..."
              className="w-full bg-green-50/50 dark:bg-slate-800 border border-green-100 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-4 outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-green-500/20 text-black dark:text-white placeholder:text-slate-500"
            />
          </div>
          <button 
            disabled={loading || !crop.trim()}
            className="bg-green-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-800 transition-all disabled:opacity-50 shadow-lg shadow-green-100"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-red-50 border border-red-100 shadow-sm rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium"
            >
              <Activity className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-20 py-32"
          >
            <div className="relative mb-10">
              <div className="w-24 h-24 border-4 border-green-100 border-t-green-600 rounded-full animate-spin" />
              <Layers className="w-10 h-10 text-green-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <motion.p 
              key={loadingStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-bold text-green-700 dark:text-green-50 uppercase tracking-widest text-sm"
            >
              {loadingMessages[loadingStep]}
            </motion.p>
          </motion.div>
        ) : data ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Main Info Box with Image Background */}
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl min-h-[400px] flex items-end">
              <img 
                src={`https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop&query=${data.cropName}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2232&auto=format&fit=crop';
                }}
                alt={data.cropName}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              
              <div className="relative z-10 w-full p-8 lg:p-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-xl shadow-lg shadow-green-500/20">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-widest text-green-300">Agricultural Fact Sheet</span>
                    </div>
                    <h2 className="text-6xl font-black text-white tracking-tight">{data.cropName}</h2>
                    <div className="flex flex-wrap gap-3">
                      <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl flex items-center gap-2 border border-white/10 text-white">
                        <Mountain className="w-4 h-4 text-green-300" />
                        <span className="text-sm font-semibold">{data.soilType} Soil</span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl flex items-center gap-2 border border-white/10 text-white">
                        <Calendar className="w-4 h-4 text-blue-300" />
                        <span className="text-sm font-semibold">{data.growthDuration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-w-xs w-full">
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-6 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-2xl"
                    >
                      <div className="flex items-center gap-2 mb-3 text-amber-300">
                        <Info className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Agronomist Insight</span>
                      </div>
                      <p className="text-sm text-slate-100 leading-relaxed italic font-medium">
                        "{data.specialNotes}"
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid of Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <RequirementCard 
                icon={Activity} 
                label="Nitrogen (N)" 
                value={`${data.nitrogen?.min ?? 0}-${data.nitrogen?.max ?? 100}`} 
                unit="kg/ha"
                color="bg-green-50 text-green-600"
              />
              <RequirementCard 
                icon={Activity} 
                label="Phosphorus (P)" 
                value={`${data.phosphorus?.min ?? 0}-${data.phosphorus?.max ?? 100}`} 
                unit="kg/ha"
                color="bg-blue-50 text-blue-600"
              />
              <RequirementCard 
                icon={Activity} 
                label="Potassium (K)" 
                value={`${data.potassium?.min ?? 0}-${data.potassium?.max ?? 100}`} 
                unit="kg/ha"
                color="bg-amber-50 text-amber-600"
              />
              <RequirementCard 
                icon={Thermometer} 
                label="Temperature" 
                value={`${data.temperature?.min ?? 10}-${data.temperature?.max ?? 40}`} 
                unit="°C"
                color="bg-red-50 text-red-600"
              />
              <RequirementCard 
                icon={Droplets} 
                label="Humidity" 
                value={`${data.humidity?.min ?? 20}-${data.humidity?.max ?? 90}`} 
                unit="%"
                color="bg-indigo-50 text-indigo-600"
              />
              <RequirementCard 
                icon={CloudRain} 
                label="Rainfall" 
                value={`${data.rainfall?.min ?? 0}-${data.rainfall?.max ?? 1000}`} 
                unit="mm"
                color="bg-cyan-50 text-cyan-600"
              />
              <div className="md:col-span-2 lg:col-span-1 bg-green-600 p-6 rounded-3xl text-white flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-green-200 mb-1">Ideal Soil pH</p>
                  <p className="text-2xl font-black">{data.ph?.min ?? 5.5} - {data.ph?.max ?? 7.5}</p>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-white/30 flex items-center justify-center font-bold">
                  pH
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-green-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-400">Search for a crop to see details</h3>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
