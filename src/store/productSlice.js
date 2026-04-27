import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [
      {
        id: '1',
        name: 'Wireless Headphones',
        description: 'Premium sound quality with noise cancellation.',
        price: 1999,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      },
      {
        id: '2',
        name: 'Smart Watch',
        description: 'Track fitness, calls, and notifications.',
        price: 3499,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      },
    ],
  },
  reducers: {
    addProduct: (state, action) => {
      state.items.push(action.payload);
    },
    removeProduct: (state, action) => {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
  },
});

export const { addProduct, removeProduct } = productSlice.actions;
export default productSlice.reducer;