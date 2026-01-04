import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Button, Input } from '@components';
import { Select } from '@linear/Select';
import { Textarea } from '@linear/Textarea';
import { StatusBadge } from '@linear/Badge';
import { searchClientsByName, createClient } from '@services/clientsService';
import {
  getConsultationsByClientId,
  createConsultation,
} from '@services/consultationsService';
import {
  createTodo,
  updateTodoStatus,
  deleteTodo,
  TODO_STATUS,
  REPEAT_TYPE,
} from '@services/todosService';
import styles from './ConsultationNewPage.module.css';

/**
 * ConsultationNewPage - 상담내역기록 페이지
 * 새 상담을 기록하는 페이지
 */
export const ConsultationNewPage = () => {
  // 업체 검색/선택 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);

  // 상담 내역 상태
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 폼 상태
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 할일 상태
  const [todos, setTodos] = useState([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoContent, setNewTodoContent] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [addingTodo, setAddingTodo] = useState(false);

  const categoryOptions = [
    { value: 'inquiry', label: '문의' },
    { value: 'proposal', label: '제안' },
    { value: 'order', label: '발주' },
    { value: 'delivery', label: '납품' },
    { value: 'as', label: 'AS' },
    { value: 'outsource_in', label: '외주입고' },
    { value: 'outsource_out', label: '외주발주' },
    { value: 'outsource_req', label: '외주요청' },
  ];

  // 기존 분류 호환성용 레이블 매핑
  const legacyCategoryLabels = {
    claim: '클레임',
    request: '요청',
    repair: '수리',
  };

  const getCategoryLabel = (value) => {
    const option = categoryOptions.find((opt) => opt.value === value);
    if (option) return option.label;
    return legacyCategoryLabels[value] || value;
  };

  // 업체 검색
  useEffect(() => {
    const searchClients = async () => {
      if (searchTerm.length < 1) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setSearching(true);
      const { data, error } = await searchClientsByName(searchTerm);
      setSearching(false);

      if (!error && data) {
        setSearchResults(data);
        setShowDropdown(true);
      }
    };

    const debounce = setTimeout(searchClients, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  // 선택된 업체의 상담 내역 로드
  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedClient) {
        setHistory([]);
        return;
      }

      setLoadingHistory(true);
      const { data, error } = await getConsultationsByClientId(selectedClient.id);
      setLoadingHistory(false);

      if (!error && data) {
        setHistory(data);
      }
    };

    loadHistory();
  }, [selectedClient]);

  // 업체 선택
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setSearchTerm(client.company_name);
    setShowDropdown(false);
  };

  // 새 업체 등록 및 선택
  const handleCreateNewClient = async () => {
    if (!searchTerm.trim()) return;

    const newClient = {
      company_name: searchTerm.trim(),
      contact_person: '-',
      phone: '-',
    };

    const { data, error } = await createClient(newClient);
    if (!error && data) {
      setSelectedClient(data);
      setShowDropdown(false);
      setMessage({ type: 'success', text: `"${data.company_name}" 업체가 등록되었습니다.` });
    } else {
      setMessage({ type: 'error', text: '업체 등록 중 오류가 발생했습니다.' });
    }
  };

  // 상담 저장
  const handleSave = async () => {
    // 유효성 검사
    if (!selectedClient) {
      setMessage({ type: 'error', text: '업체를 선택해주세요.' });
      return;
    }
    if (!category) {
      setMessage({ type: 'error', text: '분류를 선택해주세요.' });
      return;
    }
    if (!content.trim()) {
      setMessage({ type: 'error', text: '상담내역을 입력해주세요.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    const consultation = {
      client_id: selectedClient.id,
      category,
      content: content.trim(),
      status: 'pending',
    };

    const { data, error } = await createConsultation(consultation);
    setSaving(false);

    if (error) {
      setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다: ' + error.message });
    } else {
      setMessage({ type: 'success', text: '상담이 등록되었습니다.' });
      // 폼 초기화
      setCategory('');
      setContent('');
      // 히스토리 새로고침
      const { data: newHistory } = await getConsultationsByClientId(selectedClient.id);
      if (newHistory) setHistory(newHistory);
    }
  };

  // 날짜 포맷
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR');
  };

  // 로컬 날짜를 YYYY-MM-DD 문자열로 변환
  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 할일 추가
  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) return;

    setAddingTodo(true);
    const dueDate = newTodoDueDate || getLocalDateString();

    const todoData = {
      title: newTodoTitle.trim(),
      content: newTodoContent.trim(),
      due_date: dueDate,
      status: TODO_STATUS.INCOMPLETE,
      repeat_type: REPEAT_TYPE.NONE,
    };

    const { data, error } = await createTodo(todoData);
    setAddingTodo(false);

    if (!error && data) {
      setTodos([...todos, data]);
      setNewTodoTitle('');
      setNewTodoContent('');
      setNewTodoDueDate('');
    }
  };

  // 할일 완료/미완료 토글
  const handleToggleTodo = async (todoId, currentStatus) => {
    const newStatus = currentStatus === TODO_STATUS.COMPLETE
      ? TODO_STATUS.INCOMPLETE
      : TODO_STATUS.COMPLETE;

    const { data, error } = await updateTodoStatus(todoId, newStatus);

    if (!error) {
      setTodos(todos.map(todo =>
        todo.id === todoId ? { ...todo, status: newStatus } : todo
      ));
    }
  };

  // 할일 삭제
  const handleDeleteTodo = async (todoId) => {
    const { error } = await deleteTodo(todoId);

    if (!error) {
      setTodos(todos.filter(todo => todo.id !== todoId));
    }
  };

  // 날짜 표시 포맷 (YYYY-MM-DD → MM/DD)
  const formatDueDate = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    return `${parts[1]}/${parts[2]}`;
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>상담 기록</h1>
      </header>

      {/* 업체 검색 */}
      <div className={styles.clientSearch}>
        <div className={styles.searchWrapper}>
          <Input
            placeholder="업체 검색 (회사명 입력)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (selectedClient && e.target.value !== selectedClient.company_name) {
                setSelectedClient(null);
              }
            }}
            onFocus={() => searchTerm.length >= 1 && setShowDropdown(true)}
          />
          {searching && <span className={styles.searchingIndicator}>검색 중...</span>}

          {/* 자동완성 드롭다운 */}
          {showDropdown && (
            <div className={styles.dropdown}>
              {searchResults.length > 0 ? (
                searchResults.map((client) => (
                  <div
                    key={client.id}
                    className={styles.dropdownItem}
                    onClick={() => handleSelectClient(client)}
                  >
                    <span className={styles.companyName}>{client.company_name}</span>
                    <span className={styles.contactPerson}>{client.contact_person}</span>
                  </div>
                ))
              ) : (
                <div className={styles.dropdownEmpty}>
                  <p>검색 결과가 없습니다.</p>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={handleCreateNewClient}
                  >
                    "{searchTerm}" 새 업체로 등록
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedClient && (
          <div className={styles.selectedClient}>
            <span>선택된 업체: <strong>{selectedClient.company_name}</strong></span>
            <span className={styles.clientInfo}>
              {selectedClient.contact_person} | {selectedClient.phone}
            </span>
          </div>
        )}
      </div>

      {/* 메시지 표시 */}
      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.layout}>
        {/* 기존 상담내역 */}
        <Card className={styles.historySection}>
          <CardHeader>
            <h2 className={styles.sectionTitle}>기존 상담내역</h2>
          </CardHeader>
          <CardContent>
            {!selectedClient ? (
              <p className={styles.emptyMessage}>
                업체를 선택하면 기존 상담내역이 표시됩니다.
              </p>
            ) : loadingHistory ? (
              <p className={styles.emptyMessage}>불러오는 중...</p>
            ) : history.length === 0 ? (
              <p className={styles.emptyMessage}>등록된 상담내역이 없습니다.</p>
            ) : (
              <div className={styles.historyList}>
                {history.map((item) => (
                  <div key={item.id} className={styles.historyItem}>
                    <div className={styles.historyHeader}>
                      <span className={styles.historyDate}>
                        {formatDateTime(item.created_at)}
                      </span>
                      <StatusBadge status={item.status} size="small" />
                    </div>
                    <div className={styles.historyCategory}>
                      [{getCategoryLabel(item.category)}]
                    </div>
                    <p className={styles.historyContent}>{item.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 새 상담 입력 폼 */}
        <Card className={styles.formSection}>
          <CardHeader>
            <h2 className={styles.sectionTitle}>새 상담 입력</h2>
          </CardHeader>
          <CardContent>
            <div className={styles.form}>
              <div className={styles.formField}>
                <label className={styles.label}>분류</label>
                <Select
                  options={categoryOptions}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="분류 선택"
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>상담내역</label>
                <Textarea
                  placeholder="상담 내용을 입력하세요"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>날짜</label>
                <Input
                  value={new Date().toLocaleString('ko-KR')}
                  disabled
                  className={styles.dateInput}
                />
              </div>

              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving || !selectedClient}
                className={styles.saveButton}
              >
                {saving ? '저장 중...' : '저장'}
              </Button>
            </div>

            {/* 할일 섹션 */}
            <div className={styles.todoSection}>
              <h3 className={styles.todoSectionTitle}>할일</h3>

              {/* 할일 입력 */}
              <div className={styles.todoInputGroup}>
                <div className={styles.todoInputRow}>
                  <Input
                    placeholder="할일 제목"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    className={styles.todoInput}
                  />
                  <input
                    type="date"
                    value={newTodoDueDate}
                    onChange={(e) => setNewTodoDueDate(e.target.value)}
                    className={styles.todoDateInput}
                  />
                </div>
                <div className={styles.todoContentRow}>
                  <Textarea
                    placeholder="할일 내용 (선택)"
                    value={newTodoContent}
                    onChange={(e) => setNewTodoContent(e.target.value)}
                    rows={2}
                    className={styles.todoContentInput}
                  />
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleAddTodo}
                    disabled={addingTodo || !newTodoTitle.trim()}
                    className={styles.todoAddBtn}
                  >
                    {addingTodo ? '...' : '추가'}
                  </Button>
                </div>
              </div>

              {/* 할일 목록 */}
              {todos.length > 0 && (
                <ul className={styles.todoList}>
                  {todos.map((todo) => (
                    <li key={todo.id} className={styles.todoItem}>
                      <div className={styles.todoMainRow}>
                        <label className={styles.todoCheckbox}>
                          <input
                            type="checkbox"
                            checked={todo.status === TODO_STATUS.COMPLETE}
                            onChange={() => handleToggleTodo(todo.id, todo.status)}
                          />
                          <span className={`${styles.todoTitle} ${todo.status === TODO_STATUS.COMPLETE ? styles.completed : ''}`}>
                            {todo.title}
                          </span>
                        </label>
                        <div className={styles.todoMeta}>
                          {todo.due_date && (
                            <span className={styles.todoDueDate}>
                              {formatDueDate(todo.due_date)}
                            </span>
                          )}
                          <button
                            className={styles.todoDeleteBtn}
                            onClick={() => handleDeleteTodo(todo.id)}
                            title="삭제"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      {todo.content && (
                        <p className={`${styles.todoContent} ${todo.status === TODO_STATUS.COMPLETE ? styles.completed : ''}`}>
                          {todo.content}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
