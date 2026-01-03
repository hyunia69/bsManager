import { NavLink, Outlet } from 'react-router-dom';
import { ThemeToggle } from '@linear/ThemeToggle';
import styles from './MainLayout.module.css';

/**
 * MainLayout 컴포넌트
 * 상단 네비게이션과 메인 콘텐츠 영역을 포함하는 레이아웃
 */
export const MainLayout = () => {
  const navItems = [
    { to: '/clients', label: '거래처관리' },
    { to: '/consultation/new', label: '상담기록' },
    { to: '/consultations', label: '상담목록' },
    { to: '/todos', label: '할일' },
  ];

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <nav className={styles.nav} role="navigation" aria-label="Main navigation">
          <NavLink to="/" className={styles.logo}>
            bsManager
          </NavLink>

          <div className={styles.navItems}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [styles.navItem, isActive ? styles.active : ''].filter(Boolean).join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className={styles.navActions}>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};
