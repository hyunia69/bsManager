import styles from './Card.module.css';

/**
 * Card 컴포넌트 - 컨테이너 역할
 * @param {React.ReactNode} children - 카드 내용
 * @param {string} className - 추가 CSS 클래스
 */
export const Card = ({ children, className = '', ...props }) => {
  const cardClasses = [styles.card, className].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * CardHeader 컴포넌트 - 카드 헤더 섹션
 * @param {React.ReactNode} children - 헤더 내용
 * @param {string} className - 추가 CSS 클래스
 */
export const CardHeader = ({ children, className = '', ...props }) => {
  const headerClasses = [styles.header, className].filter(Boolean).join(' ');

  return (
    <div className={headerClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * CardContent 컴포넌트 - 카드 본문 섹션
 * @param {React.ReactNode} children - 본문 내용
 * @param {string} className - 추가 CSS 클래스
 */
export const CardContent = ({ children, className = '', ...props }) => {
  const contentClasses = [styles.content, className].filter(Boolean).join(' ');

  return (
    <div className={contentClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * CardFooter 컴포넌트 - 카드 푸터 섹션
 * @param {React.ReactNode} children - 푸터 내용
 * @param {string} className - 추가 CSS 클래스
 */
export const CardFooter = ({ children, className = '', ...props }) => {
  const footerClasses = [styles.footer, className].filter(Boolean).join(' ');

  return (
    <div className={footerClasses} {...props}>
      {children}
    </div>
  );
};
