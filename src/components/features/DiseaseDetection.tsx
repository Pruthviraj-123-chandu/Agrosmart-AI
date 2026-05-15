import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bug, 
  Upload, 
  Camera, 
  Loader2, 
  ShieldCheck, 
  AlertTriangle,
  X,
  Stethoscope,
  Activity,
  CheckCircle2,
  Trash2,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Info
} from 'lucide-react';
import { detectDisease } from '../../lib/gemini';
import { cn } from '../../lib/utils';
import { useSettings } from '../SettingsContext';

interface Symptom {
  text: string;
  confidence: number;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

interface DetectionResult {
  diseaseName: string;
  symptoms: Symptom[];
  treatment: string;
  urgency: 'low' | 'medium' | 'high';
}

function DetectionMarker({ box, label, active, onHover }: { 
  box: [number, number, number, number], 
  label: string, 
  active: boolean,
  onHover: (hovered: boolean) => void 
}) {
  const [ymin, xmin, ymax, xmax] = box;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: active ? 1 : 0.6,
        scale: active ? 1.05 : 1,
        zIndex: active ? 20 : 10,
        boxShadow: active ? "0 0 20px rgba(34, 197, 94, 0.4)" : "0 0 0px transparent"
      }}
      whileHover={{ scale: 1.1 }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{
        position: 'absolute',
        top: `${ymin / 10}%`,
        left: `${xmin / 10}%`,
        width: `${(xmax - xmin) / 10}%`,
        height: `${(ymax - ymin) / 10}%`,
        border: '3px solid',
        borderColor: active ? '#22c55e' : '#ef4444',
        backgroundColor: active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.05)',
        borderRadius: '8px',
        cursor: 'pointer',
        pointerEvents: 'auto'
      }}
      className="group"
    >
      {/* Pulse effect */}
      {active && (
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 border-4 border-green-400 rounded-lg"
        />
      )}
      
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950 text-white text-[11px] px-3 py-1.5 rounded-full shadow-2xl font-black border border-white/10 flex items-center gap-2 pointer-events-none"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function DiseaseDetection() {
  const { t, settings } = useSettings();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [hoveredSymptomIndex, setHoveredSymptomIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset zoom scale when opening/closing
  React.useEffect(() => {
    if (!isZoomed) {
      setZoomScale(1);
    }
  }, [isZoomed]);

  const [loadingStep, setLoadingStep] = useState(0);
  React.useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % 4);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    "Processing image pixels...",
    "Scanning for patterns of symptoms...",
    "Comparing against plant pathology database...",
    "Detecting specific disease features..."
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Real-time validation
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image (JPEG, PNG, or WEBP).');
        setImage(null);
        setResult(null);
        return;
      }

      if (file.size > maxSize) {
        setError('Image size too large. Please upload an image smaller than 5MB.');
        setImage(null);
        setResult(null);
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const base64 = image.includes(',') ? image.split(',')[1] : image;
      if (!base64) throw new Error("Invalid image format.");
      const res = await detectDisease(base64);
      
      if (res.error) {
        if (res.code === 'QUOTA_EXCEEDED') {
          setError(res.error || 'AI service is currently at its free-tier limit. Please wait 1-2 minutes or use a billing-enabled API key.');
        } else {
          setError(res.error || 'Detection failed. Please try again.');
        }
        setLoading(false);
        return;
      }

      setResult(res);
      
      // Notification Logic
      if (settings.notifications.push) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }
    } catch (err) {
      console.error(err);
      setError('Network error. AI analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
       <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900 shadow-2xl p-6 rounded-[2rem] flex items-center gap-4 min-w-[320px]"
          >
            <div className="p-3 bg-red-100 dark:bg-red-950/30 rounded-2xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-0.5">Urgent Alert</p>
              <h4 className="font-bold text-slate-950 dark:text-white leading-tight">Disease Warning!</h4>
              <p className="text-xs text-slate-500">{result?.diseaseName} detected on your crop.</p>
            </div>
            <button onClick={() => setShowNotification(false)} className="ml-auto p-2 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && image && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-hidden"
          >
            <div 
              className="absolute inset-0 cursor-zoom-out" 
              onClick={() => setIsZoomed(false)} 
            />
            
            <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
              <div className="relative pointer-events-auto">
                <motion.img 
                  drag
                  dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                  dragElastic={0.1}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: zoomScale, 
                    opacity: 1,
                    cursor: zoomScale > 1 ? 'grab' : 'default'
                  }}
                  whileTap={{ cursor: zoomScale > 1 ? 'grabbing' : 'default' }}
                  src={image} 
                  className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl object-contain select-none" 
                  alt="Zoomed leaf" 
                />
                
                {/* Markers Overlay in Zoom */}
                {result?.symptoms && (
                  <motion.div 
                    animate={{ scale: zoomScale }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    {result.symptoms.map((sym, i) => sym.box && (
                      <DetectionMarker 
                        key={i} 
                        box={sym.box} 
                        label={sym.text} 
                        active={hoveredSymptomIndex === i || hoveredSymptomIndex === null}
                        onHover={(h) => setHoveredSymptomIndex(h ? i : null)}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl z-[101]">
              <button 
                onClick={() => setZoomScale(prev => Math.max(1, prev - 0.5))}
                className="p-3 hover:bg-white/10 rounded-xl text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-6 h-6" />
              </button>
              <div className="px-4 text-white font-mono font-bold w-16 text-center">
                {Math.round(zoomScale * 100)}%
              </div>
              <button 
                onClick={() => setZoomScale(prev => Math.min(5, prev + 0.5))}
                className="p-3 hover:bg-white/10 rounded-xl text-white transition-colors text-green-400"
                title="Zoom In"
              >
                <ZoomIn className="w-6 h-6" />
              </button>
              <div className="w-px h-6 bg-white/20 mx-2" />
              <button 
                onClick={() => setIsZoomed(false)}
                className="p-3 hover:bg-white/10 rounded-xl text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="absolute top-10 left-1/2 -translate-x-1/2 text-white/40 text-[10px] uppercase tracking-widest font-bold">
              Drag to pan • Pinch or use controls to zoom
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{t('diseaseDetection')}</h1>
        <p className="text-slate-500 dark:text-slate-400">Instant disease detection using advanced AI Vision. Upload a clear photo of the affected leaf.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Upload Column */}
        <div className="space-y-6">
          <div 
             className={cn(
              "relative aspect-square rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all",
              image ? "border-green-500" : "border-slate-200 dark:border-slate-800 hover:border-green-400 hover:bg-green-50/30 cursor-pointer"
             )}
             onClick={() => !image && fileInputRef.current?.click()}
          >
            {image ? (
              <div className="relative w-full h-full group overflow-hidden">
                <img src={image} className="w-full h-full object-cover" alt="Uploaded leaf" />
                
                {/* Scanning Beam Animation */}
                {loading && (
                  <motion.div 
                    initial={{ top: "-10%" }}
                    animate={{ top: "110%" }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2, 
                      ease: "linear" 
                    }}
                    className="absolute inset-x-0 h-1 bg-green-500 shadow-[0_0_15px_#22c55e,0_0_30px_#22c55e] z-10"
                  />
                )}

                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsZoomed(true); }}
                    className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-all scale-90 group-hover:scale-100"
                  >
                    <Maximize2 className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setImage(null); setResult(null); }}
                    className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-red-500 transition-all scale-90 group-hover:scale-100"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>

                {result && (
                  <div className="absolute top-4 right-4 p-2 bg-slate-900/80 backdrop-blur-md rounded-xl text-white text-[10px] font-bold flex items-center gap-2 border border-white/10 z-30">
                    <Info className="w-3 h-3 text-green-400" />
                    {result.symptoms.length} Symptoms Detected
                  </div>
                )}

                {/* Markers Overlay - Moved to top for interactivity */}
                {result?.symptoms && !loading && (
                  <div className="absolute inset-0 pointer-events-none z-40">
                    {result.symptoms.map((sym, i) => sym.box && (
                      <DetectionMarker 
                        key={i} 
                        box={sym.box} 
                        label={sym.text} 
                        active={hoveredSymptomIndex === i}
                        onHover={(h) => setHoveredSymptomIndex(h ? i : null)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 p-8">
                <div className="p-6 bg-green-50 dark:bg-green-950/30 rounded-full">
                   <Upload className="w-10 h-10 text-green-600 dark:text-green-500" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-white">{t('uploadPhoto')}</p>
                  <p className="text-sm text-slate-400">Drag or click to choose file</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
            />
          </div>

          <button 
            disabled={!image || loading}
            onClick={handleAnalyze}
            className="w-full py-5 bg-slate-900 dark:bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-green-500 transition-all disabled:opacity-50 shadow-2xl shadow-slate-100 dark:shadow-none"
          >
            {loading ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> {t('identifiedSymptoms')}</>
            ) : (
              <><Bug className="w-6 h-6 text-green-400" /> {t('startScan')}</>
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
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Column */}
        <AnimatePresence mode="wait">
          {!result && !loading ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] h-full flex flex-col items-center justify-center text-center text-slate-400"
            >
              <Camera className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-xs uppercase tracking-widest">{t('analysisResults')}</p>
            </motion.div>
          ) : loading ? (
             <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-green-50 dark:border-slate-800 shadow-sm h-full flex flex-col items-center justify-center text-center"
            >
              <div className="relative mb-10 scale-125">
                 <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Search className="w-6 h-6 text-green-600 animate-pulse" />
                 </div>
              </div>
              <div className="space-y-4 w-full">
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4 mx-auto overflow-hidden">
                  <motion.div 
                    className="h-full bg-green-500"
                    animate={{ x: [-100, 300] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>
              <motion.p 
                key={loadingStep}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 text-sm font-bold text-green-700 dark:text-green-500 uppercase tracking-widest h-10"
              >
                {loadingMessages[loadingStep]}
              </motion.p>
            </motion.div>
          ) : (
            <motion.div 
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }}
               className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-green-100 dark:border-slate-800 space-y-8"
            >
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-4 rounded-[2rem] shadow-lg",
                      result.urgency === 'high' ? "bg-red-500 text-white" :
                      result.urgency === 'medium' ? "bg-amber-500 text-white" :
                      "bg-green-500 text-white"
                    )}>
                      <Bug className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 leading-none mb-1">{t('detectedIssue')}</h3>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{result.diseaseName}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3].map(i => (
                            <div 
                              key={i} 
                              className={cn(
                                "w-4 h-1.5 rounded-full",
                                i <= (result.urgency === 'high' ? 3 : result.urgency === 'medium' ? 2 : 1)
                                  ? (result.urgency === 'high' ? "bg-red-500" : result.urgency === 'medium' ? "bg-amber-500" : "bg-green-500")
                                  : "bg-slate-200 dark:bg-slate-800"
                              )} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {result.urgency} {t('urgency')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setImage(null); setResult(null); }}
                    className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-all active:scale-95"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
               </div>

               <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Activity className="w-4 h-4 text-green-600" />
                    {t('symptoms')}
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {result.symptoms?.map((sym, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          scale: hoveredSymptomIndex === i ? 1.02 : 1
                        }}
                        transition={{ delay: i * 0.1 }}
                        onMouseEnter={() => setHoveredSymptomIndex(i)}
                        onMouseLeave={() => setHoveredSymptomIndex(null)}
                        key={i} 
                        className={cn(
                          "flex items-start gap-4 p-5 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden",
                          hoveredSymptomIndex === i 
                            ? "bg-green-50 dark:bg-green-950/40 border-green-500/30 dark:border-green-500/30 shadow-xl shadow-green-500/5 ring-1 ring-green-500/20" 
                            : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 hover:border-green-200 dark:hover:border-green-900"
                        )}
                      >
                         {/* Highlight Indicator */}
                         {hoveredSymptomIndex === i && (
                           <motion.div 
                             layoutId="symptom-highlight"
                             className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"
                           />
                         )}
                         
                         <div className={cn(
                           "mt-0.5 flex-shrink-0 p-1.5 rounded-xl shadow-sm transition-all duration-300",
                           hoveredSymptomIndex === i ? "bg-green-600 text-white scale-110 rotate-12" : "bg-white dark:bg-slate-700 text-green-600"
                         )}>
                            <CheckCircle2 className="w-4 h-4" />
                         </div>
                         <div className="flex-1">
                           <div className="flex items-center justify-between mb-0.5">
                             <span className="text-sm text-slate-900 dark:text-white font-bold leading-tight">{sym.text}</span>
                             {sym.confidence && (
                               <span className="text-[10px] font-mono text-slate-400">{Math.round(sym.confidence * 100)}%</span>
                             )}
                           </div>
                           <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${(sym.confidence || 0.8) * 100}%` }}
                               className="h-full bg-green-500"
                             />
                           </div>
                         </div>
                      </motion.div>
                    ))}
                  </div>
               </div>

               <div className="bg-green-50 dark:bg-green-950/20 p-8 rounded-[2.5rem] border border-green-100 dark:border-green-900/30">
                  <h4 className="font-bold flex items-center gap-2 mb-4 text-green-800 dark:text-green-400">
                    <ShieldCheck className="w-5 h-5" />
                    {t('treatment')}
                  </h4>
                  <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">
                    {result.treatment}
                  </p>
               </div>

               <div className="flex gap-4">
                  <button className="flex-1 py-4 bg-green-700 text-white rounded-2xl font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Resolved
                  </button>
                  <button className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                    <Stethoscope className="w-6 h-6" />
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
