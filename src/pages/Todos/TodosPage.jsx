import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from '@components';
import { Select } from '@linear/Select';
import { Textarea } from '@linear/Textarea';
import {
  getTodos,
  getTodayTodos,
  getWeeklyTodos,
  getMonthlyTodos,
  createTodo,
  updateTodo,
  updateTodoStatus,
  deleteTodo,
  groupTodosByDate,
  getRecurringTodos,
  getDeletedTodos,
  expandRecurringTodos,
  TODO_STATUS,
  REPEAT_TYPE,
  WEEKDAYS,
} from '@services/todosService';
import styles from './TodosPage.module.css';

// 뷰 모드 상수
const VIEW_MODE = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
};

// 로컬 날짜를 YYYY-MM-DD 문자열로 변환 (타임존 문제 방지)
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * TodosPage - 할 일 관리 페이지
 * 할 일 생성, 수정, 검색, 일간/주간/월간 뷰 제공
 */
export const TodosPage = () => {
  // 할 일 목록 상태
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 뷰 모드 상태
  const [viewMode, setViewMode] = useState(VIEW_MODE.DAILY);
  const [currentDate, setCurrentDate] = useState(new Date());

  // 검색 필터 상태 (입력용)
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 검색 적용 상태 (실제 검색에 사용)
  const [appliedFilters, setAppliedFilters] = useState({
    statusFilter: 'all',
    startDate: '',
    endDate: '',
  });

  // 폼 상태
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    due_date: getLocalDateString(),
    status: TODO_STATUS.INCOMPLETE,
    repeat_type: REPEAT_TYPE.NONE,
    repeat_day: null,
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // 삭제 확인 모달
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(null); // 'single' | 'all' | null
  const [parentRecurringTodo, setParentRecurringTodo] = useState(null); // 완료된 일정의 원본 반복 일정

  // 날짜 범위 계산 헬퍼
  const getDateRange = useCallback(() => {
    if (appliedFilters.startDate || appliedFilters.endDate) {
      return { start: appliedFilters.startDate, end: appliedFilters.endDate };
    }

    const today = getLocalDateString();

    switch (viewMode) {
      case VIEW_MODE.DAILY:
        return { start: today, end: today };
      case VIEW_MODE.WEEKLY: {
        const d = new Date(currentDate);
        const day = d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return {
          start: getLocalDateString(monday),
          end: getLocalDateString(sunday),
        };
      }
      case VIEW_MODE.MONTHLY: {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const lastDay = new Date(year, month, 0).getDate();
        return {
          start: `${year}-${String(month).padStart(2, '0')}-01`,
          end: `${year}-${String(month).padStart(2, '0')}-${lastDay}`,
        };
      }
      default:
        return { start: today, end: today };
    }
  }, [viewMode, currentDate, appliedFilters.startDate, appliedFilters.endDate]);

  // 할 일 목록 조회
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let result;

      if (appliedFilters.startDate || appliedFilters.endDate || appliedFilters.statusFilter !== 'all') {
        // 검색 모드 (검색 버튼 클릭 후에만 적용)
        result = await getTodos({
          startDate: appliedFilters.startDate || undefined,
          endDate: appliedFilters.endDate || undefined,
          status: appliedFilters.statusFilter !== 'all' ? appliedFilters.statusFilter : undefined,
        });
      } else {
        // 뷰 모드별 조회
        switch (viewMode) {
          case VIEW_MODE.DAILY:
            result = await getTodayTodos();
            break;
          case VIEW_MODE.WEEKLY:
            result = await getWeeklyTodos(currentDate);
            break;
          case VIEW_MODE.MONTHLY:
            result = await getMonthlyTodos(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1
            );
            break;
          default:
            result = await getTodayTodos();
        }
      }

      if (result.error) {
        setError(result.error.message);
        return;
      }

      // 반복 일정 조회 및 확장
      const { start, end } = getDateRange();
      if (start && end) {
        // 반복 일정과 삭제된 일정을 병렬 조회
        const [recurringResult, deletedResult] = await Promise.all([
          getRecurringTodos(),
          getDeletedTodos(start, end),
        ]);

        if (!recurringResult.error && recurringResult.data) {
          // 기존 일정과 삭제된 일정을 전달하여 중복/삭제 처리
          const expandedTodos = expandRecurringTodos(
            recurringResult.data,
            start,
            end,
            result.data || [],
            deletedResult.data || []
          );

          // 반복 일정의 원본 날짜에 개별 완료 일정이 있으면 원본 제외
          // 개별 완료/처리된 일정 키 (반복 없는 일정만)
          const individualTodoKeys = new Set(
            (result.data || [])
              .filter((t) => !t.repeat_type || t.repeat_type === REPEAT_TYPE.NONE)
              .map((t) => `${t.due_date}_${t.title}`)
          );

          // 삭제된 일정 키 (개별 삭제된 날짜+제목)
          const deletedKeys = new Set(
            (deletedResult.data || []).map((t) => `${t.due_date}_${t.title}`)
          );

          // 원본 반복 일정 중 개별 처리/삭제된 것은 제외
          const filteredBaseTodos = (result.data || []).filter((todo) => {
            // 반복 일정이 아니면 유지
            if (!todo.repeat_type || todo.repeat_type === REPEAT_TYPE.NONE) {
              return true;
            }
            // 반복 일정인 경우, 같은 날짜+제목의 개별 일정이 있으면 제외
            const key = `${todo.due_date}_${todo.title}`;
            if (individualTodoKeys.has(key)) return false;
            // 반복 일정인 경우, 같은 날짜+제목이 삭제되었으면 제외
            if (deletedKeys.has(key)) return false;
            return true;
          });

          const allTodos = [...filteredBaseTodos, ...expandedTodos];
          // 날짜순 정렬
          allTodos.sort((a, b) => a.due_date.localeCompare(b.due_date));
          setTodos(allTodos);
        } else {
          setTodos(result.data || []);
        }
      } else {
        setTodos(result.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [viewMode, currentDate, appliedFilters, getDateRange]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // 뷰 모드 변경
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    // 입력 필드 초기화
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
    // 적용된 필터도 초기화
    setAppliedFilters({
      statusFilter: 'all',
      startDate: '',
      endDate: '',
    });
  };

  // 검색 실행 (버튼 클릭 시에만 필터 적용)
  const handleSearch = () => {
    setAppliedFilters({
      statusFilter,
      startDate,
      endDate,
    });
  };

  // 검색 초기화
  const handleResetSearch = () => {
    // 입력 필드 초기화
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
    // 적용된 필터도 초기화
    setAppliedFilters({
      statusFilter: 'all',
      startDate: '',
      endDate: '',
    });
  };

  // 폼 입력 변경
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // repeat_day는 숫자로 변환 (빈 문자열은 null)
    if (name === 'repeat_day') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? null : parseInt(value, 10)
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setEditingTodo(null);
    setFormData({
      title: '',
      content: '',
      due_date: getLocalDateString(),
      status: TODO_STATUS.INCOMPLETE,
      repeat_type: REPEAT_TYPE.NONE,
      repeat_day: null,
    });
    setFormError('');
  };

  // 할 일 선택 (수정 모드)
  const handleSelectTodo = (todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      content: todo.content || '',
      due_date: todo.due_date,
      status: todo.status,
      repeat_type: todo.repeat_type || REPEAT_TYPE.NONE,
      repeat_day: todo.repeat_day,
    });
    setFormError('');
  };

  // 폼 유효성 검사
  const validateForm = () => {
    if (!formData.title.trim()) {
      setFormError('제목을 입력해주세요.');
      return false;
    }
    if (!formData.due_date) {
      setFormError('날짜를 선택해주세요.');
      return false;
    }
    return true;
  };

  // 저장 (등록/수정)
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setFormError('');

    try {
      const todoData = {
        title: formData.title.trim(),
        content: formData.content.trim() || null,
        due_date: formData.due_date,
        status: formData.status,
        repeat_type: formData.repeat_type,
        repeat_day: formData.repeat_type !== REPEAT_TYPE.NONE ? formData.repeat_day : null,
      };

      if (editingTodo) {
        const { error: updateError } = await updateTodo(editingTodo.id, todoData);
        if (updateError) throw updateError;
      } else {
        const { error: createError } = await createTodo(todoData);
        if (createError) throw createError;
      }

      resetForm();
      fetchTodos();
    } catch (err) {
      setFormError(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 상태 토글 (체크박스)
  const handleToggleStatus = async (todo, e) => {
    e.stopPropagation();
    const newStatus =
      todo.status === TODO_STATUS.COMPLETE
        ? TODO_STATUS.INCOMPLETE
        : TODO_STATUS.COMPLETE;

    // 반복 일정인지 확인 (가상 확장된 것 또는 원본 반복 일정)
    const isRepeatingTodo = todo.isRecurring || (todo.repeat_type && todo.repeat_type !== REPEAT_TYPE.NONE);

    if (isRepeatingTodo) {
      // 반복 일정: 해당 날짜에 개별 일정으로 상태 관리
      // 해당 날짜에 이미 생성된 개별 일정이 있는지 확인 (반복 없는 일정)
      const existingIndividualTodo = todos.find(
        (t) => !t.isRecurring &&
               t.due_date === todo.due_date &&
               t.title === todo.title &&
               (!t.repeat_type || t.repeat_type === REPEAT_TYPE.NONE)
      );

      if (existingIndividualTodo) {
        // 이미 해당 날짜에 개별 일정이 있으면 그 일정의 상태만 변경
        const { error: statusError } = await updateTodoStatus(existingIndividualTodo.id, newStatus);
        if (statusError) {
          alert('상태 변경 중 오류가 발생했습니다: ' + statusError.message);
        } else {
          fetchTodos();
        }
      } else {
        // 없으면 해당 날짜에 새 개별 일정 생성 (반복 없음으로)
        const { error: createError } = await createTodo({
          title: todo.title,
          content: todo.content,
          due_date: todo.due_date,
          status: newStatus,
          repeat_type: REPEAT_TYPE.NONE,
          repeat_day: null,
        });
        if (createError) {
          alert('일정 생성 중 오류가 발생했습니다: ' + createError.message);
        } else {
          fetchTodos();
        }
      }
    } else {
      // 일반 일정 (반복 없음): 기존 방식대로 상태 변경
      const { error: statusError } = await updateTodoStatus(todo.id, newStatus);
      if (statusError) {
        alert('상태 변경 중 오류가 발생했습니다: ' + statusError.message);
      } else {
        fetchTodos();
      }
    }
  };

  // 삭제 확인
  const handleDeleteClick = async (todo, e) => {
    e.stopPropagation();
    setDeleteTarget(todo);
    setDeleteMode(null);

    // 완료된 일정(repeat_type: none)이 원본 반복 일정의 인스턴스인지 확인
    // 같은 title을 가진 반복 일정이 있으면 원본으로 저장
    const isAlreadyRepeating = todo.isRecurring || (todo.repeat_type && todo.repeat_type !== REPEAT_TYPE.NONE);
    if (!isAlreadyRepeating) {
      // DB에서 반복 일정 목록 조회하여 같은 title을 가진 원본 반복 일정 찾기
      const { data: recurringTodos } = await getRecurringTodos();
      const parentTodo = recurringTodos?.find(
        (t) => t.title === todo.title && t.id !== todo.id
      );
      setParentRecurringTodo(parentTodo || null);
    } else {
      setParentRecurringTodo(null);
    }

    setIsDeleteModalOpen(true);
  };

  // 삭제 실행
  const handleDeleteConfirm = async (mode) => {
    if (!deleteTarget) return;

    // 반복 일정(원본 또는 가상) 또는 완료된 반복 인스턴스
    const isRepeating = deleteTarget.isRecurring || (deleteTarget.repeat_type && deleteTarget.repeat_type !== REPEAT_TYPE.NONE);
    const isCompletedInstance = parentRecurringTodo !== null;

    if ((isRepeating || isCompletedInstance) && mode === 'single') {
      // 개별 삭제
      if (isCompletedInstance) {
        // 완료된 인스턴스 삭제: 현재 일정 삭제 + 삭제 마킹 생성
        const { error: deleteError } = await deleteTodo(deleteTarget.id);
        if (deleteError) {
          alert('삭제 중 오류가 발생했습니다: ' + deleteError.message);
        } else {
          // 해당 날짜에 삭제 표시용 일정 생성 (원본 반복 일정 확장 시 제외용)
          await createTodo({
            title: deleteTarget.title,
            content: deleteTarget.content,
            due_date: deleteTarget.due_date,
            status: TODO_STATUS.INCOMPLETE,
            repeat_type: REPEAT_TYPE.NONE,
            repeat_day: null,
            is_deleted: true,
          });
          fetchTodos();
        }
      } else {
        // 원본 반복 일정 또는 가상 확장 일정 개별 삭제
        const { error: createError } = await createTodo({
          title: deleteTarget.title,
          content: deleteTarget.content,
          due_date: deleteTarget.due_date,
          status: TODO_STATUS.INCOMPLETE,
          repeat_type: REPEAT_TYPE.NONE,
          repeat_day: null,
          is_deleted: true,
        });
        if (createError) {
          alert('삭제 처리 중 오류가 발생했습니다: ' + createError.message);
        } else {
          fetchTodos();
        }
      }
    } else if ((isRepeating || isCompletedInstance) && mode === 'all') {
      // 전체 삭제
      if (isCompletedInstance) {
        // 완료된 인스턴스에서 전체 삭제: 원본 반복 일정 삭제 + 현재 일정 삭제
        const { error: deleteParentError } = await deleteTodo(parentRecurringTodo.id);
        if (deleteParentError) {
          alert('삭제 중 오류가 발생했습니다: ' + deleteParentError.message);
        } else {
          // 현재 완료된 일정도 삭제
          await deleteTodo(deleteTarget.id);
          if (editingTodo?.id === deleteTarget.id || editingTodo?.id === parentRecurringTodo.id) {
            resetForm();
          }
          fetchTodos();
        }
      } else {
        // 원본 반복 일정 전체 삭제
        const todoId = deleteTarget.originalId || deleteTarget.id;
        const { error: deleteError } = await deleteTodo(todoId);
        if (deleteError) {
          alert('삭제 중 오류가 발생했습니다: ' + deleteError.message);
        } else {
          if (editingTodo?.id === deleteTarget.id || editingTodo?.id === todoId) {
            resetForm();
          }
          fetchTodos();
        }
      }
    } else {
      // 일반 일정 삭제
      const todoId = deleteTarget.originalId || deleteTarget.id;
      const { error: deleteError } = await deleteTodo(todoId);
      if (deleteError) {
        alert('삭제 중 오류가 발생했습니다: ' + deleteError.message);
      } else {
        if (editingTodo?.id === deleteTarget.id || editingTodo?.id === todoId) {
          resetForm();
        }
        fetchTodos();
      }
    }
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
    setDeleteMode(null);
    setParentRecurringTodo(null);
  };

  // 날짜 포맷 (타임존 문제 방지를 위해 문자열 직접 파싱)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // "YYYY-MM-DD" 형식을 직접 파싱하여 타임존 문제 방지
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${month}/${day} (${days[date.getDay()]})`;
  };

  // 월간 네비게이션
  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  // 주간 네비게이션
  const handlePrevWeek = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  // 그룹화된 할 일 (주간 뷰용)
  const groupedTodos = groupTodosByDate(todos);

  // 캘린더 날짜 생성 (월간 뷰용)
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days = [];

    // 이전 달 날짜들
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isOtherMonth: true,
      });
    }

    // 현재 달 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isOtherMonth: false,
      });
    }

    // 다음 달 날짜들 (6주 채우기)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isOtherMonth: true,
      });
    }

    return days;
  };

  // 특정 날짜의 할 일 가져오기
  const getTodosForDate = (date) => {
    const dateStr = getLocalDateString(date);
    return todos.filter((todo) => todo.due_date === dateStr);
  };

  // 오늘 날짜 확인
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // 캘린더 날짜 클릭
  const handleCalendarDayClick = (date) => {
    setFormData((prev) => ({
      ...prev,
      due_date: getLocalDateString(date),
    }));
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>할 일 관리</h1>
      </header>

      {/* 검색 및 뷰 모드 */}
      <Card className={styles.searchCard}>
        <CardContent>
          <div className={styles.searchRow}>
            <div className={styles.searchField}>
              <label className={styles.searchLabel}>시작일</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className={styles.searchField}>
              <label className={styles.searchLabel}>종료일</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className={styles.searchField}>
              <label className={styles.searchLabel}>상태</label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: '전체' },
                  { value: TODO_STATUS.INCOMPLETE, label: '미완료' },
                  { value: TODO_STATUS.COMPLETE, label: '완료' },
                ]}
              />
            </div>
            <Button variant="secondary" onClick={handleSearch}>
              검색
            </Button>
            <Button variant="ghost" onClick={handleResetSearch}>
              초기화
            </Button>
          </div>
          <div className={styles.viewModeButtons}>
            <button
              className={`${styles.viewModeButton} ${
                viewMode === VIEW_MODE.DAILY ? styles.active : ''
              }`}
              onClick={() => handleViewModeChange(VIEW_MODE.DAILY)}
            >
              일간
            </button>
            <button
              className={`${styles.viewModeButton} ${
                viewMode === VIEW_MODE.WEEKLY ? styles.active : ''
              }`}
              onClick={() => handleViewModeChange(VIEW_MODE.WEEKLY)}
            >
              주간
            </button>
            <button
              className={`${styles.viewModeButton} ${
                viewMode === VIEW_MODE.MONTHLY ? styles.active : ''
              }`}
              onClick={() => handleViewModeChange(VIEW_MODE.MONTHLY)}
            >
              월간
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 메인 컨텐츠 */}
      <div className={styles.content}>
        {/* 왼쪽: 할 일 리스트 */}
        <Card className={styles.listSection}>
          <CardHeader>
            <div className={styles.listHeader}>
              <h2 className={styles.sectionTitle}>
                {viewMode === VIEW_MODE.DAILY && '오늘 할 일'}
                {viewMode === VIEW_MODE.WEEKLY && '주간 할 일'}
                {viewMode === VIEW_MODE.MONTHLY && '월간 할 일'}
              </h2>
              {viewMode === VIEW_MODE.WEEKLY && (
                <div className={styles.calendarNav}>
                  <Button variant="ghost" size="small" onClick={handlePrevWeek}>
                    ◀
                  </Button>
                  <Button variant="ghost" size="small" onClick={handleNextWeek}>
                    ▶
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className={styles.message}>불러오는 중...</p>
            ) : error ? (
              <p className={styles.errorMessage}>오류: {error}</p>
            ) : todos.length === 0 ? (
              <p className={styles.message}>등록된 할 일이 없습니다.</p>
            ) : viewMode === VIEW_MODE.MONTHLY ? (
              /* 월간 캘린더 뷰 */
              <div className={styles.calendar}>
                <div className={styles.calendarHeader}>
                  <Button variant="ghost" size="small" onClick={handlePrevMonth}>
                    ◀
                  </Button>
                  <span className={styles.calendarTitle}>
                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                  </span>
                  <Button variant="ghost" size="small" onClick={handleNextMonth}>
                    ▶
                  </Button>
                </div>
                <div className={styles.calendarGrid}>
                  {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <div key={day} className={styles.calendarDayHeader}>
                      {day}
                    </div>
                  ))}
                  {generateCalendarDays().map((day, index) => {
                    const dayTodos = getTodosForDate(day.date);
                    return (
                      <div
                        key={index}
                        className={`${styles.calendarDay} ${
                          day.isOtherMonth ? styles.otherMonth : ''
                        } ${isToday(day.date) ? styles.today : ''}`}
                        onClick={() => handleCalendarDayClick(day.date)}
                      >
                        <div className={styles.dayNumber}>{day.date.getDate()}</div>
                        <div className={styles.dayTodos}>
                          {dayTodos.slice(0, 3).map((todo) => (
                            <div
                              key={todo.id}
                              className={`${styles.dayTodoItem} ${
                                todo.status === TODO_STATUS.COMPLETE
                                  ? styles.complete
                                  : styles.incomplete
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectTodo(todo);
                              }}
                            >
                              {todo.title}
                            </div>
                          ))}
                          {dayTodos.length > 3 && (
                            <div className={styles.moreTodos}>
                              +{dayTodos.length - 3}개 더
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : viewMode === VIEW_MODE.WEEKLY ? (
              /* 주간 리스트 뷰 */
              <div className={styles.todoList}>
                {Object.entries(groupedTodos)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, dateTodos]) => (
                    <div key={date} className={styles.dateGroup}>
                      <div className={styles.dateGroupHeader}>
                        <span className={styles.dateGroupDot} />
                        {formatDate(date)}
                      </div>
                      {dateTodos.map((todo) => (
                        <div
                          key={todo.id}
                          className={`${styles.todoItem} ${
                            todo.status === TODO_STATUS.COMPLETE ? styles.complete : ''
                          } ${editingTodo?.id === todo.id ? styles.selected : ''}`}
                          onClick={() => !todo.isRecurring && handleSelectTodo(todo)}
                        >
                          <div
                            className={`${styles.checkbox} ${
                              todo.status === TODO_STATUS.COMPLETE
                                ? styles.checked
                                : styles.incomplete
                            }`}
                            onClick={(e) => handleToggleStatus(todo, e)}
                          />
                          <div className={styles.todoContent}>
                            <h3 className={styles.todoTitle}>
                              {todo.title}
                              {(todo.repeat_type && todo.repeat_type !== REPEAT_TYPE.NONE) && (
                                <span className={styles.repeatBadge}>
                                  🔄 {todo.repeat_type === REPEAT_TYPE.WEEKLY ? '매주' : '매달'}
                                </span>
                              )}
                            </h3>
                            {todo.content && (
                              <p className={styles.todoMeta}>{todo.content}</p>
                            )}
                          </div>
                          <div className={styles.todoActions}>
                            <Button
                              variant="ghost"
                              size="small"
                              onClick={(e) => handleDeleteClick(todo, e)}
                            >
                              삭제
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            ) : (
              /* 일간 리스트 뷰 */
              <div className={styles.todoList}>
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`${styles.todoItem} ${
                      todo.status === TODO_STATUS.COMPLETE ? styles.complete : ''
                    } ${editingTodo?.id === todo.id ? styles.selected : ''}`}
                    onClick={() => !todo.isRecurring && handleSelectTodo(todo)}
                  >
                    <div
                      className={`${styles.checkbox} ${
                        todo.status === TODO_STATUS.COMPLETE
                          ? styles.checked
                          : styles.incomplete
                      }`}
                      onClick={(e) => handleToggleStatus(todo, e)}
                    />
                    <div className={styles.todoContent}>
                      <h3 className={styles.todoTitle}>
                        {todo.title}
                        {(todo.repeat_type && todo.repeat_type !== REPEAT_TYPE.NONE) && (
                          <span className={styles.repeatBadge}>
                            🔄 {todo.repeat_type === REPEAT_TYPE.WEEKLY ? '매주' : '매달'}
                          </span>
                        )}
                      </h3>
                      <div className={styles.todoMeta}>
                        <span className={styles.todoDate}>
                          {formatDate(todo.due_date)}
                        </span>
                        {todo.content && <span>{todo.content}</span>}
                      </div>
                    </div>
                    <div className={styles.todoActions}>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={(e) => handleDeleteClick(todo, e)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 오른쪽: 등록/수정 폼 */}
        <Card className={styles.formSection}>
          <CardHeader>
            <h2 className={styles.sectionTitle}>
              {editingTodo ? '할 일 수정' : '새 할 일 등록'}
            </h2>
          </CardHeader>
          <CardContent>
            <div className={styles.form}>
              <div className={styles.formField}>
                <label className={styles.label}>
                  제목 <span className={styles.required}>*</span>
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="할 일 제목을 입력하세요"
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>내용</label>
                <Textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="상세 내용을 입력하세요 (선택)"
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.label}>
                    날짜 <span className={styles.required}>*</span>
                  </label>
                  <Input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.label}>상태</label>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    options={[
                      { value: TODO_STATUS.INCOMPLETE, label: '미완료' },
                      { value: TODO_STATUS.COMPLETE, label: '완료' },
                    ]}
                  />
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>반복</label>
                <Select
                  name="repeat_type"
                  value={formData.repeat_type}
                  onChange={handleInputChange}
                  options={[
                    { value: REPEAT_TYPE.NONE, label: '반복 없음' },
                    { value: REPEAT_TYPE.WEEKLY, label: '매주' },
                    { value: REPEAT_TYPE.MONTHLY, label: '매달' },
                  ]}
                />
                {formData.repeat_type === REPEAT_TYPE.WEEKLY && (
                  <div className={styles.repeatOptions}>
                    <Select
                      name="repeat_day"
                      value={formData.repeat_day || ''}
                      onChange={handleInputChange}
                      options={[
                        { value: '', label: '요일 선택' },
                        ...WEEKDAYS.map((day) => ({
                          value: day.value,
                          label: day.label,
                        })),
                      ]}
                    />
                  </div>
                )}
                {formData.repeat_type === REPEAT_TYPE.MONTHLY && (
                  <div className={styles.repeatOptions}>
                    <Select
                      name="repeat_day"
                      value={formData.repeat_day || ''}
                      onChange={handleInputChange}
                      options={[
                        { value: '', label: '일자 선택' },
                        ...Array.from({ length: 31 }, (_, i) => ({
                          value: i + 1,
                          label: `${i + 1}일`,
                        })),
                      ]}
                    />
                  </div>
                )}
              </div>

              {formError && <p className={styles.formError}>{formError}</p>}

              <div className={styles.formButtons}>
                {editingTodo && (
                  <Button variant="ghost" onClick={resetForm} disabled={saving}>
                    취소
                  </Button>
                )}
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? '저장 중...' : editingTodo ? '수정' : '저장'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 삭제 확인 모달 */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setParentRecurringTodo(null); }}>
        <ModalHeader>
          <h2>할 일 삭제</h2>
        </ModalHeader>
        <ModalContent>
          <div className={styles.deleteConfirm}>
            {deleteTarget?.isRecurring || (deleteTarget?.repeat_type && deleteTarget?.repeat_type !== REPEAT_TYPE.NONE) || parentRecurringTodo ? (
              // 반복 일정인 경우 (원본 또는 완료된 인스턴스)
              <>
                <p>"{deleteTarget?.title}" 반복 일정을 삭제하시겠습니까?</p>
                <div className={styles.deleteOptions}>
                  <button
                    className={`${styles.deleteOption} ${deleteMode === 'single' ? styles.selected : ''}`}
                    onClick={() => setDeleteMode('single')}
                  >
                    <strong>이 일정만 삭제</strong>
                    <span>{formatDate(deleteTarget?.due_date)} 일정만 삭제합니다.</span>
                  </button>
                  <button
                    className={`${styles.deleteOption} ${deleteMode === 'all' ? styles.selected : ''}`}
                    onClick={() => setDeleteMode('all')}
                  >
                    <strong>모든 반복 일정 삭제</strong>
                    <span>이 반복 일정 전체를 삭제합니다.</span>
                  </button>
                </div>
              </>
            ) : (
              // 일반 일정인 경우
              <p>
                "{deleteTarget?.title}" 할 일을 삭제하시겠습니까?
                <br />
                삭제된 할 일은 복구할 수 없습니다.
              </p>
            )}
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
            취소
          </Button>
          {deleteTarget?.isRecurring || (deleteTarget?.repeat_type && deleteTarget?.repeat_type !== REPEAT_TYPE.NONE) || parentRecurringTodo ? (
            <Button
              variant="primary"
              onClick={() => handleDeleteConfirm(deleteMode)}
              disabled={!deleteMode}
            >
              삭제
            </Button>
          ) : (
            <Button variant="primary" onClick={() => handleDeleteConfirm('all')}>
              삭제
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
};
