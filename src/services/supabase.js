/**
 * Supabase 클라이언트 설정
 *
 * 환경변수:
 * - VITE_SUPABASE_URL: Supabase 프로젝트 URL
 * - VITE_SUPABASE_ANON_KEY: Supabase 익명 키
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase 연결 상태 확인 (개발용)
 */
export const checkConnection = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase 환경변수가 설정되지 않았습니다.');
    console.warn('VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 .env.local에 설정하세요.');
    return false;
  }
  return true;
};
