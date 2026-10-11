import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchCategories } from '../store/productSlice';
import { AIDescriptionModal } from '../components/AIDescriptionModal';
import { AIPriceSuggestionModal } from '../components/AIPriceSuggestionModal';
import { Sparkles, TrendingUp, Upload, Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../services/api';

export const AddEditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { categories } = useSelector((state: RootState) => state.products);
  const { user } = useSelector((state: RootState) => state.auth);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [conditionState, setConditionState] = useState('LIKE_NEW');
  const [campusLocation, setCampusLocation] = useState(user?.university || 'State University Quad');
  
  // Image Upload / URLs state
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [aiDescModalOpen, setAiDescModalOpen] = useState(false);
  const [aiPriceModalOpen, setAiPriceModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
    if (isEditMode && id) {
      api.get(`/products/${id}`).then(res => {
        const prod = res.data.data;
        setTitle(prod.title);
        setDescription(prod.description);
        setCategoryId(prod.category_id);
        setPrice(prod.price.toString());
        setOriginalPrice(prod.original_price ? prod.original_price.toString() : '');
        setConditionState(prod.condition_state);
        setCampusLocation(prod.campus_location);
        if (prod.images && prod.images.length > 0) {
          setImageUrls(prod.images.map((img: any) => img.image_url));
        }
      }).catch(err => {
        setError('Failed to load listing details for editing.');
      });
    }
  }, [dispatch, id, isEditMode]);

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      title,
      description,
      category_id: categoryId,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      condition_state: conditionState,
      campus_location: campusLocation,
      images: imageUrls
    };

    try {
      if (isEditMode && id) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      navigate('/my-listings');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel
      </button>

      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-elevated space-y-6">
        
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isEditMode ? 'Edit Product Listing' : 'List Item for Sale'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Reach thousands of verified campus students with AI-assisted title & description
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          {/* Title with AI Assistant Button */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Listing Title</label>
              <button
                type="button"
                onClick={() => setAiDescModalOpen(true)}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Copy Assistant
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Organic Chemistry Textbook 8th Edition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-brand-500"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Condition</label>
              <select
                value={conditionState}
                onChange={(e) => setConditionState(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="BRAND_NEW">Brand New</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="REFURBISHED">Refurbished</option>
              </select>
            </div>
          </div>

          {/* Price & Original Price with AI Price Estimator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Asking Price (₹)</label>
                <button
                  type="button"
                  onClick={() => setAiPriceModalOpen(true)}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <TrendingUp className="w-3 h-3" /> AI Price Estimator
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                required
                placeholder="450.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-brand-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Original Retail Price (₹) (Optional)</label>
              <input
                type="number"
                step="0.01"
                placeholder="120.00"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Campus Pickup Location */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Campus Meetup Location</label>
            <input
              type="text"
              required
              placeholder="e.g. Science Library Quad or Student Union"
              value={campusLocation}
              onChange={(e) => setCampusLocation(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Description</label>
            <textarea
              rows={5}
              required
              placeholder="Provide item details, course code (if textbook), condition notes, and pickup availability..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-brand-500"
            />
          </div>

          {/* Product Images (URLs or Uploads) */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <label className="font-bold text-slate-700 block">Product Images</label>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste image URL (Unsplash or image link)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 pt-2">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImageUrl(idx)}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-80 hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Listing...
              </>
            ) : (
              isEditMode ? 'Update Product Listing' : 'Publish Product Listing'
            )}
          </button>

        </form>

      </div>

      {/* AI Modals */}
      <AIDescriptionModal
        isOpen={aiDescModalOpen}
        onClose={() => setAiDescModalOpen(false)}
        title={title}
        category={categories.find(c => c.id === categoryId)?.name || ''}
        condition={conditionState}
        targetPrice={price}
        onApply={(enhancedTitle, desc) => {
          setTitle(enhancedTitle);
          setDescription(desc);
        }}
      />

      <AIPriceSuggestionModal
        isOpen={aiPriceModalOpen}
        onClose={() => setAiPriceModalOpen(false)}
        title={title}
        categoryId={categoryId}
        conditionState={conditionState}
        originalPrice={originalPrice}
        onSelectPrice={(suggestedPrice) => {
          setPrice(suggestedPrice.toString());
        }}
      />

    </div>
  );
};
