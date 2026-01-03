import { useState } from 'react';
import styles from './Navigation.module.css';
import { ThemeToggle } from '../ThemeToggle';

/**
 * NavItem 컴포넌트
 * @param {string} id - 아이템 고유 ID
 * @param {string} label - 표시될 레이블
 * @param {string} href - 링크 URL
 * @param {boolean} isActive - 활성 상태
 * @param {Function} onClick - 클릭 핸들러
 */
export const NavItem = ({ id, label, href = '#', isActive, onClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    onClick?.(id);
  };

  return (
    <a
      href={href}
      className={`${styles.navItem} ${isActive ? styles.active : ''}`}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </a>
  );
};

/**
 * Navigation 컴포넌트
 * @param {Array} items - 네비게이션 아이템 배열
 * @param {string} activeItem - 활성 아이템 ID
 * @param {Function} onItemClick - 아이템 클릭 핸들러
 */
export const Navigation = ({ items = [], activeItem, onItemClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleItemClick = (id) => {
    onItemClick?.(id);
    setIsMobileMenuOpen(false); // 모바일에서 아이템 클릭 시 메뉴 닫기
  };

  return (
    <nav className={styles.nav} role="navigation" aria-label="Main navigation">
      <button
        className={styles.mobileMenuButton}
        onClick={toggleMobileMenu}
        aria-expanded={isMobileMenuOpen}
        aria-label="Toggle navigation menu"
      >
        <span className={styles.hamburger}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      <div
        className={`${styles.navItems} ${isMobileMenuOpen ? styles.open : ''}`}
      >
        {items.map((item) => (
          <NavItem
            key={item.id}
            {...item}
            isActive={item.id === activeItem}
            onClick={handleItemClick}
          />
        ))}
      </div>

      <div className={styles.navActions}>
        <ThemeToggle />
      </div>
    </nav>
  );
};
