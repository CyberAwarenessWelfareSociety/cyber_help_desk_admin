import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaWallet } from "react-icons/fa";
import styles from "./ApiKey.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8600/api";

const WalletBalance = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const clientId = "294f86ae-0536-48ed-8084-60b9dc450967"; // Hardcoded for now; ideally, pass as prop or retrieve dynamically

  useEffect(() => {
    const fetchWalletBalance = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authorization token found");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${API_URL}/clients/${clientId}/wallet`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.balance) {
          setBalance(response.data.balance);
        } else {
          toast.error("Failed to fetch wallet balance");
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        toast.error("Error fetching wallet balance");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletBalance();
  }, [clientId]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>Wallet Balance</h2>
        </div>
        <div className="grid grid-cols-3 items-center gap-4 py-4">
          <label className="col-span-1 font-medium text-black">
            <FaWallet className="inline-block mr-2" /> Balance:
          </label>
          <div className="col-span-2">
            {loading ? (
              <div className={styles.spinnerContainer}>
                <div className={styles.customSpinner}></div>
              </div>
            ) : balance !== null ? (
              <span
                className={`${styles.noWrapText} ${
                  balance === "0.00" ? styles.zeroBalance : styles.positiveBalance
                }`}
              >
                ₹{balance}
              </span>
            ) : (
              <span className={styles.noData}>No balance data available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletBalance;