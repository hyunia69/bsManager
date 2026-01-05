import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@linear/ThemeToggle';
import { Button } from '@components';
import { useAuth } from '@hooks/useAuth';
import styles from './MainLayout.module.css';

/**
 * MainLayout 컴포넌트
 * 상단 네비게이션과 메인 콘텐츠 영역을 포함하는 레이아웃
 */
export const MainLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/clients', label: '거래처관리' },
    { to: '/consultation/new', label: '상담기록' },
    { to: '/consultations', label: '상담목록' },
    { to: '/todos', label: '할일' },
  ];

  /**
   * 로그아웃 핸들러
   */
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
            {user && (
              <span className={styles.userEmail}>{user.email}</span>
            )}
            <ThemeToggle />
            <Button variant="ghost" size="small" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};
