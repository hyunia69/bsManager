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

// 환경변수 확인
const isConfigured = supabaseUrl && supabaseAnonKey;

if (!isConfigured) {
  console.warn('⚠️ Supabase 환경변수가 설정되지 않았습니다.');
  console.warn('VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 .env.local에 설정하세요.');
}

// Supabase 클라이언트 생성 (환경변수가 없으면 더미 URL 사용)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

/**
 * Supabase 연결 상태 확인 (개발용)
 */
export const checkConnection = () => {
  return isConfigured;
};
