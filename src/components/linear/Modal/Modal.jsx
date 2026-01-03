import { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

/**
 * Modal 컴포넌트
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {Function} onClose - 닫기 핸들러
 * @param {React.ReactNode} children - 모달 내용
 * @param {string} ariaLabel - 접근성을 위한 레이블
 */
export const Modal = ({ isOpen, onClose, children, ariaLabel = 'Modal' }) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // 이전 포커스 요소 저장
    previousFocusRef.current = document.activeElement;

    // ESC 키 핸들러
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Focus trap 구현
    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = contentRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);

    // body 스크롤 방지
    document.body.style.overflow = 'hidden';

    // 모달로 포커스 이동
    const firstFocusable = contentRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      document.body.style.overflow = '';

      // 이전 포커스 복원
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={contentRef}
        className={styles.content}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * ModalHeader 컴포넌트
 */
export const ModalHeader = ({ children, onClose }) => (
  <div className={styles.header}>
    {children}
    {onClose && (
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close modal"
      >
        ✕
      </button>
    )}
  </div>
);

/**
 * ModalContent 컴포넌트
 */
export const ModalContent = ({ children }) => (
  <div className={styles.modalContent}>{children}</div>
);

/**
 * ModalFooter 컴포넌트
 */
export const ModalFooter = ({ children }) => (
  <div className={styles.footer}>{children}</div>
);
