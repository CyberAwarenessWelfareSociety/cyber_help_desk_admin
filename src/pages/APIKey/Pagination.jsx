// components/Pagination/Pagination.js
import styles from "./ApiKey.module.css";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange 
}) => {
  const pageNumbers = [];
  const maxVisiblePages = 3;

  // Calculate page numbers to display
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.pageInfo}>
        Showing {(currentPage - 1) * pageSize + 1}-
        {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
      </div>
      
      <div className={styles.pageControls}>
        <select 
          value={pageSize} 
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className={styles.pageSizeSelect}
        >
          {[5, 10, 20, 50].map(size => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>

        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={styles.pageButton}
        >
          «
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={styles.pageButton}
        >
          ‹
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={styles.pageButton}
            >
              1
            </button>
            {startPage > 2 && <span className={styles.ellipsis}>...</span>}
          </>
        )}

        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`${styles.pageButton} ${
              currentPage === number ? styles.active : ''
            }`}
          >
            {number}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className={styles.ellipsis}>...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className={styles.pageButton}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={styles.pageButton}
        >
          ›
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={styles.pageButton}
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Pagination;