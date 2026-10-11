import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Campus<span className="text-brand-400">Mart</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              The AI-powered campus marketplace designed exclusively for verified college students to safely buy, sell, and trade courseware & dorm essentials.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Student Network
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Marketplace</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/marketplace?category=textbooks" className="hover:text-white transition-colors">Textbooks & Notes</Link></li>
              <li><Link to="/marketplace?category=electronics" className="hover:text-white transition-colors">Laptops & Calculators</Link></li>
              <li><Link to="/marketplace?category=dorm-furniture" className="hover:text-white transition-colors">Dorm Furniture & Fridges</Link></li>
              <li><Link to="/marketplace?category=apparel" className="hover:text-white transition-colors">Campus Apparel</Link></li>
              <li><Link to="/marketplace?category=services" className="hover:text-white transition-colors">Tutoring & Services</Link></li>
            </ul>
          </div>

          {/* AI Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Suite
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/recommended" className="hover:text-white transition-colors">Smart Personal Feed</Link></li>
              <li><Link to="/products/new" className="hover:text-white transition-colors">AI Listing Assistant</Link></li>
              <li><Link to="/products/new" className="hover:text-white transition-colors">AI Price Suggestion</Link></li>
              <li><Link to="/marketplace" className="hover:text-white transition-colors">Smart Keyword Extraction</Link></li>
            </ul>
          </div>

          {/* Legal & Help */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Platform & Support</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Help & Contact</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/verify" className="hover:text-white transition-colors">Student Verification Process</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CampusMart Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for State University Students
          </p>
        </div>
      </div>
    </footer>
  );
};
