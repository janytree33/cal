import React, { useState } from 'react';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import { PURCHASE_LIMITS, TARGET_TYPES } from './utils/constants';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [quoteHistory, setQuoteHistory] = useState([]); // 견적 복사 이력 상태 (최대 3개 유지)

  // 여러 상품 또는 단일 상품을 장바구니에 추가하는 핵심 배치 함수
  const handleBatchAddToCart = (items, isBatch = true) => {
    setCartItems(prev => {
      let newCart = [...prev];
      let limitAlertTriggered = false;
      let exceededLimitDetails = [];

      items.forEach(({ product, targetType, quantity }) => {
        if (quantity <= 0) return;

        // 1. 현재 장바구니에서 동일 상품 & 동일 구매 대상의 수량을 계산
        const existingItemIndex = newCart.findIndex(
          item => item.product.id === product.id && item.targetType === targetType
        );
        const existingQuantity = existingItemIndex !== -1 ? newCart[existingItemIndex].quantity : 0;
        const totalRequestedQuantity = existingQuantity + quantity;
        const limit = PURCHASE_LIMITS[targetType];

        // 2. 수량 제한 체크
        if (totalRequestedQuantity > limit) {
          limitAlertTriggered = true;
          exceededLimitDetails.push(`- ${product.name} (${targetType}구매: 장바구니에 이미 ${existingQuantity}개 담겨있음, 추가하려는 수량 ${quantity}개, 제한 ${limit}개)`);
          return; // 이 상품은 추가하지 않음
        }

        // 3. 장바구니 업데이트
        if (existingItemIndex !== -1) {
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: totalRequestedQuantity
          };
        } else {
          const cartItemId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          newCart.push({
            cartItemId,
            product,
            targetType,
            quantity,
            price: product.prices[targetType]
          });
        }
      });

      if (limitAlertTriggered) {
        alert(`일부 상품의 구매 한도가 초과되어 장바구니 담기에서 제외되었습니다:\n\n${exceededLimitDetails.join('\n')}`);
      } else {
        alert(isBatch ? "선택하신 모든 상품이 장바구니에 담겼습니다!" : "상품이 장바구니에 담겼습니다!");
      }

      return newCart;
    });
  };

  // 단일 상품 장바구니 추가 (배치 함수로 위임)
  const handleAddToCart = (product, targetType, quantity) => {
    handleBatchAddToCart([{ product, targetType, quantity }], false);
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
    
    const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const newHistoryItem = {
      id: Date.now().toString(),
      timeString: timeString,
      summary: `총 ${totalItemCount}개, ${totalPrice.toLocaleString()}원 견적`,
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
      <header style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: '3rem',
        textAlign: 'center' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '1rem',
          marginBottom: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <img 
            src="/logo.png" 
            alt="제니트리 로고" 
            style={{ 
              width: '52px', 
              height: '52px', 
              objectFit: 'contain',
              borderRadius: '50%',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }} 
          />
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }}>
            제니트리 임직원 전용 화장품 복지몰
          </h1>
        </div>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', fontSize: '1.05rem' }}>
          특별한 혜택으로 화장품을 만나보세요. (본인/가족/지인 할인 적용)
        </p>
      </header>

      <main>
        {/* 상품 목록 컴포넌트 */}
        <ProductList onAddToCart={handleAddToCart} onBatchAddToCart={handleBatchAddToCart} />
        
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
