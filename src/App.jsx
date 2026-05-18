import React, { useState } from 'react';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import { PURCHASE_LIMITS, TARGET_TYPES } from './utils/constants';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [quoteHistory, setQuoteHistory] = useState([]); // 견적 복사 이력 상태 (최대 3개 유지)

  // 장바구니에 상품 추가
  const handleAddToCart = (product, targetType, quantity) => {
    // 1. 현재 장바구니에 담긴 '동일 상품 & 동일 구매 대상'의 수량을 계산합니다.
    const existingItemIndex = cartItems.findIndex(
      item => item.product.id === product.id && item.targetType === targetType
    );
    const existingQuantity = existingItemIndex !== -1 ? cartItems[existingItemIndex].quantity : 0;

    // 2. 이번에 담으려는 총 수량 (기존 장바구니 수량 + 새로 담을 수량)
    const totalRequestedQuantity = existingQuantity + quantity;

    // 3. 해당 구매 대상의 구매 가능 제한 수량 가져오기
    const limit = PURCHASE_LIMITS[targetType];

    // 4. 수량 제한 체크 (초과 시 경고창 띄우고 중단)
    if (totalRequestedQuantity > limit) {
      alert(`본인구매는 매달 1개, 가족구매는 매달 5개까지만 가능합니다.\n(현재 장바구니에 담긴 수량: ${existingQuantity}개, 추가 시도: ${quantity}개)`);
      return; // 장바구니에 담지 않고 함수 종료
    }

    // 5. 제한을 통과했다면 장바구니에 추가하거나 기존 항목 수량을 업데이트합니다.
    if (existingItemIndex !== -1) {
      // 이미 같은 항목이 장바구니에 있는 경우 수량만 합산
      setCartItems(prev => {
        const newCart = [...prev];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: totalRequestedQuantity
        };
        return newCart;
      });
    } else {
      // 장바구니에 없는 새로운 항목인 경우 새로 추가
      const cartItemId = Date.now().toString() + Math.random().toString(36).substr(2, 9); // 고유 ID 생성
      const newItem = {
        cartItemId,
        product,
        targetType,
        quantity,
        price: product.prices[targetType] // 선택한 대상에 맞는 단가 저장
      };
      setCartItems(prev => [...prev, newItem]);
    }
  };

  // 장바구니에서 상품 삭제
  const handleRemoveFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  // 최종 구매(결제) 버튼 클릭 시
  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    
    // 장바구니 총액 계산
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 견적서 텍스트 생성
    let quoteText = "[임직원 화장품 구매 견적서]\n";
    cartItems.forEach((item, index) => {
      quoteText += `${index + 1}. ${item.product.name} (${item.targetType}구매) - ${item.quantity}개 / ${(item.price * item.quantity).toLocaleString()}원\n`;
    });
    quoteText += "---------------------------\n";
    quoteText += `총 결제 금액: ${totalPrice.toLocaleString()}원\n`;
    quoteText += "입금 계좌: 신한은행 100-026-244778 (주)제니트리";

    // 복사 이력에 저장할 객체 생성 (현재 시간과 요약 정보)
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newHistoryItem = {
      id: Date.now().toString(),
      timeString: timeString,
      summary: `총 ${cartItems.length}건, ${totalPrice.toLocaleString()}원 견적`,
      text: quoteText
    };

    // 클립보드에 복사
    navigator.clipboard.writeText(quoteText).then(() => {
      alert("견적서가 복사되었습니다. 카카오톡이나 메신저로 회계담당자에게 붙여넣기 해주세요.\n\n" + quoteText);
      // 복사 성공 시 이력 저장 (최신순으로 최대 3개 유지)
      setQuoteHistory(prev => [newHistoryItem, ...prev].slice(0, 3));
      setCartItems([]); // 장바구니 비우기
    }).catch(err => {
      // 복사 권한이 없을 경우 대비
      alert("견적서 복사에 실패했습니다.\n\n" + quoteText);
    });
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
          quoteHistory={quoteHistory}
        />
      </main>
    </div>
  );
}

export default App;
