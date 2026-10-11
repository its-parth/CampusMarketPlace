import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { ShoppingBag, Check, X, MapPin, Loader2 } from 'lucide-react';
import api from '../services/api';

export const MySalesPage: React.FC = () => {
  const [sales, setSales] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const res = await api.get('/transactions/sales');
      setSales(res.data.data || []);
    } catch (err) {
      console.error('Failed to load sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/transactions/${id}/status`, { status });
      loadSales();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status.');
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
        <h1 className="text-2xl font-extrabold text-slate-900">Buyer Inquiries & Sales</h1>
        <p className="text-xs text-slate-500 mt-1">Accept buyer offers, arrange meetups, and confirm completed transactions</p>
      </div>

      {sales.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No incoming buy requests yet</h3>
          <p className="text-xs text-slate-500">When students submit offers or buy requests for your items, they will show up here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((tx) => (
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
                <div>
                  Buyer: <strong>{tx.buyer_name}</strong>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Meetup: <strong>{tx.meetup_location || 'Campus Student Union'}</strong></span>
                </div>
                <div className="text-right">
                  Requested: {new Date(tx.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                {tx.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(tx.id, 'ACCEPTED')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Accept Offer
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(tx.id, 'CANCELLED')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Decline
                    </button>
                  </>
                )}

                {tx.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleUpdateStatus(tx.id, 'COMPLETED')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" /> Mark Trade Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
