import React from 'react';
import { motion } from 'motion/react';
import { auth } from '../../lib/firebase';
import { User, Mail, Calendar, MapPin, Award, Settings, Bell, Shield } from 'lucide-react';

export function Profile({ setActiveTab, user }: { setActiveTab: (tab: string) => void, user: any }) {
  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-green-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-green-600 to-emerald-800" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 mt-12">
          <div className="w-32 h-32 rounded-3xl border-4 border-white bg-white shadow-xl overflow-hidden">
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 text-center md:text-left pb-2">
            <h1 className="text-3xl font-black text-slate-900">{user.displayName || 'Farmer Member'}</h1>
            <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4" /> {user.email}
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('settings')}
            className="mb-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
          >
            <Settings className="w-4 h-4" /> Account Settings
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-green-50 shadow-sm">
             <h3 className="font-bold flex items-center gap-2 mb-6 text-slate-900">
               <Award className="w-5 h-5 text-amber-500" />
               Account Achievements
             </h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100/50">
                  <p className="text-2xl font-black text-amber-700">Level 1</p>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Early Adopter</p>
                </div>
                <div className="p-6 bg-green-50/50 rounded-3xl border border-green-100/50">
                  <p className="text-2xl font-black text-green-700">12</p>
                  <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Predictions Made</p>
                </div>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-green-50 shadow-sm">
             <h3 className="font-bold mb-6">Recent Activity</h3>
             <div className="space-y-4">
               {[
                 { action: 'Crop Prediction', target: 'Rice', time: '2 hours ago' },
                 { action: 'Health Scan', target: 'Tomato Blight', time: 'Yesterday' },
                 { action: 'Chat Query', target: 'Organic Fertilizer', time: '3 days ago' },
               ].map((act, i) => (
                 <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          <Settings className="w-4 h-4 text-slate-500" />
                       </div>
                       <div>
                          <p className="text-sm font-bold">{act.action}: {act.target}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{act.time}</p>
                       </div>
                    </div>
                    <Award className="w-4 h-4 text-slate-200" />
                 </div>
               ))}
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-green-50 shadow-sm">
              <h3 className="font-bold mb-6">Member Details</h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-slate-600">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Joined June 2026</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-600">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Maharashtra, India</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-600">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Verified Farmer Status</span>
                 </div>
              </div>
           </div>

           <div className="bg-green-700 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <Bell size={80} />
              </div>
              <h3 className="text-xl font-black mb-4">Pro Membership</h3>
              <p className="text-sm text-green-100 mb-6 leading-relaxed">Upgrade for unlimited scans and advanced market analytics.</p>
              <button className="w-full py-3 bg-white text-green-700 rounded-xl font-bold hover:bg-green-50 transition-all">
                Learn More
              </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
