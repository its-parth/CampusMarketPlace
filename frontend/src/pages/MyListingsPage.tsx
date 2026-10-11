import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { ShoppingBag, PlusCircle, Edit, Trash2, Eye, Heart, Loader2 } from 'lucide-react';
import api from '../services/api';

export const MyListingsPage: React.FC = () => {
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const res = await api.get('/products/seller/my-listings');
      setListings(res.data.data || []);
    } catch (err) {
      console.error('Failed to load my listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/products/${id}`);
      setListings(listings.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product.');
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
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Product Listings</h1>
          <p className="text-xs text-slate-500 mt-1">Manage items you have listed for sale on campus</p>
        </div>

        <Link
          to="/products/new"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 w-fit"
        >
          <PlusCircle className="w-4 h-4" /> Add New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No active listings yet</h3>
          <p className="text-xs text-slate-500">Post your unused textbooks, electronics, or dorm furniture to earn money from fellow students.</p>
          <Link
            to="/products/new"
            className="inline-block px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Item Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Stats</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.primary_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80'}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <Link to={`/products/${item.id}`} className="font-bold text-slate-900 hover:text-brand-600 line-clamp-1">
                            {item.title}
                          </Link>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{item.campus_location}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-slate-700">{item.category_name}</td>

                    <td className="p-4 font-extrabold text-slate-900">₹{item.price}</td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : item.status === 'RESERVED' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="p-4 space-y-0.5 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-400" /> {item.views_count} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400" /> {item.favorites_count} saved
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/products/${item.id}/edit`}
                          className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(item.id)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
