import React from 'react';
import { motion } from 'motion/react';
import { Leaf, ShieldCheck, Zap, Globe, ArrowRight, Sun, Moon } from 'lucide-react';
import { signInWithGoogle, loginWithEmail, signupWithEmail, resetPassword } from '../../lib/firebase';
import { useTheme } from '../ThemeContext';
import { Mail, Lock, UserPlus, LogIn, ChevronRight } from 'lucide-react';

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [error, setError] = React.useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in window was closed. If popups are blocked, try opening the app in a new tab.');
      } else if (err.code === 'auth/cancelled-by-user') {
        setError('Sign-in was cancelled.');
      } else {
        setError(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    try {
      setLoading(true);
      setError(null);
      if (isSignUp) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No user found with this email. Try signing up!');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try signing in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password auth is not enabled. Please enable it in the Firebase Console.');
      } else {
        setError(err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => setShowEmailForm(true)}
            className="text-green-700 dark:text-green-400 font-medium hover:underline hidden sm:block"
          >
            Sign In
          </button>
          <button 
            onClick={handleSignIn}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full font-medium shadow-lg shadow-green-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2"
          >
            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center p-0.5">
               <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" />
            </div>
            Sign In
          </button>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center justify-between"
            >
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-2">×</button>
            </motion.div>
          )}

          {!showEmailForm ? (
            <>
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
                  onClick={() => setShowEmailForm(true)}
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
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-green-100 dark:border-slate-800 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{isSignUp ? 'Join our community of smart farmers' : 'Access your agricultural dashboard'}</p>
                </div>
                <button onClick={() => setShowEmailForm(false)} className="text-slate-400 hover:text-slate-600">×</button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="farmer@agrovision.pro"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>

                {!isSignUp && (
                  <button 
                    type="button"
                    onClick={async () => {
                      if (!email) { setError('Enter your email first'); return; }
                      try { await resetPassword(email); setError('Password reset email sent!'); } catch (err: any) { setError(err.message); }
                    }}
                    className="text-xs text-green-600 hover:underline font-medium ml-1"
                  >
                    Forgot Password?
                  </button>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-green-100 dark:shadow-none flex items-center justify-center gap-2 group"
                >
                  {loading ? 'Processing...' : isSignUp ? 'Sign Up Now' : 'Sign In'}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-white dark:bg-slate-900 px-4 text-slate-400">Or continue with</span></div>
              </div>

              <button 
                onClick={handleSignIn}
                disabled={loading}
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="" />
                Sign in with Google
              </button>

              <p className="mt-8 text-center text-sm text-slate-500">
                {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="ml-2 font-bold text-green-600 hover:underline"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </motion.div>
          )}
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
