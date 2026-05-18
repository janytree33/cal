import React from 'react';
import './Cart.css';

export default function Cart({ cartItems, onRemoveFromCart, onCheckout }) {
  // 장바구니 총액 계산
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="cart-container card animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <h2 className="text-gradient">장바구니 및 결제</h2>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>장바구니가 비어있습니다. 상품을 담아주세요.</p>
        </div>
      ) : (
        <>
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.cartItemId} className="cart-item">
                <div className="cart-item-info">
                  <h4 className="item-name">{item.product.name}</h4>
                  <div className="item-details">
                    <span className="badge badge-target">{item.targetType}구매</span>
                    <span className="item-price">{item.price.toLocaleString()}원</span>
                    <span className="item-quantity">x {item.quantity}개</span>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <span className="item-subtotal">{(item.price * item.quantity).toLocaleString()}원</span>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => onRemoveFromCart(item.cartItemId)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="total-row">
              <span>최종 예상 총액</span>
              <span className="total-price text-gradient">{totalPrice.toLocaleString()} 원</span>
            </div>
            <button 
              className="btn btn-primary checkout-btn"
              onClick={onCheckout}
            >
              구매하기 (총 {cartItems.length}건)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
