import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";        // Added for better UX
import styles from "./MissingMobiles.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8600/api";

const MissingMobiles = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
 const token = localStorage.getItem("token");
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/missingMobiles`, {
        page,
        limit: 10,
        search,
        is_approved: false,
      });

      setData(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load missing mobiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  // =========================
  // UPDATED: Approve + Deduct ₹20
  // =========================
  const updateStatus = async (id, status, client_id) => {
    if (!window.confirm(`Are you sure you want to ${status ? "approve" : "reject"} this missing mobile report?`)) {
      return;
    }

    if (status === true && !client_id) {
      toast.error("Client ID not found. Cannot deduct service fee.");
      return;
    }

    try {
      // Step 1: Update approval status
      await axios.put(`${API_URL}/update-missing-mobile/${id}`, {
        is_approved: status,
        money: status === true ? 20 : 0,   // ₹20 fee for approval, no change for rejection
      });

      // Step 2: If approved → Deduct ₹20 from client's wallet
      if (status === true && client_id) {
        await axios.post(
          `${API_URL}/client-payments-recharge`,
          {
            client_id: client_id,
            amount: 20,                           // Negative amount = deduction
            mode: "system",
            method: "service_fee",
            transaction_id: `mobile-approval-${id}-${Date.now()}`,
            description: "Service fee for approving missing mobile report",
          },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );

        toast.success("Missing mobile approved successfully. ₹20 service fee Added to client wallet.");
      } else if (status === false) {
        toast.success("Missing mobile report rejected successfully.");
      }

      fetchData();                     // Refresh the list
    } catch (err) {
      console.error("Update error:", err);
      toast.error(
        status 
          ? "Failed to approve mobile or deduct fee" 
          : "Failed to reject mobile"
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Missing Mobiles</h1>
        <p className={styles.subtitle}>
          Review and approve/reject reported missing mobile phones
        </p>
      </div>

      {/* Search Bar */}
      <div className={styles.topBar}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by IMEI, Mobile Make, Complainant..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>IMEI Number</th>
                <th>Mobile Make</th>
                <th>Complainant</th>
                <th>State</th>
                <th>Police Station</th>
                <th>Status</th>
                <th className={styles.actionHeader}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className={styles.loadingRow}>
                    <div className={styles.loader}>Loading records...</div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className={styles.imei}>{item.imei_no}</td>
                    <td>{item.mobile_make}</td>
                    <td>{item.complainant}</td>
                    <td>{item.state}</td>
                    <td>{item.police_station}</td>
                    <td>
                      <span className={styles.statusBadge}>
                        {item.status || "Pending"}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        className={styles.acceptBtn}
                        onClick={() => updateStatus(item.id, true, item.client_id)}
                      >
                        ✅ Approve (₹20)
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => updateStatus(item.id, false)}
                      >
                        ❌ Reject
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={styles.noData}>
                    No missing mobile records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Previous
          </button>

          <span className={styles.pageInfo}>
            Page <strong>{page}</strong> of {totalPages}
          </span>

          <button
            className={styles.pageBtn}
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default MissingMobiles;