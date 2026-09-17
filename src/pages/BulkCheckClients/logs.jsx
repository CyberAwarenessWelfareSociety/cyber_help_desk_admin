import styles from "./bulk.module.css";
import {
  FaSearch,
  FaSync,
  FaCalendarAlt,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../Utils/api";
import Table from "@/components/Table/Table";

const BulkCheckLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearch,
        page: pagination.page,
        limit: pagination.pageSize,
      };

      const res = await api.get("/police/bulk-check-logs", { params });
      const data = res.data?.data || [];
      const pag = res.data?.pagination || {};

      setLogs(data);
      setPagination({
        page: pag.currentPage || 1,
        pageSize: pag.limit || 20,
        total: pag.totalRecords || 0,
        totalPages: pag.totalPages || 1,
        hasNext: pag.hasNext || false,
        hasPrev: pag.hasPrev || false,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch bulk check logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, pagination.pageSize, debouncedSearch]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>Bulk Check Logs</h2>
          <div className={styles.topBarActions}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by client name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className={styles.iconButton} onClick={fetchLogs}>
              <FaSync />
            </button>
          </div>
        </div>

        <Table title="">
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Phone</th>
                  <th>Hit Count</th>
                  <th>Last Hit At</th>
                  <th>Purchase Amount (₹)</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className={styles.loadingCell}>
                      <div className={styles.spinnerContainer}>
                        <div className={styles.customSpinner}></div>
                      </div>
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{formatDate(log.date)}</td>
                      <td>
                        <strong>{log.Client?.name || "—"}</strong>
                      </td>
                      <td>{log.Client?.phone || "—"}</td>
                      <td>
                        <span
                          className={
                            log.hit_count > 0
                              ? styles.completed
                              : styles.pending
                          }
                        >
                          {log.hit_count}
                        </span>
                      </td>
                      <td>{formatDateTime(log.last_hit_at)}</td>
                      <td>₹{parseFloat(log.purchase_amount || 0).toFixed(2)}</td>
                      <td>{formatDateTime(log.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className={styles.noData}>
                      No bulk check logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={styles.paginationContainer}>
            <div className={styles.pageInfo}>
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
              {pagination.total} logs
            </div>
            <div className={styles.pageControls}>
              <select
                value={pagination.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className={styles.pageSizeSelect}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className={styles.pageButton}
              >
                Previous
              </button>

              <span style={{ padding: "8px 12px", color: "#6B7280" }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className={styles.pageButton}
              >
                Next
              </button>
            </div>
          </div>
        </Table>
      </div>
    </div>
  );
};

export default BulkCheckLogs;