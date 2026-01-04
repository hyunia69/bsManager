import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Pagination,
  DateRangePicker,
  ViewToggle,
} from '@components';
import { Select } from '@linear/Select';
import { StatusBadge, STATUS_LABELS } from '@linear/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@linear/Table';
import {
  getConsultations,
  updateConsultationStatus,
  updateConsultation,
  deleteConsultation,
} from '@services/consultationsService';
import { Textarea } from '@linear/Textarea';
import { ConsultationCard } from './ConsultationCard';
import styles from './ConsultationsPage.module.css';

/**
 * ConsultationsPage - 상담내역리스트 페이지
 * 상담 목록을 조회하고 관리하는 페이지
 */
export const ConsultationsPage = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 검색/필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // 상세보기 Modal 상태
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 수정 Modal 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  // 뷰 타입 상태 (list | card)
  const [viewType, setViewType] = useState('list');

  const statusOptions = [
    { value: '', label: '전체' },
    { value: 'pending', label: '미진행' },
    { value: 'progress', label: '진행' },
    { value: 'completed', label: '완료' },
  ];

  const categoryLabels = {
    // 새 분류
    inquiry: '문의',
    proposal: '제안',
    order: '발주',
    delivery: '납품',
    as: 'AS',
    outsource_in: '외주입고',
    outsource_out: '외주발주',
    outsource_req: '외주요청',
    // 기존 분류 (호환성)
    claim: '클레임',
    request: '요청',
    repair: '수리',
  };

  const categoryFilterOptions = [
    { value: '', label: '전체 분류' },
    // 새 분류
    { value: 'inquiry', label: '문의' },
    { value: 'proposal', label: '제안' },
    { value: 'order', label: '발주' },
    { value: 'delivery', label: '납품' },
    { value: 'as', label: 'AS' },
    { value: 'outsource_in', label: '외주입고' },
    { value: 'outsource_out', label: '외주발주' },
    { value: 'outsource_req', label: '외주요청' },
    // 기존 분류 (호환성)
    { value: 'claim', label: '클레임' },
    { value: 'request', label: '요청' },
    { value: 'repair', label: '수리' },
  ];

  // 수정용 분류 옵션 (새 분류만)
  const categoryEditOptions = [
    { value: 'inquiry', label: '문의' },
    { value: 'proposal', label: '제안' },
    { value: 'order', label: '발주' },
    { value: 'delivery', label: '납품' },
    { value: 'as', label: 'AS' },
    { value: 'outsource_in', label: '외주입고' },
    { value: 'outsource_out', label: '외주발주' },
    { value: 'outsource_req', label: '외주요청' },
  ];

  // 상담 목록 조회
  const fetchConsultations = async (page = currentPage) => {
    setLoading(true);
    setError(null);

    const { data, count, error: fetchError } = await getConsultations({
      search: searchTerm,
      status: statusFilter,
      startDate: startDate ? `${startDate}T00:00:00` : '',
      endDate: endDate ? `${endDate}T23:59:59` : '',
      page,
      pageSize,
    });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      // 분류 필터 클라이언트 사이드 적용
      let filtered = data || [];
      let filteredCount = count || 0;
      if (categoryFilter) {
        filtered = filtered.filter((c) => c.category === categoryFilter);
        filteredCount = filtered.length;
      }
      setConsultations(filtered);
      setTotalCount(filteredCount);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConsultations(currentPage);
  }, [currentPage]);

  // 검색 실행
  const handleSearch = () => {
    setCurrentPage(1); // 검색 시 첫 페이지로
    fetchConsultations(1);
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 총 페이지 수
  const totalPages = Math.ceil(totalCount / pageSize);

  // 엔터 키로 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 진행상태 변경
  const handleStatusChange = async (id, newStatus) => {
    const { error: updateError } = await updateConsultationStatus(id, newStatus);
    if (updateError) {
      alert('상태 변경 중 오류가 발생했습니다: ' + updateError.message);
    } else {
      // 목록 새로고침
      fetchConsultations();
    }
  };

  // 회사통합내역 페이지로 이동
  const handleCompanyHistory = (clientId) => {
    navigate(`/clients/${clientId}/history`);
  };

  // 상담 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('정말 이 상담을 삭제하시겠습니까?')) {
      return;
    }

    const { error: deleteError } = await deleteConsultation(id);
    if (deleteError) {
      alert('삭제 중 오류가 발생했습니다: ' + deleteError.message);
    } else {
      // 목록 새로고침
      fetchConsultations();
    }
  };

  // 수정 Modal 열기
  const handleEdit = (consultation) => {
    setEditingConsultation(consultation);
    setEditCategory(consultation.category);
    setEditContent(consultation.content);
    setIsEditModalOpen(true);
  };

  // 수정 Modal 닫기
  const handleCloseEdit = () => {
    setEditingConsultation(null);
    setEditCategory('');
    setEditContent('');
    setIsEditModalOpen(false);
  };

  // 수정 저장
  const handleEditSave = async () => {
    if (!editCategory) {
      alert('분류를 선택해주세요.');
      return;
    }
    if (!editContent.trim()) {
      alert('상담내역을 입력해주세요.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await updateConsultation(editingConsultation.id, {
      category: editCategory,
      content: editContent.trim(),
    });
    setSaving(false);

    if (updateError) {
      alert('수정 중 오류가 발생했습니다: ' + updateError.message);
    } else {
      handleCloseEdit();
      fetchConsultations();
    }
  };

  // 내용 요약
  const truncateContent = (text, maxLength = 30) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // 상세보기 Modal 열기
  const handleOpenDetail = (consultation) => {
    setSelectedConsultation(consultation);
    setIsModalOpen(true);
  };

  // 상세보기 Modal 닫기
  const handleCloseDetail = () => {
    setSelectedConsultation(null);
    setIsModalOpen(false);
  };

  // 날짜 포맷
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>상담 목록</h1>
        <ViewToggle value={viewType} onChange={setViewType} />
      </header>

      <Card className={styles.searchCard}>
        <CardContent>
          <div className={styles.searchRow}>
            <Input
              placeholder="회사명 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className={styles.searchInput}
            />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="진행상태"
              className={styles.statusFilter}
            />
            <Select
              options={categoryFilterOptions}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="분류"
              className={styles.categoryFilter}
            />
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={(e) => setStartDate(e.target.value)}
              onEndDateChange={(e) => setEndDate(e.target.value)}
              className={styles.dateFilter}
            />
            <Button variant="secondary" onClick={handleSearch} className={styles.searchButton}>
              검색
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className={styles.sectionTitle}>상담내역 목록</h2>
        </CardHeader>
        <CardContent className={styles.tableContent}>
          {loading ? (
            <p className={styles.message}>불러오는 중...</p>
          ) : error ? (
            <p className={styles.errorMessage}>오류: {error}</p>
          ) : consultations.length === 0 ? (
            <p className={styles.message}>등록된 상담내역이 없습니다.</p>
          ) : viewType === 'list' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell header>회사명</TableCell>
                  <TableCell header>담당자</TableCell>
                  <TableCell header>연락처</TableCell>
                  <TableCell header>분류</TableCell>
                  <TableCell header>상담내역</TableCell>
                  <TableCell header>등록일시</TableCell>
                  <TableCell header align="center">상태</TableCell>
                  <TableCell header align="center">관리</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.map((consultation) => (
                  <TableRow key={consultation.id}>
                    <TableCell>
                      {consultation.clients?.company_name || '-'}
                    </TableCell>
                    <TableCell>
                      {consultation.clients?.contact_person || '-'}
                    </TableCell>
                    <TableCell>
                      {consultation.clients?.phone || '-'}
                    </TableCell>
                    <TableCell>
                      {categoryLabels[consultation.category] || consultation.category}
                    </TableCell>
                    <TableCell>
                      <button
                        className={styles.contentLink}
                        onClick={() => handleOpenDetail(consultation)}
                      >
                        {truncateContent(consultation.content)}
                      </button>
                    </TableCell>
                    <TableCell>
                      {formatDateTime(consultation.created_at)}
                    </TableCell>
                    <TableCell align="center">
                      <Select
                        options={statusOptions.filter((opt) => opt.value !== '')}
                        value={consultation.status}
                        onChange={(e) =>
                          handleStatusChange(consultation.id, e.target.value)
                        }
                        className={styles.statusSelect}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <div className={styles.actionButtons}>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleCompanyHistory(consultation.client_id)}
                        >
                          전체
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleEdit(consultation)}
                        >
                          수정
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleDelete(consultation.id)}
                          className={styles.deleteButton}
                        >
                          삭제
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className={styles.cardGrid}>
              {consultations.map((consultation) => (
                <ConsultationCard
                  key={consultation.id}
                  consultation={consultation}
                  statusOptions={statusOptions.filter((opt) => opt.value !== '')}
                  categoryLabels={categoryLabels}
                  onStatusChange={handleStatusChange}
                  onOpenDetail={handleOpenDetail}
                  onCompanyHistory={handleCompanyHistory}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  formatDateTime={formatDateTime}
                />
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {!loading && !error && totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
              <p className={styles.pageInfo}>
                총 {totalCount}건 중 {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, totalCount)}건
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상담 상세보기 Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseDetail}
        ariaLabel="상담 상세보기"
      >
        <ModalHeader onClose={handleCloseDetail}>
          <h2 className={styles.modalTitle}>상담 상세보기</h2>
        </ModalHeader>
        <ModalContent>
          {selectedConsultation && (
            <div className={styles.detailContent}>
              {/* 업체 정보 */}
              <section className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>업체 정보</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>회사명</span>
                    <span className={styles.detailValue}>
                      {selectedConsultation.clients?.company_name || '-'}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>담당자</span>
                    <span className={styles.detailValue}>
                      {selectedConsultation.clients?.contact_person || '-'}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>연락처</span>
                    <span className={styles.detailValue}>
                      {selectedConsultation.clients?.phone || '-'}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>이메일</span>
                    <span className={styles.detailValue}>
                      {selectedConsultation.clients?.email || '-'}
                    </span>
                  </div>
                </div>
              </section>

              {/* 상담 정보 */}
              <section className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>상담 정보</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>분류</span>
                    <span className={styles.detailValue}>
                      {categoryLabels[selectedConsultation.category] ||
                        selectedConsultation.category}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>진행상태</span>
                    <span className={styles.detailValue}>
                      <StatusBadge status={selectedConsultation.status} />
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>등록일시</span>
                    <span className={styles.detailValue}>
                      {formatDateTime(selectedConsultation.created_at)}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>수정일시</span>
                    <span className={styles.detailValue}>
                      {formatDateTime(selectedConsultation.updated_at)}
                    </span>
                  </div>
                </div>
              </section>

              {/* 상담 내역 */}
              <section className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>상담 내역</h3>
                <div className={styles.contentBox}>
                  {selectedConsultation.content || '내용 없음'}
                </div>
              </section>
            </div>
          )}
        </ModalContent>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() =>
              handleCompanyHistory(selectedConsultation?.client_id)
            }
          >
            전체내역 보기
          </Button>
          <Button variant="secondary" onClick={handleCloseDetail}>
            닫기
          </Button>
        </ModalFooter>
      </Modal>

      {/* 상담 수정 Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        ariaLabel="상담 수정"
      >
        <ModalHeader onClose={handleCloseEdit}>
          <h2 className={styles.modalTitle}>상담 수정</h2>
        </ModalHeader>
        <ModalContent>
          {editingConsultation && (
            <div className={styles.editContent}>
              {/* 업체 정보 (읽기 전용) */}
              <div className={styles.editClientInfo}>
                <span className={styles.editClientLabel}>업체:</span>
                <span className={styles.editClientValue}>
                  {editingConsultation.clients?.company_name || '-'}
                </span>
              </div>

              {/* 분류 선택 */}
              <div className={styles.editField}>
                <label className={styles.editLabel}>분류</label>
                <Select
                  options={categoryEditOptions}
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="분류 선택"
                />
              </div>

              {/* 상담내역 입력 */}
              <div className={styles.editField}>
                <label className={styles.editLabel}>상담내역</label>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="상담 내용을 입력하세요"
                  rows={6}
                />
              </div>
            </div>
          )}
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={handleCloseEdit}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleEditSave}
            disabled={saving}
          >
            {saving ? '저장 중...' : '저장'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
