import styles from './Badge.module.css';

/**
 * Badge 컴포넌트
 * 진행상태 표시용 배지
 * @param {'pending'|'progress'|'completed'} variant - 배지 종류
 * @param {'small'|'medium'} size - 배지 크기
 * @param {React.ReactNode} children - 배지 내용
 * @param {string} className - 추가 CSS 클래스
 */
export const Badge = ({
  variant = 'pending',
  size = 'medium',
  children,
  className = '',
  ...props
}) => {
  const badgeClasses = [styles.badge, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

/**
 * 상담 진행상태 레이블 매핑
 */
export const STATUS_LABELS = {
  pending: '미진행',
  progress: '진행',
  completed: '완료',
};

/**
 * StatusBadge 컴포넌트
 * 상담 진행상태를 표시하는 편의 컴포넌트
 * @param {'pending'|'progress'|'completed'} status - 진행상태
 * @param {'small'|'medium'} size - 배지 크기
 */
export const StatusBadge = ({ status = 'pending', size = 'medium', ...props }) => {
  return (
    <Badge variant={status} size={size} {...props}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
};
