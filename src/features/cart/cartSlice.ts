import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  discountCode: string | null;
  shippingCost: number;
}

export const STORAGE_KEY = 'redux-shopping-cart-items';

function loadCartItems(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is CartItem =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'number' &&
      typeof item.name === 'string' &&
      typeof item.price === 'number' &&
      typeof item.image === 'string' &&
      typeof item.quantity === 'number' &&
      item.quantity >= 1
    );
  } catch {
    return [];
  }
}

const initialState: CartState = {
  items: loadCartItems(),
  discountCode: null,
  shippingCost: 10000,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    increaseQuantity: (state, action: PayloadAction<number>) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item) item.quantity += 1;
    },
    decreaseQuantity: (state, action: PayloadAction<number>) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
      state.discountCode = null;
    },
    applyDiscount: (state, action: PayloadAction<string>) => {
      const code = action.payload.trim().toUpperCase();
      state.discountCode = code === 'SUMMER10' || code === 'SPECIAL20' ? code : null;
    },
    setShippingCost: (state, action: PayloadAction<number>) => {
      const cost = action.payload;
      if ([0, 10000, 25000].includes(cost)) state.shippingCost = cost;
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  applyDiscount,
  setShippingCost,
} = cartSlice.actions;

export default cartSlice.reducer;