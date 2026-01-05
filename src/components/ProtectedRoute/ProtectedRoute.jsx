import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import styles from './ProtectedRoute.module.css';

/**
 * ProtectedRoute 컴포넌트
 *
 * 인증되지 않은 사용자의 접근을 차단하고 로그인 페이지로 리다이렉트합니다.
 * 로그인 후 원래 접근하려던 경로로 복귀할 수 있도록 state에 경로를 저장합니다.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 보호할 컴포넌트
 * @param {string} [props.redirectTo='/login'] - 미인증 시 리다이렉트 경로
 */
export const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 인증 상태 로딩 중
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>로딩 중...</p>
      </div>
    );
  }

  // 미인증 상태: 로그인 페이지로 리다이렉트
  if (!user) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // 인증 상태: 보호된 콘텐츠 렌더링
  return children;
};
