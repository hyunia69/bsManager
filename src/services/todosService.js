/**
 * 할 일 서비스
 * Supabase todos 테이블 CRUD 함수
 * Supabase 연결이 안 되면 Mock 데이터 사용
 */

import { supabase } from './supabase';

// Mock 모드 여부 (Supabase 연결 실패 시 자동 전환)
let useMockData = false;

// Mock 데이터 저장소 (지연 초기화)
let mockTodos = null;

// Mock 데이터 가져오기 (지연 초기화)
const getMockTodos = () => {
  if (mockTodos === null) {
    mockTodos = initMockTodos();
  }
  return mockTodos;
};

// Mock ID 생성
let mockIdCounter = 100;
const generateMockId = () => String(++mockIdCounter);

// 로컬 날짜를 YYYY-MM-DD 문자열로 변환 (타임존 문제 방지)
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Mock 데이터 초기화 (로컬 날짜 사용)
const initMockTodos = () => {
  const today = getLocalDateString();
  const dayOfWeek = new Date().getDay();
  const weekday = dayOfWeek === 0 ? 7 : dayOfWeek;

  return [
    {
      id: '1',
      title: '프로젝트 기획서 작성',
      content: '신규 프로젝트 기획서 초안 작성',
      due_date: today,
      status: 'incomplete',
      repeat_type: 'none',
      repeat_day: null,
      is_deleted: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: '팀 미팅',
      content: '주간 팀 미팅 참석',
      due_date: today,
      status: 'complete',
      repeat_type: 'weekly',
      repeat_day: weekday,
      is_deleted: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: '보고서 제출',
      content: '월간 업무 보고서 제출',
      due_date: today,
      status: 'incomplete',
      repeat_type: 'monthly',
      repeat_day: new Date().getDate(),
      is_deleted: false,
      created_at: new Date().toISOString(),
    },
  ];
};

// 상태 상수
export const TODO_STATUS = {
  INCOMPLETE: 'incomplete',
  COMPLETE: 'complete',
};

// 반복 유형 상수
export const REPEAT_TYPE = {
  NONE: 'none',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
};

// 요일 상수 (1: 월요일 ~ 7: 일요일)
export const WEEKDAYS = [
  { value: 1, label: '월요일' },
  { value: 2, label: '화요일' },
  { value: 3, label: '수요일' },
  { value: 4, label: '목요일' },
  { value: 5, label: '금요일' },
  { value: 6, label: '토요일' },
  { value: 7, label: '일요일' },
];

/**
 * Mock 데이터 필터링 헬퍼
 */
const filterMockTodos = ({ startDate, endDate, status, includeDeleted = false }) => {
  let filtered = [...getMockTodos()];

  // 삭제된 항목 필터링
  if (!includeDeleted) {
    filtered = filtered.filter((t) => !t.is_deleted);
  }

  // 날짜 필터링
  if (startDate) {
    filtered = filtered.filter((t) => t.due_date >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter((t) => t.due_date <= endDate);
  }

  // 상태 필터링
  if (status && status !== 'all') {
    filtered = filtered.filter((t) => t.status === status);
  }

  // 정렬 (날짜 오름차순, 생성일 내림차순)
  filtered.sort((a, b) => {
    const dateCompare = a.due_date.localeCompare(b.due_date);
    if (dateCompare !== 0) return dateCompare;
    return b.created_at.localeCompare(a.created_at);
  });

  return filtered;
};

/**
 * 할 일 목록 조회 (날짜 범위, 상태 필터)
 * @param {Object} options - 조회 옵션
 * @param {string} options.startDate - 시작 날짜 (YYYY-MM-DD)
 * @param {string} options.endDate - 종료 날짜 (YYYY-MM-DD)
 * @param {string} options.status - 상태 필터 (incomplete/complete)
 * @param {boolean} options.includeDeleted - 삭제된 항목 포함 여부
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getTodos = async ({ startDate, endDate, status, includeDeleted = false } = {}) => {
  // Mock 모드 사용
  if (useMockData) {
    const data = filterMockTodos({ startDate, endDate, status, includeDeleted });
    return { data, error: null };
  }

  try {
    let query = supabase
      .from('todos')
      .select('*')
      .order('due_date', { ascending: true })
      .order('created_at', { ascending: false });

    // 삭제된 항목 제외 (기본값)
    if (!includeDeleted) {
      query = query.or('is_deleted.is.null,is_deleted.eq.false');
    }

    if (startDate) {
      query = query.gte('due_date', startDate);
    }
    if (endDate) {
      query = query.lte('due_date', endDate);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    // Supabase 오류 시 Mock 모드로 전환
    if (error) {
      console.warn('Supabase 오류, Mock 데이터로 전환:', error.message);
      useMockData = true;
      return { data: filterMockTodos({ startDate, endDate, status, includeDeleted }), error: null };
    }

    return { data, error };
  } catch (err) {
    console.warn('Supabase 연결 실패, Mock 데이터로 전환:', err.message);
    useMockData = true;
    return { data: filterMockTodos({ startDate, endDate, status, includeDeleted }), error: null };
  }
};

/**
 * 오늘 할 일 조회
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getTodayTodos = async () => {
  const today = getLocalDateString();
  return getTodos({ startDate: today, endDate: today });
};

/**
 * 주간 할 일 조회 (월요일~일요일 기준)
 * @param {Date} date - 기준 날짜
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getWeeklyTodos = async (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  // 월요일로 이동 (일요일이면 -6, 그 외 1-day)
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));

  // 일요일로 이동
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startDate = getLocalDateString(monday);
  const endDate = getLocalDateString(sunday);

  return getTodos({ startDate, endDate });
};

/**
 * 월간 할 일 조회 (1일~말일)
 * @param {number} year - 연도
 * @param {number} month - 월 (1-12)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getMonthlyTodos = async (year, month) => {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

  return getTodos({ startDate, endDate });
};

/**
 * 할 일 상세 조회
 * @param {string} id - 할 일 ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getTodoById = async (id) => {
  if (useMockData) {
    const todo = getMockTodos().find((t) => t.id === id);
    return { data: todo || null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      useMockData = true;
      const todo = getMockTodos().find((t) => t.id === id);
      return { data: todo || null, error: null };
    }

    return { data, error };
  } catch (err) {
    useMockData = true;
    const todo = getMockTodos().find((t) => t.id === id);
    return { data: todo || null, error: null };
  }
};

/**
 * 할 일 생성
 * @param {Object} todoData - 할 일 정보
 * @param {string} todoData.title - 제목
 * @param {string} todoData.content - 내용 (선택)
 * @param {string} todoData.due_date - 날짜 (YYYY-MM-DD)
 * @param {string} todoData.status - 상태
 * @param {string} todoData.repeat_type - 반복 유형
 * @param {number} todoData.repeat_day - 반복 요일/일자
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const createTodo = async (todoData) => {
  const newTodo = {
    ...todoData,
    status: todoData.status || TODO_STATUS.INCOMPLETE,
    repeat_type: todoData.repeat_type || REPEAT_TYPE.NONE,
    is_deleted: todoData.is_deleted || false,
    created_at: new Date().toISOString(),
  };

  if (useMockData) {
    const mockTodo = { ...newTodo, id: generateMockId() };
    getMockTodos().push(mockTodo);
    return { data: mockTodo, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('todos')
      .insert([newTodo])
      .select()
      .single();

    if (error) {
      useMockData = true;
      const mockTodo = { ...newTodo, id: generateMockId() };
      getMockTodos().push(mockTodo);
      return { data: mockTodo, error: null };
    }

    return { data, error };
  } catch (err) {
    useMockData = true;
    const mockTodo = { ...newTodo, id: generateMockId() };
    getMockTodos().push(mockTodo);
    return { data: mockTodo, error: null };
  }
};

/**
 * 할 일 수정
 * @param {string} id - 할 일 ID
 * @param {Object} todoData - 수정할 정보
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateTodo = async (id, todoData) => {
  if (useMockData) {
    const todos = getMockTodos();
    const index = todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      todos[index] = { ...todos[index], ...todoData };
      return { data: todos[index], error: null };
    }
    return { data: null, error: { message: '할 일을 찾을 수 없습니다.' } };
  }

  try {
    const { data, error } = await supabase
      .from('todos')
      .update(todoData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      useMockData = true;
      const todos = getMockTodos();
      const index = todos.findIndex((t) => t.id === id);
      if (index !== -1) {
        todos[index] = { ...todos[index], ...todoData };
        return { data: todos[index], error: null };
      }
      return { data: null, error: null };
    }

    return { data, error };
  } catch (err) {
    useMockData = true;
    const todos = getMockTodos();
    const index = todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      todos[index] = { ...todos[index], ...todoData };
      return { data: todos[index], error: null };
    }
    return { data: null, error: null };
  }
};

/**
 * 할 일 상태 변경
 * @param {string} id - 할 일 ID
 * @param {string} status - 새 상태
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateTodoStatus = async (id, status) => {
  return updateTodo(id, { status });
};

/**
 * 할 일 삭제
 * @param {string} id - 할 일 ID
 * @returns {Promise<{error: Error|null}>}
 */
export const deleteTodo = async (id) => {
  if (useMockData) {
    const todos = getMockTodos();
    const index = todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      todos.splice(index, 1);
    }
    return { error: null };
  }

  try {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      useMockData = true;
      const todos = getMockTodos();
      const index = todos.findIndex((t) => t.id === id);
      if (index !== -1) {
        todos.splice(index, 1);
      }
      return { error: null };
    }

    return { error };
  } catch (err) {
    useMockData = true;
    const todos = getMockTodos();
    const index = todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      todos.splice(index, 1);
    }
    return { error: null };
  }
};

/**
 * 날짜별로 할 일 그룹핑
 * @param {Array} todos - 할 일 배열
 * @returns {Object} 날짜별 그룹 { 'YYYY-MM-DD': [...todos] }
 */
export const groupTodosByDate = (todos) => {
  return todos.reduce((groups, todo) => {
    const date = todo.due_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(todo);
    return groups;
  }, {});
};

/**
 * 주어진 날짜의 요일 가져오기 (1-7, 월-일)
 * @param {Date} date - 날짜
 * @returns {number} 요일 (1: 월요일 ~ 7: 일요일)
 */
export const getDayOfWeek = (date) => {
  const day = date.getDay();
  return day === 0 ? 7 : day;
};

/**
 * 모든 반복 일정 조회
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getRecurringTodos = async () => {
  if (useMockData) {
    const data = getMockTodos()
      .filter((t) => t.repeat_type && t.repeat_type !== REPEAT_TYPE.NONE && !t.is_deleted)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return { data, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .neq('repeat_type', REPEAT_TYPE.NONE)
      .or('is_deleted.is.null,is_deleted.eq.false')
      .order('created_at', { ascending: false });

    if (error) {
      useMockData = true;
      const mockData = getMockTodos()
        .filter((t) => t.repeat_type && t.repeat_type !== REPEAT_TYPE.NONE && !t.is_deleted)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
      return { data: mockData, error: null };
    }

    return { data, error };
  } catch (err) {
    useMockData = true;
    const mockData = getMockTodos()
      .filter((t) => t.repeat_type && t.repeat_type !== REPEAT_TYPE.NONE && !t.is_deleted)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return { data: mockData, error: null };
  }
};

/**
 * 삭제된 일정 조회 (개별 삭제 체크용)
 * @param {string} startDate - 시작 날짜 (YYYY-MM-DD)
 * @param {string} endDate - 종료 날짜 (YYYY-MM-DD)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getDeletedTodos = async (startDate, endDate) => {
  if (useMockData) {
    let filtered = getMockTodos().filter((t) => t.is_deleted);
    if (startDate) {
      filtered = filtered.filter((t) => t.due_date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((t) => t.due_date <= endDate);
    }
    return { data: filtered, error: null };
  }

  try {
    let query = supabase
      .from('todos')
      .select('*')
      .eq('is_deleted', true);

    if (startDate) {
      query = query.gte('due_date', startDate);
    }
    if (endDate) {
      query = query.lte('due_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      useMockData = true;
      let filtered = getMockTodos().filter((t) => t.is_deleted);
      if (startDate) {
        filtered = filtered.filter((t) => t.due_date >= startDate);
      }
      if (endDate) {
        filtered = filtered.filter((t) => t.due_date <= endDate);
      }
      return { data: filtered, error: null };
    }

    return { data, error };
  } catch (err) {
    useMockData = true;
    let filtered = getMockTodos().filter((t) => t.is_deleted);
    if (startDate) {
      filtered = filtered.filter((t) => t.due_date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((t) => t.due_date <= endDate);
    }
    return { data: filtered, error: null };
  }
};

/**
 * 반복 일정을 특정 날짜 범위에 맞게 가상 할 일로 확장
 * @param {Array} recurringTodos - 반복 일정 배열
 * @param {string} startDate - 시작 날짜 (YYYY-MM-DD)
 * @param {string} endDate - 종료 날짜 (YYYY-MM-DD)
 * @param {Array} existingTodos - 기존 일정 배열 (중복 체크용)
 * @param {Array} deletedTodos - 삭제된 일정 배열 (개별 삭제 체크용)
 * @returns {Array} 확장된 가상 할 일 배열
 */
export const expandRecurringTodos = (recurringTodos, startDate, endDate, existingTodos = [], deletedTodos = []) => {
  const expandedTodos = [];
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');

  // 기존 일정의 날짜+제목 조합 Set (중복 체크용 - 완료 처리된 일정)
  const existingKeys = new Set(
    existingTodos.map((t) => `${t.due_date}_${t.title}`)
  );

  // 삭제된 일정의 날짜+제목 조합 Set (개별 삭제 체크용)
  const deletedKeys = new Set(
    deletedTodos.map((t) => `${t.due_date}_${t.title}`)
  );

  recurringTodos.forEach((todo) => {
    const originalDate = new Date(todo.due_date + 'T00:00:00');

    // 반복 시작일(원본 날짜) 이전은 표시하지 않음
    const effectiveStart = start > originalDate ? start : originalDate;

    for (let d = new Date(effectiveStart); d <= end; d.setDate(d.getDate() + 1)) {
      let shouldInclude = false;

      if (todo.repeat_type === REPEAT_TYPE.WEEKLY) {
        // 매주 반복: 해당 요일에 표시
        const dayOfWeek = getDayOfWeek(d);
        if (dayOfWeek === todo.repeat_day) {
          shouldInclude = true;
        }
      } else if (todo.repeat_type === REPEAT_TYPE.MONTHLY) {
        // 매달 반복: 해당 일자에 표시
        if (d.getDate() === todo.repeat_day) {
          shouldInclude = true;
        }
      }

      if (shouldInclude) {
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        // 원본 날짜와 같으면 이미 일반 조회에서 포함되므로 건너뜀
        if (dateStr === todo.due_date) continue;

        // 해당 날짜에 같은 제목의 일정이 이미 있으면 건너뜀 (개별 완료 처리된 경우)
        const key = `${dateStr}_${todo.title}`;
        if (existingKeys.has(key)) continue;

        // 해당 날짜에 삭제된 일정이 있으면 건너뜀 (개별 삭제된 경우)
        if (deletedKeys.has(key)) continue;

        expandedTodos.push({
          ...todo,
          due_date: dateStr,
          isRecurring: true, // 반복 일정 표시용 플래그
          originalId: todo.id, // 원본 ID 보존
          id: `${todo.id}_${dateStr}`, // 고유 ID 생성
        });
      }
    }
  });

  return expandedTodos;
};
