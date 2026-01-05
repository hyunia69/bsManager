import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

/**
 * useAuth - 인증 관리 Hook
 *
 * 인증 상태와 제어 함수에 접근합니다.
 * 반드시 AuthProvider 내부에서 사용해야 합니다.
 *
 * @returns {Object} 인증 API 객체
 * @returns {Object|null} user - 현재 로그인된 사용자 객체
 * @returns {boolean} loading - 인증 상태 로딩 중 여부
 * @returns {string|null} error - 에러 메시지
 * @returns {Function} login - 로그인 함수 (email, password) => Promise
 * @returns {Function} register - 회원가입 함수 (email, password, metadata?) => Promise
 * @returns {Function} logout - 로그아웃 함수 () => Promise
 *
 * @throws {Error} AuthProvider 외부에서 사용 시 에러
 *
 * @example
 * const { user, loading, login, logout } = useAuth();
 *
 * if (loading) return <div>로딩 중...</div>;
 * if (!user) return <Navigate to="/login" />;
 *
 * return <div>안녕하세요, {user.email}!</div>;
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider. ' +
      'Wrap your app with <AuthProvider>...</AuthProvider>'
    );
  }

  return context;
}
