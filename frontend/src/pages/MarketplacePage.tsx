import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchCategories, fetchProducts } from '../store/productSlice';
import { ProductGrid } from '../components/ProductGrid';
import { FilterPanel } from '../components/FilterPanel';
import { SearchBar } from '../components/SearchBar';
import { SlidersHorizontal, X, ArrowLeft, ArrowRight } from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const { products, categories, pagination, isLoading } = useSelector((state: RootState) => state.products);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params: any = { page, limit: 12, sort };
    if (search) params.search = search;
    if (category) params.category = category;
    if (condition) params.condition = condition;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    dispatch(fetchProducts(params));
  }, [dispatch, page, search, category, condition, minPrice, maxPrice, sort]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Campus Marketplace</h1>
          <p className="text-xs text-slate-500 mt-1">Browse verified textbook listings, tech gadgets, and dorm supplies</p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-80">
          <SearchBar value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
        </div>
      </div>

      {/* Active Filter Chips */}
      {(search || category || condition || minPrice || maxPrice) && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Active Filters:</span>
          {search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold border border-brand-200">
              Query: "{search}"
              <button onClick={() => setSearch('')}><X className="w-3 h-3 hover:text-brand-900" /></button>
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold border border-brand-200">
              Category: {category}
              <button onClick={() => setCategory('')}><X className="w-3 h-3 hover:text-brand-900" /></button>
            </span>
          )}
          {condition && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold border border-brand-200">
              Condition: {condition}
              <button onClick={() => setCondition('')}><X className="w-3 h-3 hover:text-brand-900" /></button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold border border-brand-200">
              Price: ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
              <button onClick={() => { setMinPrice(''); setMaxPrice(''); }}><X className="w-3 h-3 hover:text-brand-900" /></button>
            </span>
          )}
          <button
            onClick={handleClearFilters}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Grid & Filters Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filter */}
        <div className="hidden lg:block lg:col-span-1">
          <FilterPanel
            categories={categories}
            selectedCategory={category}
            onSelectCategory={(c) => { setCategory(c); setPage(1); }}
            selectedCondition={condition}
            onSelectCondition={(cond) => { setCondition(cond); setPage(1); }}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={(min, max) => { setMinPrice(min); setMaxPrice(max); setPage(1); }}
            selectedSort={sort}
            onSortChange={(s) => setSort(s)}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Mobile Filter Trigger */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden w-full py-2.5 bg-slate-100 font-bold text-xs text-slate-700 rounded-xl flex items-center justify-center gap-2 border border-slate-200"
        >
          <SlidersHorizontal className="w-4 h-4 text-brand-600" /> Filter & Sort Listings
        </button>

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-6">
          <ProductGrid products={products} isLoading={isLoading} />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <span className="text-xs font-medium text-slate-500">
                Page <strong className="text-slate-900">{page}</strong> of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
