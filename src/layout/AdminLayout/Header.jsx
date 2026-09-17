import styles from '../DashboardLayout.module.css';
import { MdSearch, MdNotifications, MdAccountCircle, MdDarkMode, MdLightMode } from "react-icons/md";
import { useDarkMode } from '../UserDarkMode';

export function Header() {
  const [isDark, setIsDark] = useDarkMode();

  return (
    <header className={styles.header}>
      {/* <div className={styles.searchBar}>
        <MdSearch />
        <input type="text" placeholder="Type to search" />
      </div> */}
      <div className={styles.headerActions}>
        {/* Theme Toggle Button */}
        <button
          className={styles.headerIcon}
          onClick={() => setIsDark(d => !d)}
          aria-label="Toggle theme"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          {isDark ? <MdLightMode /> : <MdDarkMode />}
        </button>
        <MdNotifications className={styles.headerIcon} />
        <MdAccountCircle className={styles.headerIcon} />
      </div>
    </header>
  );
}
