/**
 * 거래처 서비스
 * Supabase clients 테이블 CRUD 함수
 */

import { supabase } from './supabase';

/**
 * 모든 거래처 목록 조회 (페이지네이션 지원)
 * @param {Object} options - 조회 옵션
 * @param {string} options.search - 검색어 (회사명, 담당자)
 * @param {number} options.page - 현재 페이지 (1부터 시작)
 * @param {number} options.pageSize - 페이지당 항목 수
 * @returns {Promise<{data: Array, count: number, error: Error|null}>}
 */
export const getClients = async ({ search = '', page = 1, pageSize = 10 } = {}) => {
  const offset = (page - 1) * pageSize;

  // 총 개수 조회를 위한 쿼리
  let countQuery = supabase
    .from('clients')
    .select('*', { count: 'exact', head: true });

  // 데이터 조회를 위한 쿼리
  let dataQuery = supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  // 검색 필터 적용
  if (search) {
    const searchFilter = `company_name.ilike.%${search}%,contact_person.ilike.%${search}%`;
    countQuery = countQuery.or(searchFilter);
    dataQuery = dataQuery.or(searchFilter);
  }

  // 병렬 실행
  const [countResult, dataResult] = await Promise.all([
    countQuery,
    dataQuery,
  ]);

  const { data } = dataResult;
  const { error } = dataResult;
  const count = countResult.count || 0;

  return { data, count, error };
};

/**
 * 거래처 상세 조회
 * @param {string} id - 거래처 ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getClientById = async (id) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
};

/**
 * 거래처 등록
 * @param {Object} client - 거래처 정보
 * @param {string} client.company_name - 회사명
 * @param {string} client.contact_person - 담당자
 * @param {string} client.phone - 연락처
 * @param {string} client.email - 이메일 (선택)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const createClient = async (client) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single();
  return { data, error };
};

/**
 * 거래처 수정
 * @param {string} id - 거래처 ID
 * @param {Object} updates - 수정할 정보
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateClient = async (id, updates) => {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

/**
 * 거래처 삭제
 * @param {string} id - 거래처 ID
 * @returns {Promise<{error: Error|null}>}
 */
export const deleteClient = async (id) => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  return { error };
};

/**
 * 회사명으로 거래처 검색 (자동완성용)
 * @param {string} companyName - 검색할 회사명
 * @param {number} limit - 최대 결과 수
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const searchClientsByName = async (companyName, limit = 10) => {
  const { data, error } = await supabase
    .from('clients')
    .select('id, company_name, contact_person, phone, email')
    .ilike('company_name', `%${companyName}%`)
    .limit(limit);
  return { data, error };
};
