import React, { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/features/Dashboard';
import { CropPrediction } from './components/features/CropPrediction';
import { FertilizerRecommendation } from './components/features/FertilizerRecommendation';
import { DiseaseDetection } from './components/features/DiseaseDetection';
import { ChatAssistant } from './components/features/ChatAssistant';
import { CropGuide } from './components/features/CropGuide';
import { Profile } from './components/features/Profile';
import { Settings } from './components/features/Settings';
import { AnimatePresence } from 'motion/react';
import { ThemeProvider } from './components/ThemeContext';
import { SettingsProvider } from './components/SettingsContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Generate a consistent mock user for the session
  const mockUser = {
    uid: 'guest-farmer',
    displayName: 'Farmer Guest',
    email: 'guest@agrovision.pro',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AgroGuest'
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={mockUser} />;
      case 'crop': return <CropPrediction />;
      case 'fertilizer': return <FertilizerRecommendation />;
      case 'disease': return <DiseaseDetection />;
      case 'guide': return <CropGuide />;
      case 'chat': return <ChatAssistant />;
      case 'profile': return <Profile setActiveTab={setActiveTab} user={mockUser} />;
      case 'settings': return <Settings />;
      default: return <Dashboard user={mockUser} />;
    }
  };

  return (
    <ThemeProvider>
      <SettingsProvider>
        <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={mockUser as any}>
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </Layout>
      </SettingsProvider>
    </ThemeProvider>
  );
}
