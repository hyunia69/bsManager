import styles from './Input.module.css';

/**
 * Input 컴포넌트
 * @param {'text'|'email'|'password'|'number'} type - 입력 타입
 * @param {string} placeholder - 플레이스홀더 텍스트
 * @param {string} value - 입력 값
 * @param {Function} onChange - 값 변경 핸들러
 * @param {boolean} error - 에러 상태
 * @param {boolean} disabled - 비활성화 상태
 * @param {string} className - 추가 CSS 클래스
 */
export const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputClasses = [styles.input, error && styles.error, className]
    .filter(Boolean)
    .join(' ');

  return (
    <input
      type={type}
      className={inputClasses}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      aria-invalid={error}
      {...props}
    />
  );
};
