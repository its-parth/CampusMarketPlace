import React, { useState, useEffect } from 'react';
import { ProductGrid } from '../components/ProductGrid';
import { Product } from '../types';
import { Heart, Loader2 } from 'lucide-react';
import api from '../services/api';

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const res = await api.get('/products/favorites/my');
      setFavorites(res.data.data || []);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex items-center gap-2">
        <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Saved Wishlist</h1>
          <p className="text-xs text-slate-500">Items you bookmarked for later review</p>
        </div>
      </div>

      <ProductGrid
        products={favorites}
        isLoading={loading}
        emptyTitle="Your saved wishlist is empty"
        emptyMessage="Click the heart icon on any campus listing to save it here for quick access."
      />

    </div>
  );
};
