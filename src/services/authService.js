/**
 * 인증 서비스
 * Supabase Auth API 래핑
 */

import { supabase } from './supabase';

/**
 * 에러 메시지 한글 변환 테이블
 */
const ERROR_MESSAGES = {
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'Email not confirmed': '이메일 인증이 필요합니다. 받은편지함을 확인해주세요.',
  'User already registered': '이미 등록된 이메일입니다.',
  'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
  'Unable to validate email address: invalid format': '올바른 이메일 형식이 아닙니다.',
  'Email rate limit exceeded': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
  'Signup requires a valid password': '비밀번호를 입력해주세요.',
};

/**
 * Supabase 에러 메시지를 한글로 변환
 * @param {Error} error - Supabase 에러 객체
 * @returns {string} 한글 에러 메시지
 */
export const getErrorMessage = (error) => {
  if (!error?.message) return '알 수 없는 오류가 발생했습니다.';

  // 정확히 일치하는 메시지 찾기
  if (ERROR_MESSAGES[error.message]) {
    return ERROR_MESSAGES[error.message];
  }

  // 부분 일치 검색
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (error.message.includes(key)) {
      return value;
    }
  }

  return error.message;
};

/**
 * 이메일/비밀번호 로그인
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

/**
 * 회원가입
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @param {Object} metadata - 추가 메타데이터 (선택)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const signUp = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  return { data, error };
};

/**
 * 로그아웃
 * @returns {Promise<{error: Error|null}>}
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * 현재 세션 확인
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

/**
 * 인증 상태 변경 리스너 등록
 * @param {Function} callback - 상태 변경 시 호출될 콜백
 * @returns {Object} subscription 객체 (unsubscribe 메서드 포함)
 */
export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session);
    }
  );
  return subscription;
};
