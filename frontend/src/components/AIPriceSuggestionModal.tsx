import React, { useState } from 'react';
import { Sparkles, Loader2, DollarSign, TrendingUp, Check, X } from 'lucide-react';
import api from '../services/api';

interface AIPriceSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  categoryId: number;
  conditionState: string;
  originalPrice: string;
  onSelectPrice: (price: number) => void;
}

export const AIPriceSuggestionModal: React.FC<AIPriceSuggestionModalProps> = ({
  isOpen,
  onClose,
  title,
  categoryId,
  conditionState,
  originalPrice,
  onSelectPrice
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    minPrice: number;
    recommendedPrice: number;
    maxPrice: number;
    reasoning: string;
  } | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFetchSuggestion = async () => {
    if (!title || !categoryId || !conditionState) {
      setError('Please select category and condition first.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await api.post('/ai/suggest-price', {
        title,
        categoryId,
        conditionState,
        originalPrice
      });
      setSuggestion(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to analyze pricing.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-elevated border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Price Estimator & Guidance</h3>
              <p className="text-xs text-slate-500">Benchmark against real campus market sales</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        {!suggestion ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Our AI engine checks current active campus listings and historical transaction prices in this category to calculate the optimal selling price for fast conversion.
            </p>
            <button
              onClick={handleFetchSuggestion}
              disabled={isLoading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Market Data...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" /> Calculate Optimal Price
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => { onSelectPrice(suggestion.minPrice); onClose(); }}
                className="p-3 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 text-center transition-all group"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fast Sale</span>
                <span className="text-lg font-extrabold text-slate-800 group-hover:text-brand-600">₹{suggestion.minPrice}</span>
              </button>

              <button
                onClick={() => { onSelectPrice(suggestion.recommendedPrice); onClose(); }}
                className="p-3 rounded-xl border-2 border-brand-500 bg-brand-50/80 text-center shadow-sm relative group"
              >
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  Recommended
                </span>
                <span className="text-lg font-extrabold text-brand-700 block mt-1">₹{suggestion.recommendedPrice}</span>
              </button>

              <button
                onClick={() => { onSelectPrice(suggestion.maxPrice); onClose(); }}
                className="p-3 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 text-center transition-all group"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Max Value</span>
                <span className="text-lg font-extrabold text-slate-800 group-hover:text-brand-600">₹{suggestion.maxPrice}</span>
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Market Insights:
              </span>
              <p className="text-slate-600 leading-relaxed">{suggestion.reasoning}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
