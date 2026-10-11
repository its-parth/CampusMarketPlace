import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';
import { Product, Category } from '../types';

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  recommendations: Product[];
  categories: Category[];
  currentProduct: Product | null;
  favorites: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  recommendations: [],
  categories: [],
  currentProduct: null,
  favorites: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1
  },
  isLoading: false,
  error: null
};

export const fetchCategories = createAsyncThunk('products/fetchCategories', async () => {
  const res = await api.get('/categories');
  return res.data.data;
});

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (params: any = {}) => {
  const res = await api.get('/products', { params });
  return res.data.data;
});

export const fetchRecommendations = createAsyncThunk('products/fetchRecommendations', async () => {
  const res = await api.get('/ai/recommendations');
  return res.data.data;
});

export const fetchProductById = createAsyncThunk('products/fetchProductById', async (id: string | number) => {
  const res = await api.get(`/products/${id}`);
  return res.data.data;
});

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    toggleFavoriteLocal: (state, action: PayloadAction<number>) => {
      const prodId = action.payload;
      const target = state.products.find(p => p.id === prodId);
      if (target) {
        target.is_favorite = !target.is_favorite;
        target.favorites_count += target.is_favorite ? 1 : -1;
      }
      if (state.currentProduct && state.currentProduct.id === prodId) {
        state.currentProduct.is_favorite = !state.currentProduct.is_favorite;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.currentProduct = action.payload;
      });
  }
});

export const { toggleFavoriteLocal } = productSlice.actions;
export default productSlice.reducer;
