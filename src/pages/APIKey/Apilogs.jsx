import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../Utils/api";
import FilterComponent from "../../Components/Filter/Filter";
import Table from "../../components/Table/Table";
import { FaSync, FaEye, FaSearch } from "react-icons/fa";
import styles from "./ApiKey.module.css";
import Pagination from "./Pagination"; // Reusing Pagination component from ApiUsesLog
import style from "./APIUsesLogViewModal.module.css";
const ApiLogViewModal = ({ log, onClose }) => {
  return (
    <div
      className={style.modalOverlay}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        className={style.modalContent}
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h2 className={style.modalTitle}>API Log Details</h2>
        <div className={style.modalBody}>
          <p><strong>ID:</strong> {log?.id || "N/A"}</p>
          <p><strong>API Name:</strong> {log?.api_name || "N/A"}</p>
          <p><strong>Status:</strong> {log?.status || "N/A"}</p>
          <p><strong>Cost Charged:</strong> ₹{parseFloat(log?.cost_charged || 0).toFixed(2)}</p>
          <p><strong>Latency (ms):</strong> {log?.latency_ms || "N/A"}</p>
          <p><strong>Before Hit Balance:</strong> ₹{parseFloat(log?.before_hit_balance || 0).toFixed(2)}</p>
          <p><strong>After Hit Balance:</strong> ₹{parseFloat(log?.after_hit_balance || 0).toFixed(2)}</p>
          <p><strong>Vendor Name:</strong> {log?.vendor_name || "N/A"}</p>
          <p><strong>Vendor API Name:</strong> {log?.vendor_api_name || "N/A"}</p>
          <p><strong>Vendor Before Balance:</strong> {log?.vendor_before_balance || "N/A"}</p>
          <p><strong>Vendor After Balance:</strong> {log?.vendor_after_balance || "N/A"}</p>
          <p><strong>Created At:</strong> {log?.createdAt ? new Date(log.createdAt).toLocaleString() : "N/A"}</p>
          <p><strong>Last Updated:</strong> {log?.updatedAt ? new Date(log.updatedAt).toLocaleString() : "N/A"}</p>
        </div>
        <div className={style.modalFooter}>
          <button onClick={onClose} className={style.modalCloseButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ApiLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});
  const [selectedLog, setSelectedLog] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const clientId = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).id
    : null;

  const filterConfig = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "200", label: "Success (200)" },
        { value: "502", label: "Bad Gateway (502)" },
        { value: "500", label: "Server Error (500)" },
      ],
    },
    {
      key: "api_name",
      label: "API Name",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "mobileDataV1", label: "Mobile Data V1" },
        { value: "mobileTomultipleVehicleRc", label: "Mobile to Multiple Vehicle RC" },
      ],
    },
  ];

  // Debounce search input (500ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (!clientId) {
      toast.error("No client ID found. Please log in.");
      return;
    }
    fetchLogs();
  }, [pagination.page, pagination.pageSize, filter, debouncedSearch]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const queryParams = {
        clientId: clientId,
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        ...cleanFilters(filter),
      };
      const response = await api.get("/api-usage-log", {
        params: queryParams,
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(response.data?.usageLogs || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.total || 0,
        totalPages: Math.ceil((response.data?.total || 0) / pagination.pageSize),
      }));
    } catch (error) {
      console.error("Error fetching API logs:", error);
      toast.error("Failed to fetch API logs");
    } finally {
      setLoading(false);
    }
  };

  const cleanFilters = (filters) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value !== "") {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  const formatRupees = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: newSize,
      page: 1,
    }));
  };

  const toolbarLeft = (
    <span className={styles.toolbarLabel}>API Usage Logs</span>
  );

  const toolbarRight = (
    <>
      <button className={styles.iconButton} onClick={fetchLogs}>
        <FaSync />
      </button>
    </>
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>API Hit Log</h2>
          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <Table
          title=""
          leftSlot={toolbarLeft}
          rightSlot={toolbarRight}
          filterContent={
            <FilterComponent
              config={filterConfig}
              values={filter}
              onChange={setFilter}
            />
          }
        >
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>API Name</th>
                <th>Status</th>
                <th>Latency (ms)</th>
                <th>Cost Charged</th>
                <th>Before Hit</th>
                <th>After Hit</th>
                <th>Vendor Name</th>
                <th>Vendor API Name</th>
                <th>Vendor Before Balance</th>
                <th>Vendor After Balance</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="13" className={styles.loadingCell}>
                    <div className={styles.spinnerContainer}>
                      <div className={styles.customSpinner}></div>
                    </div>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.api_name}</td>
                    <td className={log.status === "502" ? styles.highLatency : ""}>
                      {log.status}
                    </td>
                    <td
                      className={
                        log.latency_ms > 1000 ? styles.highLatency : styles.lowLatency
                      }
                    >
                      {log.latency_ms}
                    </td>
                    <td>{formatRupees(log.cost_charged)}</td>
                    <td>{formatRupees(log.before_hit_balance)}</td>
                    <td>{formatRupees(log.after_hit_balance)}</td>
                    <td>{log.vendor_name || "N/A"}</td>
                    <td>{log.vendor_api_name || "N/A"}</td>
                    <td>{log.vendor_before_balance || "N/A"}</td>
                    <td>{log.vendor_after_balance || "N/A"}</td>
                    <td>{new Date(log.updatedAt).toLocaleString()}</td>
                    <td className={styles.textCenter}>
                      <div
                        onClick={() => setSelectedLog(log)}
                        style={{ cursor: "pointer", display: "inline-block" }}
                      >
                        <FaEye />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className={styles.noData}>
                    No API logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Table>
      </div>
      {selectedLog && (
        <ApiLogViewModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

export default ApiLogs;