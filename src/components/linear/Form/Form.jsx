import styles from './Form.module.css';

/**
 * FormLabel 컴포넌트
 * @param {string} htmlFor - 연결된 input의 id
 * @param {boolean} required - 필수 필드 여부
 * @param {React.ReactNode} children - 레이블 텍스트
 */
export const FormLabel = ({ htmlFor, required, children }) => (
  <label htmlFor={htmlFor} className={styles.label}>
    {children}
    {required && <span className={styles.required} aria-label="required">*</span>}
  </label>
);

/**
 * FormError 컴포넌트
 * @param {string} id - 에러 메시지 id (aria-describedby용)
 * @param {React.ReactNode} children - 에러 메시지
 */
export const FormError = ({ id, children }) => {
  if (!children) return null;

  return (
    <div id={id} className={styles.error} role="alert">
      {children}
    </div>
  );
};

/**
 * FormField 컴포넌트
 * @param {string} label - 필드 레이블
 * @param {string} name - 필드 이름
 * @param {string} type - input 타입
 * @param {boolean} required - 필수 필드 여부
 * @param {string} error - 에러 메시지
 * @param {React.ReactNode} children - Input 또는 커스텀 입력 요소
 */
export const FormField = ({
  label,
  name,
  type = 'text',
  required,
  error,
  children,
  ...props
}) => {
  const errorId = `${name}-error`;
  const hasError = Boolean(error);

  return (
    <div className={styles.field}>
      <FormLabel htmlFor={name} required={required}>
        {label}
      </FormLabel>
      <div className={styles.inputWrapper}>
        {children || (
          <input
            id={name}
            name={name}
            type={type}
            required={required}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            className={`${styles.input} ${hasError ? styles.invalid : ''}`}
            {...props}
          />
        )}
      </div>
      <FormError id={errorId}>{error}</FormError>
    </div>
  );
};

/**
 * Form 컴포넌트
 * @param {Function} onSubmit - 폼 제출 핸들러
 * @param {React.ReactNode} children - 폼 필드들
 */
export const Form = ({ onSubmit, children, ...props }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    onSubmit?.(data, e);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} {...props}>
      {children}
    </form>
  );
};

