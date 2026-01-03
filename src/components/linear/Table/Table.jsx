import styles from './Table.module.css';

/**
 * Table 컴포넌트
 * @param {React.ReactNode} children - 테이블 내용
 * @param {string} className - 추가 CSS 클래스
 */
export const Table = ({ children, className = '', ...props }) => {
  const tableClasses = [styles.table, className].filter(Boolean).join(' ');

  return (
    <div className={styles.wrapper}>
      <table className={tableClasses} {...props}>
        {children}
      </table>
    </div>
  );
};

/**
 * TableHeader 컴포넌트 (thead)
 * @param {React.ReactNode} children - 헤더 행들
 * @param {string} className - 추가 CSS 클래스
 */
export const TableHeader = ({ children, className = '', ...props }) => {
  const headerClasses = [styles.header, className].filter(Boolean).join(' ');

  return (
    <thead className={headerClasses} {...props}>
      {children}
    </thead>
  );
};

/**
 * TableBody 컴포넌트 (tbody)
 * @param {React.ReactNode} children - 본문 행들
 * @param {string} className - 추가 CSS 클래스
 */
export const TableBody = ({ children, className = '', ...props }) => {
  const bodyClasses = [styles.body, className].filter(Boolean).join(' ');

  return (
    <tbody className={bodyClasses} {...props}>
      {children}
    </tbody>
  );
};

/**
 * TableRow 컴포넌트 (tr)
 * @param {React.ReactNode} children - 셀들
 * @param {boolean} clickable - 클릭 가능 여부
 * @param {boolean} selected - 선택 상태
 * @param {Function} onClick - 클릭 핸들러
 * @param {string} className - 추가 CSS 클래스
 */
export const TableRow = ({
  children,
  clickable = false,
  selected = false,
  onClick,
  className = '',
  ...props
}) => {
  const rowClasses = [
    styles.row,
    clickable && styles.clickable,
    selected && styles.selected,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <tr
      className={rowClasses}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(e);
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </tr>
  );
};

/**
 * TableCell 컴포넌트 (td/th)
 * @param {React.ReactNode} children - 셀 내용
 * @param {boolean} header - 헤더 셀 여부 (th)
 * @param {'left'|'center'|'right'} align - 텍스트 정렬
 * @param {string} className - 추가 CSS 클래스
 */
export const TableCell = ({
  children,
  header = false,
  align = 'left',
  className = '',
  ...props
}) => {
  const Tag = header ? 'th' : 'td';
  const cellClasses = [styles.cell, styles[align], className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={cellClasses} {...props}>
      {children}
    </Tag>
  );
};
