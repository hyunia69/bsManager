/**
 * 상담 서비스
 * Supabase consultations 테이블 CRUD 함수
 */

import { supabase } from './supabase';

/**
 * 상담 분류 타입
 * @typedef {'inquiry'|'proposal'|'order'|'delivery'|'as'|'outsource_in'|'outsource_out'|'outsource_req'|'claim'|'request'|'repair'} Category
 */

/**
 * 상담 진행상태 타입
 * @typedef {'pending'|'progress'|'completed'} Status
 */

/**
 * 모든 상담 목록 조회 (페이지네이션 지원)
 * @param {Object} options - 조회 옵션
 * @param {string} options.search - 검색어 (회사명)
 * @param {Status} options.status - 진행상태 필터
 * @param {string} options.startDate - 시작일
 * @param {string} options.endDate - 종료일
 * @param {number} options.page - 현재 페이지 (1부터 시작)
 * @param {number} options.pageSize - 페이지당 항목 수
 * @returns {Promise<{data: Array, count: number, error: Error|null}>}
 */
export const getConsultations = async ({
  search = '',
  status = '',
  startDate = '',
  endDate = '',
  page = 1,
  pageSize = 10,
} = {}) => {
  const offset = (page - 1) * pageSize;

  // 총 개수 조회를 위한 쿼리
  let countQuery = supabase
    .from('consultations')
    .select('*, clients!inner(company_name)', { count: 'exact', head: true });

  // 데이터 조회를 위한 쿼리
  let dataQuery = supabase
    .from('consultations')
    .select(`
      *,
      clients (
        company_name,
        contact_person,
        phone,
        email
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  // 필터 적용
  if (status) {
    countQuery = countQuery.eq('status', status);
    dataQuery = dataQuery.eq('status', status);
  }
  if (startDate) {
    countQuery = countQuery.gte('created_at', startDate);
    dataQuery = dataQuery.gte('created_at', startDate);
  }
  if (endDate) {
    countQuery = countQuery.lte('created_at', endDate);
    dataQuery = dataQuery.lte('created_at', endDate);
  }

  // 병렬 실행
  const [countResult, dataResult] = await Promise.all([
    countQuery,
    dataQuery,
  ]);

  let { data } = dataResult;
  const { error } = dataResult;
  let count = countResult.count || 0;

  // 검색어가 있으면 클라이언트 측에서 필터링
  // (회사명 검색은 join 테이블이라 서버측 필터링이 복잡)
  if (search && data) {
    const filtered = data.filter(item =>
      item.clients?.company_name?.toLowerCase().includes(search.toLowerCase())
    );
    data = filtered;
    count = filtered.length;
  }

  return { data, count, error };
};

/**
 * 상담 상세 조회
 * @param {string} id - 상담 ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getConsultationById = async (id) => {
  const { data, error } = await supabase
    .from('consultations')
    .select(`
      *,
      clients (
        company_name,
        contact_person,
        phone,
        email
      )
    `)
    .eq('id', id)
    .single();
  return { data, error };
};

/**
 * 특정 거래처의 상담 목록 조회
 * @param {string} clientId - 거래처 ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getConsultationsByClientId = async (clientId) => {
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  return { data, error };
};

/**
 * 상담 등록
 * @param {Object} consultation - 상담 정보
 * @param {string} consultation.client_id - 거래처 ID
 * @param {Category} consultation.category - 분류
 * @param {string} consultation.content - 상담내역
 * @param {Status} consultation.status - 진행상태 (기본값: 'pending')
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const createConsultation = async (consultation) => {
  // 현재 로그인한 사용자 ID 가져오기
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: new Error('로그인이 필요합니다.') };
  }

  const { data, error } = await supabase
    .from('consultations')
    .insert([{
      ...consultation,
      user_id: user.id,
      status: consultation.status || 'pending',
    }])
    .select()
    .single();
  return { data, error };
};

/**
 * 상담 수정
 * @param {string} id - 상담 ID
 * @param {Object} updates - 수정할 정보
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateConsultation = async (id, updates) => {
  const { data, error } = await supabase
    .from('consultations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

/**
 * 상담 진행상태 변경
 * @param {string} id - 상담 ID
 * @param {Status} status - 새 진행상태
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateConsultationStatus = async (id, status) => {
  return updateConsultation(id, { status });
};

/**
 * 상담 삭제
 * @param {string} id - 상담 ID
 * @returns {Promise<{error: Error|null}>}
 */
export const deleteConsultation = async (id) => {
  const { error } = await supabase
    .from('consultations')
    .delete()
    .eq('id', id);
  return { error };
};

/**
 * 거래처별 상담내역 (타임라인용)
 * 날짜별로 그룹핑된 상담 목록 반환
 * @param {string} clientId - 거래처 ID
 * @returns {Promise<{data: Array<{date: string, items: Array}>, error: Error|null}>}
 */
export const getConsultationTimeline = async (clientId) => {
  const { data: consultations, error } = await getConsultationsByClientId(clientId);

  if (error) return { data: null, error };

  // 날짜별 그룹핑
  const grouped = (consultations || []).reduce((acc, item) => {
    const date = new Date(item.created_at).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push({
      ...item,
      time: new Date(item.created_at).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
    });
    return acc;
  }, {});

  const timeline = Object.entries(grouped)
    .map(([date, items]) => ({ date, items }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return { data: timeline, error: null };
};
