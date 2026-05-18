import React, { useState } from 'react';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import { PURCHASE_LIMITS, TARGET_TYPES } from './utils/constants';

function App() {
  const [cartItems, setCartItems] = useState([]);

  // 장바구니에 상품 추가
  const handleAddToCart = (product, targetType, quantity) => {
    // 1. 현재 장바구니에 담긴 '동일 상품 & 동일 구매 대상'의 수량을 계산합니다.
    const existingSameItems = cartItems.filter(
      item => item.product.id === product.id && item.targetType === targetType
    );
    const existingQuantity = existingSameItems.reduce((sum, item) => sum + item.quantity, 0);

    // 2. 이번에 담으려는 총 수량 (기존 장바구니 수량 + 새로 담을 수량)
    const totalRequestedQuantity = existingQuantity + quantity;

    // 3. 해당 구매 대상의 구매 가능 제한 수량 가져오기
    const limit = PURCHASE_LIMITS[targetType];

    // 4. 수량 제한 체크 (초과 시 경고창 띄우고 중단)
    if (totalRequestedQuantity > limit) {
      alert(`본인구매는 매달 1개, 가족구매는 매달 5개까지만 가능합니다.\n(현재 장바구니에 담긴 수량: ${existingQuantity}개, 추가 시도: ${quantity}개)`);
      return; // 장바구니에 담지 않고 함수 종료
    }

    // 5. 제한을 통과했다면 장바구니에 추가합니다.
    const cartItemId = Date.now().toString() + Math.random().toString(36).substr(2, 9); // 고유 ID 생성
    const newItem = {
      cartItemId,
      product,
      targetType,
      quantity,
      price: product.prices[targetType] // 선택한 대상에 맞는 단가 저장
    };

    setCartItems(prev => [...prev, newItem]);
  };

  // 장바구니에서 상품 삭제
  const handleRemoveFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  // 최종 구매(결제) 버튼 클릭 시
  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    alert("결제가 완료되었습니다. (테스트)");
    setCartItems([]); // 장바구니 비우기
  };

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800' }}>
          임직원 전용 화장품 복지몰
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
          특별한 혜택으로 화장품을 만나보세요. (본인/가족/지인 할인 적용)
        </p>
      </header>

      <main>
        {/* 상품 목록 컴포넌트 */}
        <ProductList onAddToCart={handleAddToCart} />
        
        {/* 장바구니 컴포넌트 */}
        <Cart 
          cartItems={cartItems} 
          onRemoveFromCart={handleRemoveFromCart}
          onCheckout={handleCheckout}
        />
      </main>
    </div>
  );
}

export default App;
