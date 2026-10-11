import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchProductById, toggleFavoriteLocal } from '../store/productSlice';
import { 
  Heart, MessageSquare, ShieldCheck, MapPin, Eye, Star, Calendar, 
  ArrowLeft, ShoppingBag, Flag, AlertTriangle, Check, Loader2, Sparkles 
} from 'lucide-react';
import api from '../services/api';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentProduct, isLoading } = useSelector((state: RootState) => state.products);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [makeOfferOpen, setMakeOfferOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [meetupLocation, setMeetupLocation] = useState('');
  const [offerNotes, setOfferNotes] = useState('');
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Inaccurate description');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentProduct) {
      setSelectedImage(currentProduct.primary_image || (currentProduct.images && currentProduct.images[0]?.image_url) || '');
      setOfferPrice(currentProduct.price.toString());
      setMeetupLocation(currentProduct.campus_location || 'Campus Student Union');
    }
  }, [currentProduct]);

  if (isLoading || !currentProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading item details...</p>
      </div>
    );
  }

  const isSeller = user && user.id === currentProduct.seller_id;

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post('/conversations', { product_id: currentProduct.id });
      navigate(`/chat?conversationId=${res.data.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start chat.');
    }
  };

  const handleMakeOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setOfferLoading(true);
    try {
      await api.post('/transactions', {
        product_id: currentProduct.id,
        agreed_price: parseFloat(offerPrice),
        meetup_location: meetupLocation,
        notes: offerNotes
      });
      setOfferSuccess(true);
      setTimeout(() => {
        setMakeOfferOpen(false);
        setOfferSuccess(false);
        navigate('/purchases');
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send offer.');
    } finally {
      setOfferLoading(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setReportLoading(true);
    try {
      await api.post('/reports', {
        target_type: 'PRODUCT',
        target_id: currentProduct.id,
        reason: reportReason,
        description: reportDesc
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportOpen(false);
        setReportSuccess(false);
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to listings
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-subtle relative">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
              alt={currentProduct.title}
              className="w-full h-full object-cover"
            />
            {currentProduct.status !== 'AVAILABLE' && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold uppercase tracking-widest">
                {currentProduct.status}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {currentProduct.images && currentProduct.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {currentProduct.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${selectedImage === img.image_url ? 'border-brand-600 ring-2 ring-brand-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'}`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 shadow-subtle">
            
            {/* Category & Condition */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                {currentProduct.category_name}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                Condition: {currentProduct.condition_state.replace('_', ' ')}
              </span>
            </div>

            {/* Title & Price */}
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 leading-snug">{currentProduct.title}</h1>
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-3xl font-black text-slate-900">
                  ₹{parseFloat(currentProduct.price.toString()).toFixed(2)}
                </span>
                {currentProduct.original_price && (
                  <span className="text-sm text-slate-400 line-through">
                    ₹{parseFloat(currentProduct.original_price.toString()).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Location & Views */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span className="font-medium">{currentProduct.campus_location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-slate-400" />
                <span>{currentProduct.views_count} views</span>
              </div>
            </div>

            {/* Seller Info Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={currentProduct.seller_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={currentProduct.seller_name}
                    className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      {currentProduct.seller_name}
                      {currentProduct.seller_verification === 'VERIFIED' && (
                        <span title="Verified Student">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500">{currentProduct.seller_university || 'State University'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {currentProduct.seller_rating || '5.0'}
                  </span>
                  <span className="text-[10px] text-slate-400">({currentProduct.seller_rating_count || 1} reviews)</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isSeller && currentProduct.status === 'AVAILABLE' && (
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleStartChat}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" /> Message Seller
                </button>

                <button
                  onClick={() => setMakeOfferOpen(true)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" /> Make Offer / Request Buy
                </button>
              </div>
            )}

            {isSeller && (
              <div className="p-3 text-center bg-brand-50 text-brand-700 font-bold text-xs rounded-xl border border-brand-200">
                You are the seller of this listing.
              </div>
            )}

            {/* Report Button */}
            <div className="pt-2 text-center">
              <button
                onClick={() => setReportOpen(true)}
                className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 mx-auto transition-colors"
              >
                <Flag className="w-3 h-3" /> Report this listing
              </button>
            </div>

          </div>

          {/* Description Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-3 shadow-subtle">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Product Description</h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {currentProduct.description}
            </p>
          </div>

        </div>

      </div>

      {/* MAKE OFFER MODAL */}
      {makeOfferOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-elevated border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Initiate Purchase Request</h3>
            
            {offerSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl text-center">
                Offer sent to seller! Redirecting to purchases...
              </div>
            ) : (
              <form onSubmit={handleMakeOfferSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Offered Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:border-brand-500 outline-none font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Proposed Campus Meetup Spot</label>
                  <input
                    type="text"
                    required
                    value={meetupLocation}
                    onChange={(e) => setMeetupLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:border-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Note to Seller (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Can meet near Library tomorrow around 2 PM..."
                    value={offerNotes}
                    onChange={(e) => setOfferNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:border-brand-500 outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={offerLoading}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                  >
                    {offerLoading ? 'Sending...' : 'Confirm Offer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMakeOfferOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-elevated">
            <h3 className="text-base font-bold text-slate-900">Report Listing</h3>
            
            {reportSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl text-center">
                Report submitted to campus admins for review.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                  >
                    <option value="Inaccurate description">Inaccurate condition or description</option>
                    <option value="Prohibited or counterfeit item">Prohibited or counterfeit item</option>
                    <option value="Overpriced or fake listing">Overpriced or fake listing</option>
                    <option value="Suspicious seller behavior">Suspicious seller behavior</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Details</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe why this product violates campus policies..."
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={reportLoading}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
                  >
                    Submit Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
