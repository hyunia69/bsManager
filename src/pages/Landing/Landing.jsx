import { Link } from 'react-router-dom';
import { Button, Card, CardHeader, CardContent } from '@components';
import { ThemeToggle } from '@linear/ThemeToggle';
import styles from './Landing.module.css';

/**
 * bsManager 랜딩 페이지
 * 모던 SaaS 스타일 디자인
 */
export const Landing = () => {
  return (
    <div className={styles.landing}>
      {/* Background Effects */}
      <div className={styles.backgroundEffects}>
        <div className={styles.gridPattern} />
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.gradientOrb3} />
      </div>

      {/* Header */}
      <header className={styles.header}>
        <nav className={styles.nav}>
          <span className={styles.logo}>
            <span className={styles.logoIcon}>B</span>
            bsManager
          </span>
          <div className={styles.navLinks}>
            <Link to="/clients" className={styles.navLink}>거래처관리</Link>
            <Link to="/consultation/new" className={styles.navLink}>상담기록</Link>
            <Link to="/consultations" className={styles.navLink}>상담목록</Link>
            <Link to="/todos" className={styles.navLink}>할일</Link>
          </div>
        </nav>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.badgeDot} />
          비즈니스 관계 관리 솔루션
        </div>
        <h1 className={styles.heroTitle}>
          <span className={styles.titleLine}>거래처 & 상담</span>
          <span className={styles.titleHighlight}>통합 관리 시스템</span>
        </h1>
        <p className={styles.heroSubtitle}>
          체계적인 거래처 관리와 상담 기록으로<br />
          비즈니스 관계를 한 단계 업그레이드하세요.
        </p>
        <div className={styles.heroButtons}>
          <Link to="/clients">
            <Button variant="primary" size="large" className={styles.ctaButton}>
              지금 시작하기
              <span className={styles.buttonArrow}>→</span>
            </Button>
          </Link>
          <Link to="/consultations">
            <Button variant="secondary" size="large" className={styles.secondaryButton}>
              상담 목록 보기
            </Button>
          </Link>
        </div>

      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>FEATURES</span>
          <h2 className={styles.sectionTitle}>핵심 기능</h2>
          <p className={styles.sectionSubtitle}>
            업무 효율을 높이는 강력한 기능들을 경험하세요
          </p>
        </div>

        <div className={styles.featureGrid}>
          <Link to="/clients" className={styles.featureLink}>
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrap}>
                <span className={styles.featureIcon}>📋</span>
              </div>
              <h3 className={styles.featureTitle}>거래처 관리</h3>
              <p className={styles.featureDescription}>
                거래처 정보를 체계적으로 저장하고 관리하세요.
                연락처, 담당자, 계약 정보를 한눈에 파악할 수 있습니다.
              </p>
              <span className={styles.featureArrow}>
                자세히 보기 →
              </span>
            </div>
          </Link>

          <Link to="/consultation/new" className={styles.featureLink}>
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrap}>
                <span className={styles.featureIcon}>💬</span>
              </div>
              <h3 className={styles.featureTitle}>상담 기록</h3>
              <p className={styles.featureDescription}>
                모든 상담 내용을 기록하고 추적하세요.
                히스토리 관리로 고객 관계를 강화할 수 있습니다.
              </p>
              <span className={styles.featureArrow}>
                자세히 보기 →
              </span>
            </div>
          </Link>

          <Link to="/consultations" className={styles.featureLink}>
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrap}>
                <span className={styles.featureIcon}>🔍</span>
              </div>
              <h3 className={styles.featureTitle}>상담 목록</h3>
              <p className={styles.featureDescription}>
                강력한 검색 기능으로 원하는 정보를 빠르게 찾으세요.
                다양한 필터로 정확한 데이터에 접근할 수 있습니다.
              </p>
              <span className={styles.featureArrow}>
                자세히 보기 →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>
              <span className={styles.logoIcon}>B</span>
              bsManager
            </span>
            <p className={styles.footerTagline}>
              효율적인 비즈니스 관계 관리
            </p>
          </div>
          <nav className={styles.footerLinks}>
            <div className={styles.footerLinkGroup}>
              <h4 className={styles.footerLinkTitle}>서비스</h4>
              <Link to="/clients" className={styles.footerLink}>거래처관리</Link>
              <Link to="/consultation/new" className={styles.footerLink}>상담기록</Link>
              <Link to="/consultations" className={styles.footerLink}>상담목록</Link>
              <Link to="/todos" className={styles.footerLink}>할일</Link>
            </div>
            <div className={styles.footerLinkGroup}>
              <h4 className={styles.footerLinkTitle}>지원</h4>
              <a href="#docs" className={styles.footerLink}>문서</a>
              <a href="#faq" className={styles.footerLink}>FAQ</a>
              <a href="#contact" className={styles.footerLink}>문의하기</a>
            </div>
          </nav>
        </div>
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © 2025 bsManager. All rights reserved.
          </p>
          <div className={styles.footerLegal}>
            <a href="#privacy" className={styles.legalLink}>개인정보처리방침</a>
            <a href="#terms" className={styles.legalLink}>이용약관</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
