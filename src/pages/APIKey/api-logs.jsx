import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../Utils/api";
import FilterComponent from "../../components/Filter/Filter";
import Table from "../../components/Table/Table";
import { FaSync } from "react-icons/fa";
import styles from "./ApiKey.module.css";

const ApiLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

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

  useEffect(() => {
    if (!clientId) {
      toast.error("No client ID found. Please log in.");
      return;
    }
    fetchLogs();
  }, [pagination.page, pagination.pageSize, filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const queryParams = {
        client_id: clientId,
        page: pagination.page,
        limit: pagination.pageSize,
        ...cleanFilters(filter),
      };
      const response = await api.get("/get-Api_Usage_Log", {
        params: queryParams,
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(response.data?.data || []);
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

  const handleRefresh = () => {
    fetchLogs();
  };

  const toolbarRight = (
    <button className={styles.iconButton} onClick={handleRefresh}>
      <FaSync />
    </button>
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>API Logs</h2>
        </div>
        <Table
          title=""
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
                <th>ID</th>
                <th>API Name</th>
                <th>Status</th>
                <th>Cost Charged</th>
                <th>Latency (ms)</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className={styles.loadingCell}>
                    <div className={styles.spinnerContainer}>
                      <div className={styles.customSpinner}></div>
                    </div>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.api_name}</td>
                    <td className={log.status === "502" ? styles.highLatency : ""}>
                      {log.status}
                    </td>
                    <td>{parseFloat(log.cost_charged).toFixed(2)}</td>
                    <td className={log.latency_ms > 1000 ? styles.highLatency : styles.lowLatency}>
                      {log.latency_ms}
                    </td>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={styles.noData}>
                    No API logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
              <div className="flex gap-1">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`${styles.pageButton} ${pagination.page === 1 ? "disabled" : ""}`}
                >
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`${styles.pageButton} ${pagination.page === page ? styles.active : ""}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`${styles.pageButton} ${pagination.page === pagination.totalPages ? "disabled" : ""}`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </Table>
      </div>
    </div>
  );
};

export default ApiLogs;