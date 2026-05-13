import React from 'react';
import { motion } from 'motion/react';
import { Leaf, ShieldCheck, Zap, Globe, ArrowRight, Sun, Moon } from 'lucide-react';
import { signInWithGoogle } from '../../lib/firebase';
import { useTheme } from '../ThemeContext';

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#f0fdf4] dark:bg-slate-950 overflow-hidden relative transition-colors duration-300">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-200/50 dark:bg-green-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-100/50 dark:bg-green-950/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

      <nav className="relative z-10 container mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="p-2 bg-green-600 rounded-xl group-hover:rotate-12 transition-transform">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-green-900 dark:text-green-500">AgroVision Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={signInWithGoogle}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full font-medium shadow-lg shadow-green-200 dark:shadow-none transition-all active:scale-95"
          >
            Sign In with Google
          </button>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-900/80 border border-green-100 dark:border-slate-800 rounded-full shadow-sm mb-6">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-800 dark:text-green-400 italic">Advanced Agriculture Support</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
            The Smart Way to <span className="text-green-600 dark:text-green-500">Farmer</span> Better.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
            Maximize your crop yield and soil health with our AI-powered agricultural intelligence system. 
            Real-time recommendations, disease detection, and expert farming advice at your fingertips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={signInWithGoogle}
              className="flex items-center justify-center gap-2 bg-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-green-800 transition-all shadow-xl shadow-green-100 group"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-4 px-6">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-green-100 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=farmer${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium">Trusted by 10,000+ Farmers</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="aspect-square bg-gradient-to-br from-green-500 to-emerald-700 rounded-[3rem] rotate-3 overflow-hidden shadow-2xl relative group">
            <img 
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2026&auto=format&fit=crop" 
              alt="Farm" 
              className="w-full h-full object-cover -rotate-3 scale-110 group-hover:scale-100 transition-transform duration-700 opacity-90"
            />
            {/* Stats Overlay Card */}
            <div className="absolute bottom-8 left-8 right-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl shadow-xl -rotate-3 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg dark:text-white">Soil Health Status</span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full uppercase">Excellent</span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 h-32 bg-green-50 dark:bg-green-900/10 rounded-2xl p-4 flex flex-col justify-end">
                  <span className="text-2xl font-bold text-green-700 dark:text-green-400">89%</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Nitrogen Levels</span>
                </div>
                <div className="flex-1 h-32 bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4 flex flex-col justify-end">
                  <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">65%</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Moisture Content</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <section className="relative z-10 py-24 bg-white/80 dark:bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">Powerful Features for Modern Agriculture</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Our toolkit provides everything a modern farmer needs to succeed in a changing climate.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'AI Prediction', desc: 'Predict best crops using ML models trained on soil & weather data.', icon: Zap, color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
              { title: 'Disease Detection', desc: 'Upload images to instantly identify crop diseases and get remedies.', icon: ShieldCheck, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
              { title: 'Smart Chatbot', desc: 'Get expert advice 24/7 with our multi-language AI assistant.', icon: Globe, color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
              { title: 'Real-time Weather', desc: 'Stay updated with precision weather forecasting for your location.', icon: Globe, color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-green-50/50 dark:bg-slate-900 border border-green-100 dark:border-slate-800 rounded-3xl hover:bg-white dark:hover:bg-slate-800 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className={`p-4 rounded-2xl w-fit mb-6 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 bg-slate-900 py-12 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center items-center gap-2 mb-6">
            <Leaf className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold">AgroVision Pro</span>
          </div>
          <p className="text-slate-400 text-sm mb-8">© 2026 AgroSmart Technologies. Empowering the global agricultural community.</p>
          <div className="flex justify-center gap-8 text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
