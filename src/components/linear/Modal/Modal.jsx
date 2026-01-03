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

    // ESC 키 핸들러 (IME 조합 중에는 무시)
    const handleEscape = (e) => {
      // IME 조합 중이면 무시 (한글 입력 등)
      if (e.isComposing || e.keyCode === 229) return;

      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    // body 스크롤 방지
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
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
