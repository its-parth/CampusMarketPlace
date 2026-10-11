import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchRecommendations } from '../store/productSlice';
import { ProductGrid } from '../components/ProductGrid';
import { Sparkles } from 'lucide-react';

export const RecommendedPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { recommendations, isLoading } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-brand-600 rounded-3xl p-8 text-white space-y-2 shadow-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-amber-100">
          <Sparkles className="w-4 h-4 text-amber-300" /> AI Recommendation Engine
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Personalized Campus Feed</h1>
        <p className="text-xs text-amber-100 max-w-xl leading-relaxed">
          Curated listings based on your view history, department preferences, course materials, and popular campus trends.
        </p>
      </div>

      <ProductGrid
        products={recommendations}
        isLoading={isLoading}
        emptyTitle="Generating recommendations..."
        emptyMessage="Explore the marketplace and interact with items to help AI learn your preferences."
      />

    </div>
  );
};
