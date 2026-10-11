import React from 'react';
import { Category } from '../types';
import { SlidersHorizontal, RotateCcw, Check } from 'lucide-react';

interface FilterPanelProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  selectedCondition: string;
  onSelectCondition: (condition: string) => void;
  minPrice: string;
  maxPrice: string;
  onPriceChange: (min: string, max: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedCondition,
  onSelectCondition,
  minPrice,
  maxPrice,
  onPriceChange,
  selectedSort,
  onSortChange,
  onClearFilters
}) => {
  const conditions = [
    { id: 'BRAND_NEW', label: 'Brand New' },
    { id: 'LIKE_NEW', label: 'Like New' },
    { id: 'GOOD', label: 'Good' },
    { id: 'FAIR', label: 'Fair' },
    { id: 'REFURBISHED', label: 'Refurbished' }
  ];

  return (
    <aside className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-6 shadow-subtle">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-bold text-slate-900">Filters</h3>
        </div>
        <button
          onClick={onClearFilters}
          className="text-xs font-semibold text-slate-500 hover:text-brand-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Sorting */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sort By</label>
        <select
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:border-brand-500 focus:outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Category List */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Categories</label>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full text-left text-xs font-medium px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${selectedCategory === '' ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <span>All Categories</span>
            {selectedCategory === '' && <Check className="w-3.5 h-3.5 text-brand-600" />}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full text-left text-xs font-medium px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${selectedCategory === cat.slug ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span className="truncate">{cat.name}</span>
              {cat.product_count !== undefined && (
                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  {cat.product_count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Condition State Chips */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Condition</label>
        <div className="flex flex-wrap gap-1.5">
          {conditions.map(c => (
            <button
              key={c.id}
              onClick={() => onSelectCondition(selectedCondition === c.id ? '' : c.id)}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${selectedCondition === c.id ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Range (₹)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:border-brand-500 outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onPriceChange(minPrice, e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:border-brand-500 outline-none"
          />
        </div>
      </div>

    </aside>
  );
};
