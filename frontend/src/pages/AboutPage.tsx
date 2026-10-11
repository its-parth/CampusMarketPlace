import React from 'react';
import { ShoppingBag, ShieldCheck, Sparkles, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">About CampusMart AI</h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Empowering college students with a safe, verified, AI-driven peer-to-peer campus marketplace.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-subtle space-y-6 text-xs text-slate-600 leading-relaxed">
        <h2 className="text-base font-bold text-slate-900">Our Mission</h2>
        <p>
          Textbooks, electronics, dorm fridges, and campus supplies shouldn't cost students an arm and a leg. CampusMart was created to connect students directly within the same university community to buy and sell used courseware and dorm gear at fair prices.
        </p>

        <h2 className="text-base font-bold text-slate-900">Key Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800">Verified Campus Network</h3>
            <p className="text-[11px] text-slate-500">Only student email and ID verified accounts can participate, preventing online scams.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800">AI Intelligence</h3>
            <p className="text-[11px] text-slate-500">Automated price suggestions and listing copywriting help items sell 3x faster.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <Users className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-800">Local Campus Meetups</h3>
            <p className="text-[11px] text-slate-500">Zero shipping fees or middleman cuts. Meet safely at the Student Union or Library Quad.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
