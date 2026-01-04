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
} from '@services/consultationsService';
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // 상세보기 Modal 상태
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 뷰 타입 상태 (list | card)
  const [viewType, setViewType] = useState('list');

  const statusOptions = [
    { value: '', label: '전체' },
    { value: 'pending', label: '미진행' },
    { value: 'progress', label: '진행' },
    { value: 'completed', label: '완료' },
  ];

  const categoryLabels = {
    inquiry: '문의',
    claim: '클레임',
    request: '요청',
    repair: '수리',
  };

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
      setConsultations(data || []);
      setTotalCount(count || 0);
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
    </div>
  );
};
