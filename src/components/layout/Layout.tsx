import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Sprout, 
  FlaskConical, 
  Bug, 
  MessageSquare, 
  User as UserIcon,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Leaf,
  BookOpen,
  Settings as SettingsIcon,
  Droplets
} from 'lucide-react';
import { auth } from '../../lib/firebase';
import { User } from 'firebase/auth';
import { cn } from '../../lib/utils';
import { useTheme } from '../ThemeContext';
import { useSettings } from '../SettingsContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
}

export function Layout({ children, activeTab, setActiveTab, user }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useSettings();

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'guide', label: t('cropEncyclopedia'), icon: BookOpen },
    { id: 'crop', label: t('cropRecommendation'), icon: Sprout },
    { id: 'fertilizer', label: t('fertilizerAssistant'), icon: Droplets },
    { id: 'disease', label: t('diseaseDetection'), icon: Bug },
    { id: 'chat', label: t('aiAssistant'), icon: MessageSquare },
    { id: 'profile', label: t('profile'), icon: UserIcon },
    { id: 'settings', label: t('settings'), icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#f0fdf4] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-green-200 dark:selection:bg-green-900 transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-green-100 dark:border-slate-800 hidden lg:flex flex-col z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 bg-green-600 rounded-lg">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-green-700 to-green-900 dark:from-green-400 dark:to-green-600 bg-clip-text text-transparent">
            AgroVision Pro
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                activeTab === item.id 
                  ? "bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/20" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-slate-800 hover:text-green-700 dark:hover:text-green-400"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "" : "group-hover:scale-110 transition-transform")} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-green-100 dark:border-slate-800 italic text-xs text-green-700 dark:text-green-500 text-center">
          Empowering Farmers with AI
        </div>
      </aside>

      {/* Header - Mobile & Desktop Content Header */}
      <header className="lg:ml-64 h-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-green-100 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
        <button 
          className="lg:hidden p-2 text-slate-600 dark:text-slate-400"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>

        <div className="flex-1 hidden lg:block px-4">
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{user.displayName || 'Farmer'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 dark:bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <motion.nav 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            className="w-64 h-full bg-white dark:bg-slate-900 p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
             <div className="flex items-center gap-3 mb-8">
              <Leaf className="w-6 h-6 text-green-600 dark:text-green-500" />
              <span className="text-xl font-bold dark:text-white">AgroVision Pro</span>
            </div>
            <div className="space-y-4">
               {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
                    activeTab === item.id ? "bg-green-600 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </motion.nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="lg:ml-64 p-6 lg:p-10 min-h-[calc(100vh-64px)] overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
