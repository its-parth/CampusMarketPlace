import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { ShoppingBag, Star, CheckCircle, Clock, MapPin, Loader2 } from 'lucide-react';
import api from '../services/api';

export const MyPurchasesPage: React.FC = () => {
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [reviewTxId, setReviewTxId] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const res = await api.get('/transactions/purchases');
      setPurchases(res.data.data || []);
    } catch (err) {
      console.error('Failed to load purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTxId) return;
    setReviewLoading(true);
    try {
      await api.post('/reviews', {
        transaction_id: reviewTxId,
        rating,
        comment
      });
      setReviewTxId(null);
      setRating(5);
      setComment('');
      loadPurchases();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Purchases</h1>
        <p className="text-xs text-slate-500 mt-1">Track orders, meetup locations, and submit seller reviews</p>
      </div>

      {purchases.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No purchase transactions yet</h3>
          <p className="text-xs text-slate-500">When you request to buy an item or submit an offer, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((tx) => (
            <div key={tx.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-subtle">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={tx.product_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80'}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{tx.product_title}</h3>
                    <p className="text-xs font-extrabold text-brand-600 mt-0.5">₹{tx.agreed_price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : tx.status === 'ACCEPTED' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : tx.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {tx.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Meetup: <strong>{tx.meetup_location || 'Campus Student Union'}</strong></span>
                </div>
                <div>
                  Seller: <strong>{tx.seller_name}</strong> ({tx.seller_email})
                </div>
                <div className="text-right">
                  Date: {new Date(tx.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Review Section */}
              {tx.status === 'COMPLETED' && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {tx.review_id ? (
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="font-bold flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {tx.rating}/5 Rated
                      </span>
                      <span className="text-slate-400">"{tx.review_comment}"</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReviewTxId(tx.id)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <Star className="w-4 h-4" /> Rate & Review Seller
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* RATING MODAL */}
      {reviewTxId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-elevated">
            <h3 className="text-base font-bold text-slate-900">Leave Feedback for Seller</h3>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-2">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-2 rounded-xl transition-all"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Written Feedback</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Was the seller on time? Item condition matched description?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setReviewTxId(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
