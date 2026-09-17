
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "./ApiKey.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8600/api";

const ClientApiKeyAccess = () => {
  const apikeyData = localStorage.getItem("apiKeys") || "";
  const apiKey = JSON.parse(apikeyData);
  const userData = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};
  const clientName = userData.name || "Client";
  const [visible, setVisible] = useState(false);
  const [accessData, setAccessData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccessApis = async () => {
      if (!apiKey) {
        toast.error("No API key found in local storage");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authorization token found");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/accessApibyKey?apiKey=${apiKey}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success && Array.isArray(response.data.data)) {
          setAccessData(response.data.data);
        } else {
          toast.error("Failed to fetch API access data");
        }
      } catch (error) {
        console.error("Error fetching API access:", error);
        toast.error("Error fetching API access");
      } finally {
        setLoading(false);
      }
    };

    fetchAccessApis();
  }, [apiKey]);

  const toggleVisibility = () => {
    setVisible(!visible);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>Client API Key Access</h2>
        </div>
        <div className={styles.topBarRow}>
          <div className="grid grid-cols-3 items-center gap-4 py-4">
            <label className="col-span-1 font-medium text-black">Client Name:</label>
            <span className={`${styles.noWrapText} col-span-2`}>{clientName}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4 py-4">
            <label className="col-span-1 font-medium text-black">API Key:</label>
            <div className="col-span-2 flex items-center gap-2">
              <span className={styles.noWrapText}>
                {visible ? apiKey : "••••••••••••••••••••••••••••••••"}
              </span>
              <button
                className={`${styles.actionBtn} ${styles.edit}`}
                onClick={toggleVisibility}
                aria-label={visible ? "Hide API Key" : "Show API Key"}
              >
                {visible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
        </div>
        <div className="tableSection">
          <h3 className={styles.sectionTitle}>Accessed APIs</h3>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>API Name</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="1" className={styles.loadingCell}>
                    <div className={styles.spinnerContainer}>
                      <div className={styles.customSpinner}></div>
                    </div>
                  </td>
                </tr>
              ) : accessData.length > 0 ? (
                accessData.map((item) => (
                  <tr key={item.id}>
                    <td className={styles.noWrapText}>{item.api_name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="1" className={styles.noData}>
                    No API access found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientApiKeyAccess;
