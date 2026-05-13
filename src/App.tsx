import React, { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/features/Dashboard';
import { CropPrediction } from './components/features/CropPrediction';
import { FertilizerRecommendation } from './components/features/FertilizerRecommendation';
import { DiseaseDetection } from './components/features/DiseaseDetection';
import { ChatAssistant } from './components/features/ChatAssistant';
import { CropGuide } from './components/features/CropGuide';
import { LandingPage } from './components/features/LandingPage';
import { Profile } from './components/features/Profile';
import { Settings } from './components/features/Settings';
import { AnimatePresence } from 'motion/react';
import { ThemeProvider } from './components/ThemeContext';
import { SettingsProvider } from './components/SettingsContext';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
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
      case 'profile': return <Profile setActiveTab={setActiveTab} />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <SettingsProvider>
        {!user ? (
          <LandingPage />
        ) : (
          <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user}>
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </Layout>
        )}
      </SettingsProvider>
    </ThemeProvider>
  );
}
