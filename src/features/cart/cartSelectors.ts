import type { RootState } from '../../app/store';

export const selectCartItems = (state: RootState) => state.cart.items;

export const selectCartItemCount = (state: RootState) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectSubtotal = (state: RootState) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

export const selectDiscountRate = (state: RootState) => {
  switch (state.cart.discountCode) {
    case 'SUMMER10':
      return 0.1;
    case 'SPECIAL20':
      return 0.2;
    default:
      return 0;
  }
};

export const selectDiscount = (state: RootState) =>
  selectSubtotal(state) * selectDiscountRate(state);

export const selectTax = (state: RootState) =>
  (selectSubtotal(state) - selectDiscount(state)) * 0.1;

export const selectCartSummary = (state: RootState) => {
  const subtotal = selectSubtotal(state);
  const discount = selectDiscount(state);
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.1;
  const shipping = state.cart.shippingCost;

  return {
    subtotal,
    discount,
    tax,
    shipping,
    total: taxableAmount + tax + shipping,
    itemCount: selectCartItemCount(state),
  };
};