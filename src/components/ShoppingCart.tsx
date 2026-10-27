import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  addToCart,
  applyDiscount,
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  setShippingCost,
  STORAGE_KEY,
} from '../features/cart/cartSlice';
import { selectCartSummary } from '../features/cart/cartSelectors';
import { fetchProducts } from '../features/products/productsSlice';

const currency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

export default function ShoppingCart() {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const productsStatus = useAppSelector((state) => state.products.status);
  const productsError = useAppSelector((state) => state.products.error);
  const cartItems = useAppSelector((state) => state.cart.items);
  const discountCode = useAppSelector((state) => state.cart.discountCode);
  const shippingCost = useAppSelector((state) => state.cart.shippingCost);
  const summary = useAppSelector(selectCartSummary);

  useEffect(() => {
    if (productsStatus === 'idle') void dispatch(fetchProducts());
  }, [dispatch, productsStatus]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ứng dụng vẫn hoạt động trong phiên hiện tại nếu trình duyệt không cho lưu.
    }
  }, [cartItems]);

  const formatProduct = (product: (typeof products)[number]) => ({
    id: product.id,
    name: product.title,
    // Quy đổi minh họa cho giao diện VND, không phải tỷ giá thực tế.
    price: product.price * 1000,
    image: product.thumbnail,
  });

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">REDUX TOOLKIT • REACT • TYPESCRIPT</p>
        <h1>🛍️ Cửa hàng trực tuyến Nguyen Tran Long</h1>
        <p>Quản lý sản phẩm và giỏ hàng với Redux Toolkit.</p>
      </header>

      <section className="panel">
        <div className="section-heading">
          <h2>Sản phẩm</h2>
          <span>{products.length} sản phẩm</span>
        </div>

        {productsStatus === 'loading' && <p role="status" className="message">Đang tải sản phẩm...</p>}

        {productsStatus === 'failed' && (
          <div className="message error" role="alert">
            <p>{productsError ?? 'Không tải được sản phẩm.'}</p>
            <button className="button" onClick={() => void dispatch(fetchProducts())}>Thử tải lại</button>
          </div>
        )}

        {productsStatus === 'succeeded' && products.length === 0 && <p>Không có sản phẩm để hiển thị.</p>}

        <div className="products-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <img src={product.thumbnail} alt={product.title} loading="lazy" />
              <div className="product-info">
                <h3>{product.title}</h3>
                <p className="price">{currency(product.price * 1000)}</p>
                <button className="button" onClick={() => dispatch(addToCart(formatProduct(product)))}>
                  + Thêm vào giỏ
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Giỏ hàng</h2>
          <span>{summary.itemCount} sản phẩm</span>
        </div>

        {cartItems.length === 0 ? (
          <p className="empty">Giỏ hàng đang trống. Hãy thêm sản phẩm ở phía trên.</p>
        ) : (
          <>
            <div className="cart-list">
              {cartItems.map((item) => (
                <article className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-name">
                    <strong>{item.name}</strong>
                    <span>{currency(item.price)} / sản phẩm</span>
                  </div>
                  <div className="quantity-control" aria-label={`Số lượng ${item.name}`}>
                    <button aria-label={`Giảm số lượng ${item.name}`} onClick={() => dispatch(decreaseQuantity(item.id))} disabled={item.quantity <= 1}>−</button>
                    <span>{item.quantity}</span>
                    <button aria-label={`Tăng số lượng ${item.name}`} onClick={() => dispatch(increaseQuantity(item.id))}>+</button>
                  </div>
                  <strong className="line-total">{currency(item.price * item.quantity)}</strong>
                  <button className="text-button" onClick={() => dispatch(removeFromCart(item.id))} aria-label={`Xóa ${item.name}`}>Xóa</button>
                </article>
              ))}
            </div>
            <button className="text-button clear-button" onClick={() => dispatch(clearCart())}>Xóa toàn bộ giỏ hàng</button>
          </>
        )}
      </section>

      <section className="panel checkout">
        <h2>Tóm tắt đơn hàng</h2>

        <div className="form-group">
          <span className="field-label">Mã giảm giá</span>
          <div className="discount-buttons">
            <button className={`button secondary ${discountCode === 'SUMMER10' ? 'selected' : ''}`} onClick={() => dispatch(applyDiscount('SUMMER10'))}>SUMMER10 · Giảm 10%</button>
            <button className={`button secondary ${discountCode === 'SPECIAL20' ? 'selected' : ''}`} onClick={() => dispatch(applyDiscount('SPECIAL20'))}>SPECIAL20 · Giảm 20%</button>
            {discountCode && <button className="text-button" onClick={() => dispatch(applyDiscount(''))}>Bỏ mã</button>}
          </div>
          <small>Mỗi đơn chỉ áp dụng một mã giảm giá.</small>
        </div>

        <fieldset className="form-group shipping-options">
          <legend className="field-label">Phí vận chuyển</legend>
          <label><input type="radio" name="shipping" checked={shippingCost === 0} onChange={() => dispatch(setShippingCost(0))} /> Miễn phí · 0 ₫</label>
          <label><input type="radio" name="shipping" checked={shippingCost === 10000} onChange={() => dispatch(setShippingCost(10000))} /> Tiêu chuẩn · 10.000 ₫</label>
          <label><input type="radio" name="shipping" checked={shippingCost === 25000} onChange={() => dispatch(setShippingCost(25000))} /> Nhanh · 25.000 ₫</label>
        </fieldset>

        <div className="summary-row"><span>Tạm tính</span><span>{currency(summary.subtotal)}</span></div>
        <div className="summary-row"><span>Giảm giá {discountCode ? `(${discountCode})` : ''}</span><span className="discount-value">−{currency(summary.discount)}</span></div>
        <div className="summary-row"><span>Thuế minh họa (10%)</span><span>{currency(summary.tax)}</span></div>
        <div className="summary-row"><span>Vận chuyển</span><span>{currency(summary.shipping)}</span></div>
        <div className="summary-row total"><strong>Thành tiền</strong><strong>{currency(summary.total)}</strong></div>

        <button className="button checkout-button" disabled={cartItems.length === 0} onClick={() => window.alert('Đây là bản demo. Chức năng thanh toán chưa được tích hợp.')}>Thanh toán (demo)</button>
        <p className="note">Giá API được quy đổi minh họa sang VND; thuế và vận chuyển chỉ phục vụ học tập, không phải báo giá hoặc tính thuế thực tế.</p>
      </section>

      <footer>Thực hành Redux Toolkit · Store, Slice, Async Thunk, Selectors và LocalStorage</footer>
    </main>
  );
}