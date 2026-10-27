import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  description: string;
}

interface ProductsState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface DummyJsonResponse {
  products: Product[];
}

export const fetchProducts = createAsyncThunk<Product[]>(
  'products/fetchProducts',
  async (_, { signal }) => {
    const response = await fetch('https://dummyjson.com/products?limit=12', { signal });

    if (!response.ok) {
      throw new Error(`Không thể tải sản phẩm (HTTP ${response.status})`);
    }

    const data = (await response.json()) as DummyJsonResponse;
    return data.products;
  }
);

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = 'failed';
        state.error = action.error.message ?? 'Đã xảy ra lỗi không xác định.';
      });
  },
});

export default productsSlice.reducer;