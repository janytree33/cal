import React, { useState } from 'react';
import { PRODUCTS, TARGET_TYPES } from '../utils/constants';
import './ProductList.css'; // 별도 스타일 분리 시

export default function ProductList({ onAddToCart, onBatchAddToCart }) {
  // 각 상품별로 선택된 '구매 유형', '수량'을 관리합니다. (수량은 0개부터 시작하며 체크박스 대신 수량 0개 여부로 선택 상태를 관리합니다.)
  const [selections, setSelections] = useState(
    PRODUCTS.reduce((acc, product) => {
      acc[product.id] = { targetType: TARGET_TYPES.SELF, quantity: 0 };
      return acc;
    }, {})
  );

  // 구매 유형 변경 핸들러
  const handleTargetChange = (productId, newTargetType) => {
    setSelections(prev => ({
      ...prev,
      [productId]: { ...prev[productId], targetType: newTargetType }
    }));
  };

  // 수량 변경 핸들러 (+, -)
  const handleQuantityChange = (productId, delta) => {
    setSelections(prev => {
      const currentQty = prev[productId].quantity;
      const newQty = Math.max(0, currentQty + delta); // 최소 수량을 0개로 설정
      return {
        ...prev,
        [productId]: { ...prev[productId], quantity: newQty }
      };
    });
  };

  // 실시간으로 선택된 상품들의 합계 금액 및 총 수량 계산
  const selectedTotal = PRODUCTS.reduce((sum, product) => {
    const sel = selections[product.id];
    const price = product.prices[sel.targetType];
    return sum + (price * sel.quantity);
  }, 0);

  const selectedCount = PRODUCTS.reduce((sum, product) => {
    const sel = selections[product.id];
    return sum + sel.quantity;
  }, 0);

  const selectedKindCount = PRODUCTS.filter(p => selections[p.id].quantity > 0).length;

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
            <div
              key={product.id}
              className="card product-card"
              style={{
                opacity: selection.quantity > 0 ? 1 : 0.65,
                transition: 'all 0.3s ease',
                border: selection.quantity > 0 ? '2px solid var(--color-primary)' : '1px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{product.name}</h3>
              </div>

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
                    <option value={TARGET_TYPES.ACQUAINTANCE}>지인 구매 (제한없음)</option>
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
                      disabled={selection.quantity <= 0}
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
                disabled={selection.quantity === 0}
              >
                장바구니 담기
              </button>
            </div>
          );
        })}

        {/* 6번째 칸: 품목별/구매대상별 단가표 삽입 */}
        <div className="price-chart-card animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <h3>💡 구매 대상별 단가표</h3>
          <div className="price-chart-table-container">
            <table className="price-chart-table">
              <thead>
                <tr>
                  <th colSpan="2">품목</th>
                  <th>규격</th>
                  <th className="th-self">본인구매</th>
                  <th className="th-family">가족구매</th>
                  <th className="th-acquaintance">지인구매</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan="3" className="brand-cell">앰플런스</td>
                  <td>앰플</td>
                  <td>50ml</td>
                  <td className="cell-self">6,500</td>
                  <td className="cell-family">9,500</td>
                  <td className="cell-acquaintance">13,000</td>
                </tr>
                <tr>
                  <td>크림</td>
                  <td>75ml</td>
                  <td className="cell-self">5,000</td>
                  <td className="cell-family">7,000</td>
                  <td className="cell-acquaintance">9,000</td>
                </tr>
                <tr>
                  <td>버블폼</td>
                  <td>150ml</td>
                  <td className="cell-self">5,500</td>
                  <td className="cell-family">9,500</td>
                  <td className="cell-acquaintance">10,000</td>
                </tr>
                <tr>
                  <td colSpan="2" className="brand-cell">딥모이스처 카머</td>
                  <td>70ml</td>
                  <td className="cell-self">5,000</td>
                  <td className="cell-family">7,000</td>
                  <td className="cell-acquaintance">9,000</td>
                </tr>
                <tr>
                  <td colSpan="2" className="brand-cell">인텐시브 베리어 카머</td>
                  <td>90ml</td>
                  <td className="cell-self">6,000</td>
                  <td className="cell-family">8,000</td>
                  <td className="cell-acquaintance">10,000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="price-chart-notes">
            <span>※ 본인구매는 매달 1개 한정입니다.</span>
            <span>※ 가족구매는 매달 5개 한정입니다.</span>
            <span>※ 지인구매는 수량제한 없습니다.</span>
          </div>
        </div>
      </div>

      {/* 실시간 합계 및 일괄 장바구니 담기 영역 */}
      <div
        className="product-list-summary card"
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '500px', fontSize: '1.1rem', fontWeight: 'bold' }}>
          <span>선택한 품목:</span>
          <span>{selectedKindCount}종 (총 {selectedCount}개)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '500px', fontSize: '1.4rem', fontWeight: 'bold' }}>
          <span>실시간 예상 합계:</span>
          <span className="text-gradient" style={{ fontSize: '1.6rem' }}>{selectedTotal.toLocaleString()}원</span>
        </div>
        <button
          className="btn btn-primary"
          style={{ width: '100%', maxWidth: '500px', padding: '0.9rem 1.5rem', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '8px' }}
          onClick={() => {
            const itemsToAdd = PRODUCTS.filter(p => selections[p.id].quantity > 0).map(p => ({
              product: p,
              targetType: selections[p.id].targetType,
              quantity: selections[p.id].quantity
            }));
            if (itemsToAdd.length === 0) {
              alert("선택된 상품이 없습니다. 수량을 1개 이상으로 조절해 주세요.");
              return;
            }
            onBatchAddToCart(itemsToAdd);
          }}
        >
          선택한 {selectedKindCount}종 상품 장바구니에 일괄 담기
        </button>
      </div>
    </div>
  );
}
