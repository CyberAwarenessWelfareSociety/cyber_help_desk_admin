import { useState, useEffect } from "react";
import styles from "./DashboardLayout.module.css";
import { UserContext } from "../context/contextAPI";
import { useContext } from "react";

import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useDarkMode } from "./UserDarkMode";
import api from "../Utils/api";

export function Header() {
  const [isDark, setIsDark] = useDarkMode();
  const [balance, setBalance] = useState(null);
  // const [User] = useContext(UserContext);
  const { user } = useContext(UserContext);
  useEffect(() => {
    async function fetchBalance() {
      try {
        const res = await api.get(`/clients/${user.id}/wallet`);
        // Axios automatically parses JSON, so res.data is the response body
        setBalance(res.data?.balance ?? 0); // Adjust key if API structure differs
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setBalance(0);
      }
    }
    fetchBalance();
  }, [user.id]);

  return (
    <header className={styles.header}>
      <div className={styles.walletBox}>
        <span className={styles.walletLabel}>API Balance</span>
        <span className={styles.walletValue}>
          {balance !== null ? `₹${balance}` : "..."}
        </span>
      </div>

      <div className={styles.headerActions}>
        <button
          className={styles.headerIcon}
          onClick={() => setIsDark((d) => !d)}
          aria-label="Toggle theme"
          style={{ background: "none", border: "none" }}
        >
          {isDark ? <MdLightMode /> : <MdDarkMode />}
        </button>
      </div>
    </header>
  );
}
