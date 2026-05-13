import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Sprout, 
  Droplets, 
  Thermometer, 
  CloudRain, 
  Activity, 
  FlaskConical,
  Beaker,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCcw,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { getCropRecommendation } from '../../lib/gemini';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { useSettings } from '../SettingsContext';

const schema = z.object({
  n: z.number().min(0).max(140),
  p: z.number().min(0).max(145),
  k: z.number().min(0).max(205),
  temp: z.number().min(0).max(50),
  humidity: z.number().min(0).max(100),
  ph: z.number().min(0).max(14),
  rainfall: z.number().min(0).max(500),
});

type FormData = z.infer<typeof schema>;

export function CropPrediction() {
  const { t } = useSettings();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      n: 90,
      p: 42,
      k: 43,
      temp: 20,
      humidity: 82,
      ph: 6.5,
      rainfall: 202
    }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCropRecommendation(data);
      if (res.error) {
        if (res.code === 'QUOTA_EXCEEDED') {
          setError('AI service is currently at its free-tier limit. Please wait 1-2 minutes and try again. This helps manage high traffic.');
        } else {
          setError(res.error || 'Failed to fetch recommendation. Please try again.');
        }
        setLoading(false);
        return;
      }
      setResult(res);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#16a34a', '#22c55e', '#fbbf24']
      });
    } catch (err) {
      setError('Connection error. Please check your internet or try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);

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
          if (prev < 30) return prev + 2;
          if (prev < 60) return prev + 1;
          if (prev < 90) return prev + 0.5;
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
    "Analyzing soil N-P-K composition...",
    "Correlating humidity and rainfall patterns...",
    "Consulting agricultural database...",
    "Finalizing crop recommendation..."
  ];

  const InputField = ({ label, name, icon: Icon, placeholder, min, max, unit }: any) => (
    <div className="space-y-2">
      <label className="text-sm font-bold text-black dark:text-slate-200 flex items-center gap-2">
        <Icon className="w-4 h-4 text-green-700" />
        {label} {unit && <span className="text-[10px] text-slate-500 font-normal uppercase tracking-wider">{unit}</span>}
      </label>
      <div className="relative">
        <input
          type="number"
          step="any"
          {...register(name, { valueAsNumber: true })}
          className={cn(
            "w-full bg-green-50/50 dark:bg-slate-800 border border-green-100 dark:border-slate-700 rounded-2xl px-4 py-3 outline-none transition-all focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-green-500/20 text-black dark:text-white placeholder:text-slate-500",
            errors[name as keyof FormData] ? "border-red-300 bg-red-50 dark:bg-red-950/20" : ""
          )}
          placeholder={placeholder}
        />
        {errors[name as keyof FormData] && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
      </div>
      {errors[name as keyof FormData] && (
        <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
          Value must be between {min} and {max}
        </p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="text-center">
        <h1 className="text-4xl font-black text-black mb-2">Crop Recommendation</h1>
        <p className="text-slate-700 dark:text-slate-300">Enter your soil and climate details for an AI-powered accurate prediction.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-green-50 dark:border-slate-800 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <InputField label={t('nitrogen')} name="n" icon={Activity} min={0} max={140} unit="(N)" />
              <InputField label={t('phosphorus')} name="p" icon={Beaker} min={0} max={145} unit="(P)" />
              <InputField label={t('potassium')} name="k" icon={FlaskConical} min={0} max={205} unit="(K)" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField label={t('temperature')} name="temp" icon={Thermometer} min={0} max={50} unit="°C" />
              <InputField label={t('humidity')} name="humidity" icon={Droplets} min={0} max={100} unit="%" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField label={t('phLevel')} name="ph" icon={Activity} min={0} max={14} unit="(0-14)" />
              <InputField label={t('rainfall')} name="rainfall" icon={CloudRain} min={0} max={500} unit="mm" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-green-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-800 transition-all disabled:opacity-50 shadow-xl shadow-green-100"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> {t('analyzingSoil')}</>
              ) : (
                <><Sparkles className="w-5 h-5" /> {t('getRecommendation')}</>
              )}
            </button>
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!result && !loading ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="h-full flex flex-col items-center justify-center text-center p-8 bg-green-50/30 rounded-[2.5rem] border-2 border-dashed border-green-100"
              >
                <div className="p-4 bg-white rounded-2xl mb-4 shadow-sm">
                  <Sprout className="w-12 h-12 text-green-300" />
                </div>
                <h3 className="font-bold text-slate-400">Waiting for Data</h3>
                <p className="text-sm text-slate-400">Fill the form to see your prediction</p>
              </motion.div>
            ) : loading ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 bg-green-50/50 dark:bg-slate-900/50 rounded-[2.5rem] border border-green-100 dark:border-slate-800"
              >
                <div className="relative mb-8">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="w-32 h-32 border-4 border-dashed border-green-200 dark:border-green-900/50 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Sprout className="w-12 h-12 text-green-600" />
                    </motion.div>
                  </div>
                </div>

                <div className="w-full max-w-[240px] space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <h3 className="font-bold text-green-800 dark:text-green-100 text-lg">AI Analysis</h3>
                      <span className="text-[10px] font-black text-green-600 dark:text-green-400 tabular-nums">
                        {Math.floor(progress)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-green-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-green-600 rounded-full shadow-[0_0_10px_rgba(22,163,74,0.5)]"
                      />
                    </div>
                  </div>

                  <div className="h-12 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.p 
                        key={loadingStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-green-700 dark:text-green-400 font-medium"
                      >
                        {loadingMessages[loadingStep]}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  <div className="pt-4">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold animate-pulse">
                      Processing Data Streams
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-green-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[4rem] -z-0" />
                
                <div className="relative z-10 space-y-6">
                  {/* Result Header */}
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-green-600 rounded-[2rem] shadow-lg shadow-green-100">
                      <Sprout className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-500 uppercase text-[10px] tracking-widest leading-none mb-1">{t('recommendedCrop')}</h3>
                      <p className="text-3xl font-black text-slate-900 leading-none">{result.cropName}</p>
                    </div>
                    <div className="ml-auto">
                       <div className="bg-green-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-[11px] font-black text-green-700 tracking-tight">{result.confidence}% {t('confidence')}</span>
                       </div>
                    </div>
                  </div>

                  <div className="p-6 bg-green-50/50 rounded-3xl border border-green-100/50">
                    <p className="text-sm text-slate-700 leading-relaxed italic text-center">
                      "{result.reason}"
                    </p>
                  </div>

                  {/* Main Information Grid - Broadened */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 group hover:bg-white transition-colors cursor-default">
                      <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('growthPeriod')}</p>
                        <p className="text-base font-black text-slate-900 dark:text-white capitalize">{result.growthPeriod}</p>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 group hover:bg-white transition-colors cursor-default">
                      <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('seasonality')}</p>
                        <p className="text-base font-black text-slate-900 dark:text-white capitalize">{result.seasonality}</p>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 group hover:bg-white transition-colors cursor-default">
                      <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm">
                        <Droplets className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('waterRequirement')}</p>
                        <p className="text-base font-black text-slate-900 dark:text-white capitalize">{result.waterRequirement}</p>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 group hover:bg-white transition-colors cursor-default">
                      <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm">
                        <Activity className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('marketPrice')}</p>
                        <p className="text-base font-black text-slate-900 dark:text-white capitalize">{result.marketPriceTier}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-green-50 dark:bg-green-950/20 rounded-3xl border border-green-100 dark:border-green-900/30">
                    <h4 className="font-bold text-sm flex items-center gap-2 mb-3 text-green-900 dark:text-green-400">
                      <TrendingUp className="w-4 h-4" />
                      {t('economicValue')}
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed font-medium">
                      {result.economicValue}
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl space-y-4 border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-green-600" />
                      {t('bestPractices')}
                    </h4>
                    <ul className="space-y-2">
                      {result.bestPractices?.map((practice: string, i: number) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex gap-2">
                          <span className="text-green-600 font-bold flex-shrink-0">•</span>
                          {practice}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={() => { setResult(null); reset(); }}
                    className="mt-4 w-full py-4 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-400 hover:text-green-600 hover:border-green-100 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    {t('startNewAnalysis')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
