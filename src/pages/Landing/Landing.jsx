import { Link } from 'react-router-dom';
import { Button, Card, CardHeader, CardContent } from '@components';
import { ThemeToggle } from '@linear/ThemeToggle';
import styles from './Landing.module.css';

/**
 * bsManager 랜딩 페이지
 * 앱 소개 및 주요 기능 안내
 */
export const Landing = () => {
  return (
    <div className={styles.landing}>
      {/* Header */}
      <header className={styles.header}>
        <nav className={styles.nav}>
          <span className={styles.logo}>bsManager</span>
          <div className={styles.navLinks}>
            <Link to="/clients" className={styles.navLink}>거래처관리</Link>
            <Link to="/consultation/new" className={styles.navLink}>상담기록</Link>
            <Link to="/consultations" className={styles.navLink}>상담목록</Link>
          </div>
        </nav>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>거래처 & 상담 관리 시스템</h1>
        <p className={styles.heroSubtitle}>
          효율적인 비즈니스 관계 관리를 위한 통합 솔루션
        </p>
        <Link to="/clients">
          <Button variant="primary" size="large">
            시작하기
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>주요 기능</h2>
        <div className={styles.featureGrid}>
          <Link to="/clients" className={styles.featureLink}>
            <Card className={styles.featureCard}>
              <CardHeader>
                <span className={styles.featureIcon}>📋</span>
                <h3 className={styles.featureTitle}>거래처 관리</h3>
              </CardHeader>
              <CardContent>
                <p className={styles.featureDescription}>
                  거래처 정보를 체계적으로 저장하고 관리하세요.
                  연락처, 담당자, 계약 정보를 한눈에 파악할 수 있습니다.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/consultation/new" className={styles.featureLink}>
            <Card className={styles.featureCard}>
              <CardHeader>
                <span className={styles.featureIcon}>💬</span>
                <h3 className={styles.featureTitle}>상담 기록</h3>
              </CardHeader>
              <CardContent>
                <p className={styles.featureDescription}>
                  모든 상담 내용을 기록하고 추적하세요.
                  히스토리 관리로 고객 관계를 강화할 수 있습니다.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/consultations" className={styles.featureLink}>
            <Card className={styles.featureCard}>
              <CardHeader>
                <span className={styles.featureIcon}>🔍</span>
                <h3 className={styles.featureTitle}>상담 목록</h3>
              </CardHeader>
              <CardContent>
                <p className={styles.featureDescription}>
                  강력한 검색 기능으로 원하는 정보를 빠르게 찾으세요.
                  다양한 필터로 정확한 데이터에 접근할 수 있습니다.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.copyright}>
          &copy; 2025 bsManager. All rights reserved.
        </p>
        <nav className={styles.footerNav}>
          <a href="#privacy" className={styles.footerLink}>개인정보처리방침</a>
          <a href="#terms" className={styles.footerLink}>이용약관</a>
          <a href="#contact" className={styles.footerLink}>문의하기</a>
        </nav>
      </footer>
    </div>
  );
};
