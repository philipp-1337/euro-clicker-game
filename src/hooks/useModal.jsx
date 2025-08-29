import { useEffect, useRef } from 'react';

export const useModal = (show, onClose, options = {}) => {
  const modalRef = useRef(null);
  const { 
    preventBodyScroll = true,
    closeOnEscape = true,
    closeOnClickOutside = true,
    excludeElements = []
  } = options;

  useEffect(() => {
    const handleEscape = (event) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event) => {
      if (!closeOnClickOutside) return;
      
      // Check if click is on excluded elements
      const isExcluded = excludeElements.some(selector => 
        event.target.closest(selector)
      );
      
      if (isExcluded) return;

      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (show) {
      if (closeOnEscape) {
        document.addEventListener('keydown', handleEscape);
      }
      if (closeOnClickOutside) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      if (preventBodyScroll) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      if (closeOnEscape) {
        document.removeEventListener('keydown', handleEscape);
      }
      if (closeOnClickOutside) {
        document.removeEventListener('mousedown', handleClickOutside);
      }
      if (preventBodyScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [show, onClose, closeOnEscape, closeOnClickOutside, preventBodyScroll, excludeElements]);

  return modalRef;
}; 