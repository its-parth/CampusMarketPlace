import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toggleFavoriteLocal } from '../store/productSlice';
import { Product } from '../types';
import { Heart, MapPin, Star, ShieldCheck, Eye } from 'lucide-react';
import api from '../services/api';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(toggleFavoriteLocal(product.id));
    try {
      await api.post(`/products/${product.id}/favorite`);
    } catch (err) {
      // Revert if error
      dispatch(toggleFavoriteLocal(product.id));
    }
  };

  const conditionLabels: Record<string, { label: string; style: string }> = {
    'BRAND_NEW': { label: 'Brand New', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'LIKE_NEW': { label: 'Like New', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    'GOOD': { label: 'Good', style: 'bg-sky-50 text-sky-700 border-sky-200' },
    'FAIR': { label: 'Fair', style: 'bg-amber-50 text-amber-700 border-amber-200' },
    'REFURBISHED': { label: 'Refurbished', style: 'bg-purple-50 text-purple-700 border-purple-200' },
  };

  const condInfo = conditionLabels[product.condition_state] || { label: product.condition_state, style: 'bg-slate-100 text-slate-700' };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-slate-300 transition-all duration-200 flex flex-col overflow-hidden relative">
      
      {/* Product Image & Badges */}
      <Link to={`/products/${product.id}`} className="block relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={product.primary_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Condition Badge */}
        <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${condInfo.style}`}>
          {condInfo.label}
        </span>

        {/* Status Badge if Reserved/Sold */}
        {product.status !== 'AVAILABLE' && (
          <span className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-sm tracking-wider uppercase">
            {product.status}
          </span>
        )}

        {/* Favorite Toggle Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-rose-500 backdrop-blur-md border border-white/50 shadow-sm transition-all active:scale-90"
          title={product.is_favorite ? 'Remove Favorite' : 'Save Favorite'}
        >
          <Heart className={`w-4 h-4 ${product.is_favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Category Tag */}
        {product.category_name && (
          <span className="absolute bottom-3 left-3 text-[10px] font-medium bg-slate-900/75 text-slate-100 px-2.5 py-0.5 rounded-md backdrop-blur-md">
            {product.category_name}
          </span>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          {/* Price & Strikethrough */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-extrabold text-slate-900">
              ₹{parseFloat(product.price.toString()).toFixed(2)}
            </span>
            {product.original_price && parseFloat(product.original_price.toString()) > parseFloat(product.price.toString()) && (
              <span className="text-xs text-slate-400 line-through">
                ₹{parseFloat(product.original_price.toString()).toFixed(2)}
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/products/${product.id}`} className="block">
            <h3 className="text-sm font-semibold text-slate-800 hover:text-brand-600 line-clamp-2 leading-snug transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Footer Meta: Location & Seller */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          
          <div className="flex items-center gap-1 max-w-[140px] truncate" title={product.campus_location}>
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{product.campus_location}</span>
          </div>

          {/* Seller Avatar */}
          <div className="flex items-center gap-1.5 shrink-0" title={`Seller: ${product.seller_name}`}>
            <img
              src={product.seller_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={product.seller_name}
              className="w-5 h-5 rounded-full object-cover"
            />
            {product.seller_verification === 'VERIFIED' && (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            )}
            <span className="font-medium text-slate-700 flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {product.seller_rating || '5.0'}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
