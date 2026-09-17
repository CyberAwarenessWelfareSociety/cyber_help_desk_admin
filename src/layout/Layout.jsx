import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styles from './DashboardLayout.module.css';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={styles.mainArea}>
        <Header />
        <main className={styles.innerContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
