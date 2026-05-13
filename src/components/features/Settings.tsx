import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  Globe, 
  Thermometer, 
  Shield, 
  User, 
  Smartphone,
  Mail,
  Languages,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSettings } from '../SettingsContext';

export function Settings() {
  const { settings, updateSettings, t } = useSettings();
  
  const [notifications, setNotifications] = useState(settings.notifications);
  const [units, setUnits] = useState(settings.units);
  const [language, setLanguage] = useState(settings.language);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => setIsSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  const handleSave = () => {
    updateSettings({
      notifications,
      units,
      language: language as any
    });
    setIsSaved(true);
  };

  const handleDiscard = () => {
    setNotifications(settings.notifications);
    setUnits(settings.units);
    setLanguage(settings.language);
  };

  const SettingCard = ({ title, description, icon: Icon, children, className }: any) => (
    <div className={cn("bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-green-50 dark:border-slate-800 shadow-sm", className)}>
      <div className="flex items-start gap-4 mb-8">
        <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-2xl">
          <Icon className="w-6 h-6 text-green-600 dark:text-green-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{description}</p>
        </div>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ enabled, onChange, label, sublabel }: any) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-bold text-slate-800 dark:text-slate-200">{label}</p>
        {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
      </div>
      <button 
        onClick={() => onChange(!enabled)}
        className={cn(
          "w-12 h-6 rounded-full transition-all duration-300 relative",
          enabled ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
          enabled ? "left-7" : "left-1"
        )} />
      </button>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-20"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{t('settings')}</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your preferences and application settings.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Notifications */}
        <SettingCard 
          title={t('notifications')} 
          description="Decide how you'd like to stay informed."
          icon={Bell}
        >
          <Toggle 
            label="Push Notifications" 
            sublabel="Real-time alerts for crop health"
            enabled={notifications.push} 
            onChange={(val: boolean) => setNotifications({...notifications, push: val})} 
          />
          <Toggle 
            label="Email Updates" 
            sublabel="Weekly agricultural summaries"
            enabled={notifications.email} 
            onChange={(val: boolean) => setNotifications({...notifications, email: val})} 
          />
          <Toggle 
            label="App Updates" 
            sublabel="New features and improvements"
            enabled={notifications.updates} 
            onChange={(val: boolean) => setNotifications({...notifications, updates: val})} 
          />
        </SettingCard>

        {/* Preferences */}
        <SettingCard 
          title="Preferences" 
          description="Customize the app experience for your region."
          icon={Globe}
        >
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('units')}</p>
            <div className="flex p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <button 
                onClick={() => setUnits({...units, temp: 'celsius'})}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                  units.temp === 'celsius' ? "bg-white dark:bg-slate-700 text-green-600 shadow-sm" : "text-slate-500"
                )}
              >
                Celsius (°C)
              </button>
              <button 
                onClick={() => setUnits({...units, temp: 'fahrenheit'})}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                  units.temp === 'fahrenheit' ? "bg-white dark:bg-slate-700 text-green-600 shadow-sm" : "text-slate-500"
                )}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('language')}</p>
            <div className="relative">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 outline-none appearance-none font-medium text-slate-700 dark:text-slate-200"
              >
                <option value="english">English</option>
                <option value="hindi">Hindi (हिंदी)</option>
                <option value="kannada">Kannada (ಕನ್ನಡ)</option>
                <option value="marathi">Marathi (मराठी)</option>
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
            </div>
          </div>
        </SettingCard>

        {/* Security */}
        <SettingCard 
          title="Account & Security" 
          description="Manage your account data and privacy."
          icon={Shield}
          className="md:col-span-2"
        >
          <div className="grid sm:grid-cols-2 gap-6">
            <button className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Change Profile Data</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            <button className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-slate-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Linked Devices</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </SettingCard>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        {isSaved && (
          <motion.p 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-green-600 font-bold self-center mr-4 flex items-center gap-1"
          >
            <CheckCircle2 className="w-4 h-4" /> {t('settingsApplied')}
          </motion.p>
        )}
        <button 
          onClick={handleDiscard}
          className="px-8 py-3 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all"
        >
          {t('discardChanges')}
        </button>
        <button 
          onClick={handleSave}
          className="px-8 py-3 rounded-2xl font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100 dark:shadow-none transition-all flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" /> {t('saveSettings')}
        </button>
      </div>
    </motion.div>
  );
}
