import styles from './Textarea.module.css';

/**
 * Textarea 컴포넌트
 * @param {string} placeholder - 플레이스홀더 텍스트
 * @param {string} value - 입력 값
 * @param {Function} onChange - 값 변경 핸들러
 * @param {number} rows - 행 수 (기본값 4)
 * @param {boolean} error - 에러 상태
 * @param {boolean} disabled - 비활성화 상태
 * @param {boolean} resize - 리사이즈 가능 여부 (기본값 true)
 * @param {string} className - 추가 CSS 클래스
 */
export const Textarea = ({
  placeholder = '',
  value,
  onChange,
  rows = 4,
  error = false,
  disabled = false,
  resize = true,
  className = '',
  ...props
}) => {
  const textareaClasses = [
    styles.textarea,
    error && styles.error,
    !resize && styles.noResize,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <textarea
      className={textareaClasses}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      aria-invalid={error}
      {...props}
    />
  );
};
