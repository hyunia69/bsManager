import { Button } from '@components';
import { Select } from '@linear/Select';
import { StatusBadge } from '@linear/Badge';
import styles from './ConsultationCard.module.css';

/**
 * ConsultationCard 컴포넌트 - 상담 정보를 카드 형식으로 표시
 * @param {object} consultation - 상담 데이터
 * @param {array} statusOptions - 상태 옵션 배열
 * @param {object} categoryLabels - 분류 레이블 매핑
 * @param {function} onStatusChange - 상태 변경 핸들러
 * @param {function} onOpenDetail - 상세보기 핸들러
 * @param {function} onCompanyHistory - 회사통합 이동 핸들러
 * @param {function} formatDateTime - 날짜 포맷 함수
 */
export const ConsultationCard = ({
  consultation,
  statusOptions,
  categoryLabels,
  onStatusChange,
  onOpenDetail,
  onCompanyHistory,
  formatDateTime,
}) => {
  const truncateContent = (text, maxLength = 80) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className={styles.card}>
      {/* 헤더: 회사명 + 상태 */}
      <div className={styles.header}>
        <h3 className={styles.companyName}>
          {consultation.clients?.company_name || '-'}
        </h3>
        <StatusBadge status={consultation.status} size="small" />
      </div>

      {/* 서브 정보: 담당자, 연락처 */}
      <div className={styles.subInfo}>
        <span className={styles.contactPerson}>
          {consultation.clients?.contact_person || '-'}
        </span>
        <span className={styles.separator}>•</span>
        <span className={styles.phone}>
          {consultation.clients?.phone || '-'}
        </span>
      </div>

      {/* 분류 배지 */}
      <div className={styles.categoryWrapper}>
        <span className={styles.categoryBadge}>
          {categoryLabels[consultation.category] || consultation.category}
        </span>
      </div>

      {/* 상담 내역 */}
      <div className={styles.content}>
        <button
          className={styles.contentLink}
          onClick={() => onOpenDetail(consultation)}
        >
          {truncateContent(consultation.content)}
        </button>
      </div>

      {/* 등록일시 */}
      <div className={styles.dateInfo}>
        <span className={styles.dateLabel}>등록일시</span>
        <span className={styles.dateValue}>
          {formatDateTime(consultation.created_at)}
        </span>
      </div>

      {/* 푸터: 상태 변경 + 관리 버튼 */}
      <div className={styles.footer}>
        <Select
          options={statusOptions}
          value={consultation.status}
          onChange={(e) => onStatusChange(consultation.id, e.target.value)}
          className={styles.statusSelect}
        />
        <Button
          variant="ghost"
          size="small"
          onClick={() => onCompanyHistory(consultation.client_id)}
        >
          전체
        </Button>
      </div>
    </div>
  );
};
