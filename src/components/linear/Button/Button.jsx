import styles from './Button.module.css';

/**
 * Button 컴포넌트
 * @param {'primary'|'secondary'|'ghost'} variant - 버튼 스타일 변형
 * @param {'small'|'medium'|'large'} size - 버튼 크기
 * @param {boolean} disabled - 비활성화 상태
 * @param {Function} onClick - 클릭 핸들러
 * @param {React.ReactNode} children - 버튼 내용
 * @param {string} className - 추가 CSS 클래스
 */
export const Button = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  children,
  className = '',
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
