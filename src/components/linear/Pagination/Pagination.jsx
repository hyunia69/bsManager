import styles from './Pagination.module.css';

/**
 * Pagination 컴포넌트
 * @param {number} currentPage - 현재 페이지 (1부터 시작)
 * @param {number} totalPages - 전체 페이지 수
 * @param {Function} onPageChange - 페이지 변경 핸들러
 * @param {number} pageRangeDisplayed - 표시할 페이지 버튼 수 (기본: 5)
 */
export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageRangeDisplayed = 5,
}) => {
  if (totalPages <= 1) return null;

  // 표시할 페이지 번호 계산
  const getPageNumbers = () => {
    const pages = [];
    const half = Math.floor(pageRangeDisplayed / 2);

    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, startPage + pageRangeDisplayed - 1);

    // endPage가 totalPages에 닿으면 startPage 조정
    if (endPage - startPage + 1 < pageRangeDisplayed) {
      startPage = Math.max(1, endPage - pageRangeDisplayed + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className={styles.pagination} aria-label="페이지네이션">
      {/* 처음으로 */}
      <button
        className={styles.pageButton}
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="처음 페이지"
      >
        «
      </button>

      {/* 이전 */}
      <button
        className={styles.pageButton}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
      >
        ‹
      </button>

      {/* 첫 페이지 + ... */}
      {pageNumbers[0] > 1 && (
        <>
          <button
            className={styles.pageButton}
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          {pageNumbers[0] > 2 && (
            <span className={styles.ellipsis}>...</span>
          )}
        </>
      )}

      {/* 페이지 번호 */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          className={`${styles.pageButton} ${
            page === currentPage ? styles.active : ''
          }`}
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {/* ... + 마지막 페이지 */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className={styles.ellipsis}>...</span>
          )}
          <button
            className={styles.pageButton}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* 다음 */}
      <button
        className={styles.pageButton}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
      >
        ›
      </button>

      {/* 끝으로 */}
      <button
        className={styles.pageButton}
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="마지막 페이지"
      >
        »
      </button>
    </nav>
  );
};
