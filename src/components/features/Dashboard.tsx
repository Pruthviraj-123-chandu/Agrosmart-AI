import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  History, 
  CloudSun, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  Sprout,
  Calendar,
  Waves
} from 'lucide-react';
import { CROP_DATA } from '../../constants';
import { cn } from '../../lib/utils';
import { useTheme } from '../ThemeContext';
import { useSettings } from '../SettingsContext';

const DATA = [
  { name: 'Jan', yield: 400 },
  { name: 'Feb', yield: 300 },
  { name: 'Mar', yield: 600 },
  { name: 'Apr', yield: 800 },
  { name: 'May', yield: 500 },
  { name: 'Jun', yield: 900 },
];

export function Dashboard({ user }: { user?: any }) {
  const { theme } = useTheme();
  const { settings, t } = useSettings();
  const [weather, setWeather] = useState({ temp: 29, city: 'Davanagere, KA', condition: 'Sunny' });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [marketPrices, setMarketPrices] = useState([
    { name: 'Wheat', price: 215.4, change: +1.2, unit: 'q' },
    { name: 'Rice', price: 185.0, change: -0.5, unit: 'q' },
    { name: 'Corn', price: 142.5, change: +0.8, unit: 'q' },
    { name: 'Soybean', price: 450.2, change: +2.1, unit: 'q' },
  ]);

  const fetchLocation = () => {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (navigator.geolocation) {
      setLoadingLocation(true);
      
      // Safety timeout for geolocation
      const timeoutId = setTimeout(() => {
        if (loadingLocation) {
          setLoadingLocation(false);
          setWeather(prev => ({ ...prev, city: 'Default Location (Timeout)' }));
        }
      }, 8000);

      navigator.geolocation.getCurrentPosition(async (position) => {
        clearTimeout(timeoutId);
        const { latitude, longitude } = position.coords;
        
        try {
          if (apiKey) {
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
            );
            const data = await response.json();
            if (data.main && data.weather) {
              setWeather({
                temp: Math.round(data.main.temp),
                city: data.name,
                condition: data.weather[0].main
              });
            }
          } else {
            setWeather(prev => ({ 
              ...prev, 
              city: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°` 
            }));
          }
        } catch (error) {
          console.error("Error fetching weather:", error);
        } finally {
          setLoadingLocation(false);
        }
      }, (error) => {
        clearTimeout(timeoutId);
        console.error("Geolocation error:", error.message || error);
        let statusMsg = "Location Blocked";
        let detailedMsg = "Please click the 'Allow' button in your browser popup.";
        
        if (error.message?.includes('permissions policy') || error.code === 1) {
          statusMsg = "Access Denied";
          detailedMsg = "Permissions policy blocked geolocation. Please allow location access or open the app in a new tab.";
          console.warn("Geolocation blocked by permissions policy. Ensure 'geolocation' is in metadata.json and user allowed access.");
        } else if (error.code === 3) {
          statusMsg = "Timeout";
          detailedMsg = "Location request timed out. Please try refreshing.";
        }

        setWeather(prev => ({ 
          ...prev, 
          condition: statusMsg,
          city: detailedMsg
        }));
        setLoadingLocation(false);
      }, { timeout: 15000, enableHighAccuracy: false }); // Increased timeout and disabled high accuracy for better reliability
    }
  };

  React.useEffect(() => {
    fetchLocation();
    
    // Live Clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Simulated Market Price Updates
    const marketTimer = setInterval(() => {
      setMarketPrices(prev => prev.map(item => ({
        ...item,
        price: Number((item.price + (Math.random() * 0.4 - 0.2)).toFixed(2)),
        change: Number((item.change + (Math.random() * 0.1 - 0.05)).toFixed(2))
      })));
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(marketTimer);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">{t('welcomeBack')}, {user?.displayName?.split(' ')[0] || 'Farmer'}!</h1>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
              {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          <div className="hidden md:block w-px h-12 bg-slate-200 dark:bg-slate-800" />
          
          <div className="flex items-center gap-6 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {marketPrices.map((market, idx) => (
              <div key={idx} className="flex flex-col min-w-[100px]">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{market.name}</span>
                  {market.change >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black text-slate-900 dark:text-white">${market.price}</span>
                  <span className={cn("text-[10px] font-bold", market.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                    {market.change >= 0 ? "+" : ""}{market.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div 
          onClick={fetchLocation}
          className="group flex items-center gap-6 bg-white dark:bg-slate-900 px-6 py-3 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:border-green-200 dark:hover:border-green-900 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-amber-50 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform duration-500">
              <CloudSun className="w-7 h-7 text-amber-500" />
            </div>
            
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-slate-950 dark:text-white leading-none">
                  {settings.units.temp === 'fahrenheit' 
                    ? Math.round((weather.temp * 9/5) + 32)
                    : weather.temp
                  }°{settings.units.temp === 'fahrenheit' ? 'F' : 'C'}
                </p>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" title="Live Update" />
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 capitalize whitespace-nowrap">
                {loadingLocation ? (
                  "Locating..."
                ) : (
                  `${weather.condition} • ${weather.city}`
                )}
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex flex-col items-end border-l border-slate-100 dark:border-slate-800 pl-6 space-y-0.5">
            <p className="text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-wider">{t('soilHealth')}</p>
            <p className="text-xs font-bold text-slate-950 dark:text-white">{t('optimal')}</p>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Yield', value: '45,280 kg', change: '+12.5%', color: 'text-green-600', icon: TrendingUp },
          { label: 'Avg Crop Profit', value: '$2,450/ac', change: '+5.2%', color: 'text-green-600', icon: DollarSign },
          { label: 'Successful Predictions', value: '128', change: '+14', color: 'text-blue-600', icon: History },
          { label: 'Market Stability', value: 'Moderate', change: '-2.1%', color: 'text-amber-600', icon: Sprout },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-green-50 dark:border-slate-800 shadow-sm shadow-green-100/50 dark:shadow-none flex flex-col justify-between h-40"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'} flex items-center gap-1`}>
                {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative h-[500px] rounded-[3rem] overflow-hidden group shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070&auto=format&fit=crop" 
            alt="Featured Crop" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
            <div className="absolute bottom-10 left-10 right-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 rounded-full text-white text-[10px] font-bold uppercase tracking-wider mb-4">
                <TrendingUp className="w-3 h-3" />
                Featured Crop of the Month
              </div>
              <h2 className="text-4xl font-black text-white mb-4">The Golden Harvest: Organic Corn</h2>
              <div className="grid grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Season
                  </span>
                  <p className="text-sm font-bold text-white">Khareef (Jun-Aug)</p>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                    <Waves className="w-3 h-3" />
                    Moisture
                  </span>
                  <p className="text-sm font-bold text-white">Medium-High</p>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Profit Index
                  </span>
                  <p className="text-sm font-bold text-white">+18.4% WoW</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-green-50 dark:border-slate-800 shadow-sm dark:shadow-none flex flex-col h-full">
          <h3 className="text-xl font-bold mb-6 dark:text-white">Crop Statistics</h3>
          <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
            {CROP_DATA.map((crop, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-950/20 flex items-center justify-center text-green-700 dark:text-green-500 font-bold group-hover:scale-110 transition-transform">
                    {crop.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{crop.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{crop.yield}% yield rate</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-700 dark:text-green-500 text-sm">${crop.profit}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Avg Profit</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-4 bg-slate-900 dark:bg-green-600 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 dark:hover:bg-green-700 active:scale-95 shadow-xl shadow-slate-100 dark:shadow-none">
            Export Data (PDF)
          </button>
        </div>
      </div>
    </motion.div>
  );
}
