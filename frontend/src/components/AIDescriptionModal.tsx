import React, { useState } from 'react';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import api from '../services/api';

interface AIDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category: string;
  condition: string;
  targetPrice: string;
  onApply: (enhancedTitle: string, description: string) => void;
}

export const AIDescriptionModal: React.FC<AIDescriptionModalProps> = ({
  isOpen,
  onClose,
  title,
  category,
  condition,
  targetPrice,
  onApply
}) => {
  const [keyPoints, setKeyPoints] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ enhancedTitle: string; description: string } | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!title) {
      setError('Please type a draft item title first.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await api.post('/ai/generate-description', {
        title,
        category,
        condition,
        keyPoints,
        targetPrice
      });
      setResult({
        enhancedTitle: res.data.data.enhancedTitle || title,
        description: res.data.data.description
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate AI description.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApply(result.enhancedTitle, result.description);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-elevated border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Listing Description Assistant</h3>
              <p className="text-xs text-slate-500">Auto-generate compelling titles & campus-optimized copy</p>
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

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Additional Key Details / Bullet Points (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Purchased last semester, no highlight marks, unredeemed online code..."
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-brand-500 outline-none"
            />
          </div>

          {!result ? (
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating AI Description...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Description
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Generated Title:</span>
                <p className="font-semibold text-slate-900 bg-white p-2.5 rounded-lg border border-slate-200">{result.enhancedTitle}</p>
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-1">Generated Description:</span>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                  {result.description}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleApply}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" /> Apply To Listing
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl"
                >
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
