import styles from './Select.module.css';

/**
 * Select 컴포넌트
 * @param {Array<{value: string, label: string}>} options - 선택 옵션 배열
 * @param {string} value - 선택된 값
 * @param {Function} onChange - 값 변경 핸들러
 * @param {string} placeholder - 플레이스홀더 텍스트
 * @param {boolean} error - 에러 상태
 * @param {boolean} disabled - 비활성화 상태
 * @param {string} className - 추가 CSS 클래스
 */
export const Select = ({
  options = [],
  value,
  onChange,
  placeholder = '선택하세요',
  error = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const selectClasses = [styles.select, error && styles.error, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrapper}>
      <select
        className={selectClasses}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={error}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className={styles.arrow} aria-hidden="true">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
};
