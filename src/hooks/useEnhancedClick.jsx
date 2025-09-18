import { useRef, useCallback } from 'react';

// Custom Hook für Long-Press
export const useLongPress = (callback, ms = 500) => {
  const timerRef = useRef();
  const isLongPress = useRef(false);
  const preventClick = useRef(false);
  const touchStartTime = useRef(0);

  const startPressTimer = useCallback(() => {
    isLongPress.current = false;
    preventClick.current = false;
    touchStartTime.current = Date.now();
    
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      preventClick.current = true;
      callback();
    }, ms);
  }, [callback, ms]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleOnClick = useCallback((e) => {
    // Verhindere Click nach Long-Press für eine kurze Zeit
    if (preventClick.current || isLongPress.current) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  }, []);

  const handleOnMouseDown = useCallback(() => {
    startPressTimer();
  }, [startPressTimer]);

  const handleOnMouseUp = useCallback(() => {
    clearTimer();
    
    // Kurze Verzögerung um Click nach Long-Press zu verhindern
    if (isLongPress.current) {
      setTimeout(() => {
        preventClick.current = false;
        isLongPress.current = false;
      }, 100);
    }
  }, [clearTimer]);

  const handleOnTouchStart = useCallback((e) => {
    // Verhindere Text-Auswahl und Context-Menu auf iOS
    e.preventDefault();
    startPressTimer();
  }, [startPressTimer]);

  const handleOnTouchEnd = useCallback((e) => {
    clearTimer();
    
    // Berechne Touch-Dauer
    const touchDuration = Date.now() - touchStartTime.current;
    
    // Wenn es ein Long-Press war, verhindere nachfolgende Events
    if (isLongPress.current || touchDuration >= ms - 50) {
      e.preventDefault();
      e.stopPropagation();
      
      // Länger verhindern auf Touch-Geräten
      preventClick.current = true;
      setTimeout(() => {
        preventClick.current = false;
        isLongPress.current = false;
      }, 200);
    } else {
      // Bei kurzem Touch: kurze Verzögerung bevor Click möglich ist
      setTimeout(() => {
        preventClick.current = false;
        isLongPress.current = false;
      }, 50);
    }
  }, [clearTimer, ms]);

  const handleOnTouchCancel = useCallback(() => {
    clearTimer();
    preventClick.current = false;
    isLongPress.current = false;
  }, [clearTimer]);

  const handleOnContextMenu = useCallback((e) => {
    // Verhindere Context-Menu bei Long-Press
    if (isLongPress.current || preventClick.current) {
      e.preventDefault();
    }
  }, []);

  return {
    onMouseDown: handleOnMouseDown,
    onMouseUp: handleOnMouseUp,
    onMouseLeave: handleOnMouseUp,
    onTouchStart: handleOnTouchStart,
    onTouchEnd: handleOnTouchEnd,
    onTouchCancel: handleOnTouchCancel,
    onContextMenu: handleOnContextMenu,
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