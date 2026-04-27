import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '@utils/calculators';

const MoneyBanner = ({ money, showFloatingMoney, totalMoneyPerSecond }) => {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    const target = document.getElementById('money-display');

    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // entry.isIntersecting = true, wenn #money-display im Viewport sichtbar ist
        setIsVisible(!entry.isIntersecting);
      },
      {
        root: null, // viewport
        threshold: 0.1, // Sobald 10% sichtbar sind, gilt als sichtbar
      }
    );

    observer.observe(target);
    observerRef.current = observer;

    return () => {
      if (observerRef.current && target) {
        observerRef.current.unobserve(target);
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    isVisible && showFloatingMoney && (
      <div className="money-banner">
        {money}
        {totalMoneyPerSecond > 0 && (
          <span className="per-second-floating">
            +{formatNumber(totalMoneyPerSecond)} €/s
          </span>
        )}
      </div>
    )
  );
};

export default MoneyBanner;
