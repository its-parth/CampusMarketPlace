import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchCategories, fetchProducts, fetchRecommendations } from '../store/productSlice';
import { ProductCard } from '../components/ProductCard';
import { 
  ShoppingBag, Sparkles, ShieldCheck, ArrowRight, BookOpen, 
  Laptop, Home, Shirt, Activity, PenTool, Ticket, GraduationCap, Grid,
  Zap, MessageCircle, CheckCircle2, TrendingUp 
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { categories, products, recommendations, isLoading } = useSelector((state: RootState) => state.products);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts({ limit: 8 }));
    dispatch(fetchRecommendations());
  }, [dispatch]);

  const categoryIconMap: Record<string, any> = {
    'BookOpen': BookOpen,
    'Laptop': Laptop,
    'Home': Home,
    'Shirt': Shirt,
    'Activity': Activity,
    'PenTool': PenTool,
    'Ticket': Ticket,
    'GraduationCap': GraduationCap,
    'Grid': Grid
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 rounded-b-3xl shadow-xl">
        {/* Background Subtle Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-brand-200">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Campus Verified & AI Powered Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Buy & Sell on Campus with <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">AI Intelligence</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Connect directly with verified students at State University. Save on textbooks, dorm gear, and tech with AI price recommendations and instant safe campus meetups.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/marketplace"
                className="px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-sm text-white shadow-lg shadow-brand-500/30 flex items-center gap-2 transition-all active:scale-95"
              >
                Browse Marketplace <ArrowRight className="w-4 h-4" />
              </Link>

              {isAuthenticated ? (
                <Link
                  to="/products/new"
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md font-semibold text-sm text-white border border-white/20 flex items-center gap-2 transition-all"
                >
                  List Item for Sale
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md font-semibold text-sm text-white border border-white/20 flex items-center gap-2 transition-all"
                >
                  Join as Student
                </Link>
              )}
            </div>

            {/* Metrics */}
            <div className="pt-8 grid grid-cols-3 gap-6 border-t border-white/10 text-xs">
              <div>
                <p className="text-xl font-extrabold text-white">100%</p>
                <p className="text-slate-400">Verified Campus Students</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white">AI Driven</p>
                <p className="text-slate-400">Smart Price & Copy Assistant</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white">$0 Fees</p>
                <p className="text-slate-400">Direct Student Meetups</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* CATEGORIES SECTION */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Popular Categories</h2>
              <p className="text-xs text-slate-500 mt-1">Explore listings curated by course department & student needs</p>
            </div>
            <Link to="/marketplace" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.slice(0, 8).map(cat => {
              const IconComp = categoryIconMap[cat.icon || 'Grid'] || Grid;
              return (
                <Link
                  key={cat.id}
                  to={`/marketplace?category=${cat.slug}`}
                  className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-brand-500/50 hover:shadow-card transition-all text-center flex flex-col items-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{cat.product_count || 0} items</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* AI RECOMMENDED FOR YOU SECTION */}
        {recommendations && recommendations.length > 0 && (
          <section className="bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-indigo-500/10 rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Recommended For You</h2>
                  <p className="text-xs text-slate-600">Personalized AI feed based on your interests and active campus trends</p>
                </div>
              </div>
              <Link to="/recommended" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
                View Feed <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {recommendations.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* FRESH RECENT LISTINGS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Fresh Campus Listings</h2>
              <p className="text-xs text-slate-500 mt-1">Recently posted items from fellow students</p>
            </div>
            <Link to="/marketplace" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* TRUST & HOW IT WORKS */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 space-y-8 shadow-subtle">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Why Students Trust CampusMart</h2>
            <p className="text-xs text-slate-500">Built specifically for high trust, security, and seamless trading on campus</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Verified Campus ID</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Only verified university students can list or message, keeping spam and external scammers out.
              </p>
            </div>

            <div className="space-y-3 text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">AI Price & Description Assistant</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sellers get instant pricing guidance based on historical campus sales and auto-generated descriptions.
              </p>
            </div>

            <div className="space-y-3 text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Instant Student Chat</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Negotiate prices, agree on campus quad meetups, and leave verified ratings after completed trades.
              </p>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
};
