import React, { createContext, useState, useEffect } from 'react';
import * as authService from '@services/authService';

// AuthContext 생성
export const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

/**
 * AuthProvider 컴포넌트
 *
 * 인증 상태를 관리하고 하위 컴포넌트에 제공합니다.
 * - 초기 세션 로드
 * - 상태 변경 구독
 * - 로그인/회원가입/로그아웃 함수 제공
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 하위 컴포넌트
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 초기 세션 확인 및 상태 변경 구독
  useEffect(() => {
    // 1. 현재 세션 확인
    authService.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. 상태 변경 리스너 등록
    const subscription = authService.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 3. 클린업: 구독 해제
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * 로그인
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호
   * @returns {Promise<{data: Object|null, error: string|null}>}
   */
  const login = async (email, password) => {
    setError(null);
    const { data, error } = await authService.signIn(email, password);

    if (error) {
      const errorMessage = authService.getErrorMessage(error);
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }

    return { data, error: null };
  };

  /**
   * 회원가입
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호
   * @param {Object} metadata - 추가 메타데이터 (선택)
   * @returns {Promise<{data: Object|null, error: string|null}>}
   */
  const register = async (email, password, metadata = {}) => {
    setError(null);
    const { data, error } = await authService.signUp(email, password, metadata);

    if (error) {
      const errorMessage = authService.getErrorMessage(error);
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }

    return { data, error: null };
  };

  /**
   * 로그아웃
   * @returns {Promise<{error: string|null}>}
   */
  const logout = async () => {
    setError(null);
    const { error } = await authService.signOut();

    if (error) {
      const errorMessage = authService.getErrorMessage(error);
      setError(errorMessage);
      return { error: errorMessage };
    }

    return { error: null };
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
