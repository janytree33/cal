import React, { useState } from 'react';
import { PRODUCTS, TARGET_TYPES } from '../utils/constants';
import './ProductList.css'; // 별도 스타일 분리 시

export default function ProductList({ onAddToCart }) {
  // 각 상품별로 선택된 '구매 유형'과 '수량'을 관리합니다.
  const [selections, setSelections] = useState(
    PRODUCTS.reduce((acc, product) => {
      acc[product.id] = { targetType: TARGET_TYPES.SELF, quantity: 1 };
      return acc;
    }, {})
  );

  // 구매 유형 변경 핸들러
  const handleTargetChange = (productId, newTargetType) => {
    setSelections(prev => ({
      ...prev,
      [productId]: { ...prev[productId], targetType: newTargetType, quantity: 1 } // 대상 변경 시 수량 1로 초기화
    }));
  };

  // 수량 변경 핸들러 (+, -)
  const handleQuantityChange = (productId, delta) => {
    setSelections(prev => {
      const currentQty = prev[productId].quantity;
      const newQty = Math.max(1, currentQty + delta); // 최소 수량 1개
      return {
        ...prev,
        [productId]: { ...prev[productId], quantity: newQty }
      };
    });
  };

  return (
    <div className="product-list-container animate-fade-in">
      <h2 className="text-gradient">상품 목록</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        원하시는 상품의 구매 대상과 수량을 선택한 후 장바구니에 담아주세요.
      </p>
      
      <div className="product-grid">
        {PRODUCTS.map(product => {
          const selection = selections[product.id];
          const currentPrice = product.prices[selection.targetType];

          return (
            <div key={product.id} className="card product-card">
              <h3>{product.name}</h3>
              
              <div className="product-options">
                {/* 구매 대상 선택 드롭다운 */}
                <div className="option-group">
                  <label>구매 대상</label>
                  <select 
                    className="select-input"
                    value={selection.targetType} 
                    onChange={(e) => handleTargetChange(product.id, e.target.value)}
                  >
                    <option value={TARGET_TYPES.SELF}>본인구매 (월 1개 한정)</option>
                    <option value={TARGET_TYPES.FAMILY}>가족구매 (월 5개 한정)</option>
                    <option value={TARGET_TYPES.ACQUAINTANCE}>지인구매 (제한없음)</option>
                  </select>
                </div>

                {/* 가격 표시 */}
                <div className="price-display">
                  <span className="price-label">적용 단가:</span>
                  <span className="price-value">{currentPrice.toLocaleString()}원</span>
                </div>

                {/* 수량 조절 */}
                <div className="option-group quantity-group">
                  <label>수량</label>
                  <div className="quantity-controls">
                    <button 
                      className="qty-btn" 
                      onClick={() => handleQuantityChange(product.id, -1)}
                      disabled={selection.quantity <= 1}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      className="number-input qty-input"
                      value={selection.quantity} 
                      readOnly 
                    />
                    <button 
                      className="qty-btn" 
                      onClick={() => handleQuantityChange(product.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-primary add-to-cart-btn"
                onClick={() => onAddToCart(product, selection.targetType, selection.quantity)}
              >
                장바구니 담기
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
