import { useRef, useCallback } from 'react';

// Custom Hook für Long-Press
export const useLongPress = (callback, ms = 500) => {
  const timerRef = useRef();
  const isLongPress = useRef();

  const startPressTimer = useCallback(() => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      callback();
    }, ms);
  }, [callback, ms]);

  const handleOnClick = useCallback((e) => {
    if (isLongPress.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleOnMouseDown = useCallback(() => {
    startPressTimer();
  }, [startPressTimer]);

  const handleOnMouseUp = useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  const handleOnTouchStart = useCallback(() => {
    startPressTimer();
  }, [startPressTimer]);

  const handleOnTouchEnd = useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  return {
    onMouseDown: handleOnMouseDown,
    onMouseUp: handleOnMouseUp,
    onMouseLeave: handleOnMouseUp,
    onTouchStart: handleOnTouchStart,
    onTouchEnd: handleOnTouchEnd,
    onClick: handleOnClick,
  };
};

// Alternative: Custom Hook für Double-Click
export const useDoubleClick = (onClick, onDoubleClick, delay = 300) => {
  const clickTimeout = useRef();

  const handleClick = useCallback(() => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      onDoubleClick();
    } else {
      clickTimeout.current = setTimeout(() => {
        onClick();
        clickTimeout.current = null;
      }, delay);
    }
  }, [onClick, onDoubleClick, delay]);

  return handleClick;
};