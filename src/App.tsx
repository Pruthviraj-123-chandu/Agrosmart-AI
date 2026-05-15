import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/features/Dashboard';
import { CropPrediction } from './components/features/CropPrediction';
import { FertilizerRecommendation } from './components/features/FertilizerRecommendation';
import { DiseaseDetection } from './components/features/DiseaseDetection';
import { ChatAssistant } from './components/features/ChatAssistant';
import { CropGuide } from './components/features/CropGuide';
import { Profile } from './components/features/Profile';
import { Settings } from './components/features/Settings';
import { LandingPage } from './components/features/LandingPage';
import { AnimatePresence } from 'motion/react';
import { ThemeProvider } from './components/ThemeContext';
import { SettingsProvider } from './components/SettingsContext';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuthing, setLoadingAuthing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuthing(false);
    });
    return () => unsubscribe();
  }, []);

  if (loadingAuthing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f0fdf4] dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-green-800 dark:text-green-400 font-bold uppercase tracking-widest text-xs">AgroVision Pro</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <LandingPage />
      </ThemeProvider>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'crop': return <CropPrediction />;
      case 'fertilizer': return <FertilizerRecommendation />;
      case 'disease': return <DiseaseDetection />;
      case 'guide': return <CropGuide />;
      case 'chat': return <ChatAssistant />;
      case 'profile': return <Profile setActiveTab={setActiveTab} user={user} />;
      case 'settings': return <Settings />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <ThemeProvider>
      <SettingsProvider>
        <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user as any}>
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </Layout>
      </SettingsProvider>
    </ThemeProvider>
  );
}
