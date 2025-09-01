import { useEffect, useRef, useState } from 'react';

const MoneyBanner = ({ money }) => {
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
    isVisible && (
      <div className="money-banner">
        {money}
      </div>
    )
  );
};

export default MoneyBanner;
