import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@components';
import { StatusBadge } from '@linear/Badge';
import { getClientById } from '@services/clientsService';
import { getConsultationTimeline } from '@services/consultationsService';
import styles from './CompanyHistoryPage.module.css';

/**
 * CompanyHistoryPage - 회사통합내역 페이지
 * 특정 회사의 모든 상담내역을 날짜별로 정리하여 표시
 */
export const CompanyHistoryPage = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryLabels = {
    inquiry: '문의',
    claim: '클레임',
    request: '요청',
    repair: '수리',
  };

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 거래처 정보 조회
        const { data: clientData, error: clientError } = await getClientById(id);
        if (clientError) throw clientError;
        setClient(clientData);

        // 상담 타임라인 조회
        const { data: timelineData, error: timelineError } = await getConsultationTimeline(id);
        if (timelineError) throw timelineError;
        setTimeline(timelineData || []);
      } catch (err) {
        setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loadingMessage}>불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Link to="/consultations" className={styles.backLink}>
              ← 목록으로
            </Link>
          </div>
        </header>
        <p className={styles.errorMessage}>오류: {error}</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Link to="/consultations" className={styles.backLink}>
              ← 목록으로
            </Link>
          </div>
        </header>
        <p className={styles.errorMessage}>거래처를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/consultations" className={styles.backLink}>
            ← 목록으로
          </Link>
          <h1 className={styles.title}>전체내역</h1>
        </div>
      </header>

      <Card className={styles.companyCard}>
        <CardContent>
          <div className={styles.companyInfo}>
            <h2 className={styles.companyName}>{client.company_name}</h2>
            <div className={styles.companyDetails}>
              <span>담당자: {client.contact_person}</span>
              <span className={styles.separator}>|</span>
              <span>연락처: {client.phone}</span>
              {client.email && (
                <>
                  <span className={styles.separator}>|</span>
                  <span>{client.email}</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className={styles.sectionTitle}>상담 히스토리</h2>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className={styles.emptyMessage}>등록된 상담내역이 없습니다.</p>
          ) : (
            <div className={styles.timeline}>
              {timeline.map((dateGroup) => (
                <div key={dateGroup.date} className={styles.dateGroup}>
                  <div className={styles.dateHeader}>
                    <span className={styles.dateBullet}>●</span>
                    <span className={styles.dateText}>{dateGroup.date}</span>
                  </div>
                  <div className={styles.dateItems}>
                    {dateGroup.items.map((item) => (
                      <div key={item.id} className={styles.historyItem}>
                        <div className={styles.itemHeader}>
                          <span className={styles.itemCategory}>
                            [{categoryLabels[item.category] || item.category}]
                          </span>
                          <StatusBadge status={item.status} size="small" />
                        </div>
                        <p className={styles.itemContent}>{item.content}</p>
                        <span className={styles.itemTime}>{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
