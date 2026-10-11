import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../types';
import { PackageX } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  emptyTitle = 'No products found',
  emptyMessage = 'Try adjusting your search query, filters, or category selection to find what you are looking for.'
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
            <div className="w-full aspect-[4/3] bg-slate-200 rounded-xl"></div>
            <div className="h-5 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-8 space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <PackageX className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">{emptyTitle}</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
