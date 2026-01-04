import styles from './ViewToggle.module.css';

/**
 * ViewToggle 컴포넌트 - 리스트/카드 뷰 전환 토글 버튼
 * @param {string} value - 현재 선택된 뷰 타입 ('list' | 'card')
 * @param {function} onChange - 뷰 타입 변경 핸들러
 * @param {string} className - 추가 CSS 클래스
 */
export const ViewToggle = ({ value = 'list', onChange, className = '' }) => {
  const wrapperClasses = [styles.wrapper, className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses} role="group" aria-label="뷰 타입 선택">
      <button
        type="button"
        className={`${styles.button} ${value === 'list' ? styles.active : ''}`}
        onClick={() => onChange('list')}
        aria-pressed={value === 'list'}
        title="리스트 뷰"
      >
        {/* List Icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>
      <button
        type="button"
        className={`${styles.button} ${value === 'card' ? styles.active : ''}`}
        onClick={() => onChange('card')}
        aria-pressed={value === 'card'}
        title="카드 뷰"
      >
        {/* Grid Icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </button>
    </div>
  );
};
