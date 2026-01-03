import { useState, useEffect } from 'react';
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
} from '@components';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@linear/Table';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from '@services/clientsService';
import styles from './ClientsPage.module.css';

/**
 * ClientsPage - 거래처 관리 페이지
 * 거래처를 등록, 수정, 검색하는 페이지
 */
export const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Modal 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // 거래처 목록 조회
  const fetchClients = async (search = '', page = currentPage) => {
    setLoading(true);
    setError(null);
    const { data, count, error: fetchError } = await getClients({
      search,
      page,
      pageSize,
    });
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setClients(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients(searchTerm, currentPage);
  }, [currentPage]);

  // 검색 실행
  const handleSearch = () => {
    setCurrentPage(1);
    fetchClients(searchTerm, 1);
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

  // 모달 열기 (등록)
  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({
      company_name: '',
      contact_person: '',
      phone: '',
      email: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // 모달 열기 (수정)
  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      company_name: client.company_name,
      contact_person: client.contact_person,
      phone: client.phone,
      email: client.email || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormError('');
  };

  // 폼 입력 변경
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 폼 유효성 검사
  const validateForm = () => {
    if (!formData.company_name.trim()) {
      setFormError('회사명을 입력해주세요.');
      return false;
    }
    if (!formData.contact_person.trim()) {
      setFormError('담당자를 입력해주세요.');
      return false;
    }
    if (!formData.phone.trim()) {
      setFormError('연락처를 입력해주세요.');
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
      if (editingClient) {
        // 수정
        const { error: updateError } = await updateClient(editingClient.id, formData);
        if (updateError) throw updateError;
      } else {
        // 등록
        const { error: createError } = await createClient(formData);
        if (createError) throw createError;
      }
      closeModal();
      fetchClients(searchTerm);
    } catch (err) {
      setFormError(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 삭제
  const handleDelete = async (client) => {
    if (!window.confirm(`"${client.company_name}" 거래처를 삭제하시겠습니까?`)) {
      return;
    }

    const { error: deleteError } = await deleteClient(client.id);
    if (deleteError) {
      alert('삭제 중 오류가 발생했습니다: ' + deleteError.message);
    } else {
      fetchClients(searchTerm);
    }
  };

  // 날짜 포맷
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>거래처 관리</h1>
        <Button variant="primary" onClick={openCreateModal}>
          업체 등록
        </Button>
      </header>

      <Card className={styles.searchCard}>
        <CardContent>
          <div className={styles.searchRow}>
            <Input
              placeholder="회사명 또는 담당자로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className={styles.searchInput}
            />
            <Button variant="secondary" onClick={handleSearch}>
              검색
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className={styles.sectionTitle}>거래처 목록</h2>
        </CardHeader>
        <CardContent className={styles.tableContent}>
          {loading ? (
            <p className={styles.message}>불러오는 중...</p>
          ) : error ? (
            <p className={styles.errorMessage}>오류: {error}</p>
          ) : clients.length === 0 ? (
            <p className={styles.message}>등록된 거래처가 없습니다.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell header>회사명</TableCell>
                  <TableCell header>담당자</TableCell>
                  <TableCell header>연락처</TableCell>
                  <TableCell header>이메일</TableCell>
                  <TableCell header>등록일</TableCell>
                  <TableCell header align="center">
                    관리
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.company_name}</TableCell>
                    <TableCell>{client.contact_person}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.email || '-'}</TableCell>
                    <TableCell>{formatDate(client.created_at)}</TableCell>
                    <TableCell align="center">
                      <div className={styles.actionButtons}>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => openEditModal(client)}
                        >
                          수정
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleDelete(client)}
                        >
                          삭제
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

      {/* 등록/수정 모달 */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalHeader>
          <h2>{editingClient ? '거래처 수정' : '거래처 등록'}</h2>
        </ModalHeader>
        <ModalContent>
          <div className={styles.form}>
            <div className={styles.formField}>
              <label className={styles.label}>
                회사명 <span className={styles.required}>*</span>
              </label>
              <Input
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="회사명을 입력하세요"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>
                담당자 <span className={styles.required}>*</span>
              </label>
              <Input
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
                placeholder="담당자를 입력하세요"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>
                연락처 <span className={styles.required}>*</span>
              </label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="010-0000-0000"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>이메일</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
              />
            </div>
            {formError && <p className={styles.formError}>{formError}</p>}
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={closeModal} disabled={saving}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
