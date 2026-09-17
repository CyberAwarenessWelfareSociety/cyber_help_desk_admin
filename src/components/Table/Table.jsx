import { useState } from "react";
import styles from "./Table.module.css";

const Table = ({
  title,
  leftSlot,
  rightSlot,
  showSearch = false,
  onSearch,
  filterTitle = "",
  filterContent = null,
  children,
}) => {
  return (
   <div className={styles.tableWrapper}>
  {title && <div className={styles.header}>{title}</div>}

  <div className={styles.toolbar}>
    {/* <div className={styles.left}>{leftSlot}</div> */}
    {filterContent && (
      <div className={styles.filterInline}>{filterContent}</div>
    )}
    <div className={styles.right}>
      {showSearch && (
        <input
          type="text"
          placeholder="Search..."
          className={styles.searchInput}
          onChange={(e) => onSearch?.(e.target.value)}
        />
      )}
      {rightSlot}
    </div>
  </div>

  <div className={styles.tableScroll}>
    <table className={styles.table}>
      {children}
    </table>
  </div>

  {/* <div className={styles.pagination}>
    {paginationComponent}
  </div> */}
</div>

  );
};

export default Table;
