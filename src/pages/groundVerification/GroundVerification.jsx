// GroundVerification.jsx
import { useEffect, useState } from "react";
import { FaEye, FaEdit, FaTrash, FaSync } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "@/Utils/api";
import Table from "@/components/Table/Table";
import FilterComponent from "@/components/Filter/Filter";
import ViewKYC from "./ViewKYC";
import EditKYC from "./EditKYC";
import styles from "@/pages/APIKey/ApiKey.module.css";

const GroundVerification = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [filter, setFilter] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [viewRequest, setViewRequest] = useState(null);
  const [editRequest, setEditRequest] = useState(null);
console.log(viewRequest)
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data whenever page, filter, or search changes
  useEffect(() => {
    fetchRequests();
  }, [pagination.page, pagination.pageSize, filter, debouncedSearch]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        ...filter,
      };

      const response = await api.get("/get-client_kyc_request", { params });
      setRequests(response.data?.data || []);
      setPagination({
        page: response.data?.page || 1,
        pageSize: response.data?.pageSize || 10,
        total: response.data?.total || 0,
        totalPages: response.data?.totalPages || 1,
      });
    } catch (error) {
      console.error("Error fetching KYC requests:", error);
      toast.error("Failed to load ground verification requests");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this KYC request?")) return;

    try {
      await api.delete(`/delete-client_kyc_request/${id}`);
      toast.success("KYC request deleted successfully");
      fetchRequests();
    } catch (error) {
      toast.error("Failed to delete request");
    }
  };

  const handleRefresh = () => fetchRequests();

  const toolbarRight = (
    <button className={styles.iconButton} onClick={handleRefresh} title="Refresh">
      <FaSync />
    </button>
  );

  const filterConfig = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "PENDING", label: "Pending" },
        { value: "COMPLETED", label: "Completed" },
        { value: "INSUFFICIENCY", label: "insufficiency" },
      ],
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>Ground Verification Requests (KYC)</h2>
          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search by name, mobile, or request ID..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Table
          rightSlot={toolbarRight}
          filterContent={
            <FilterComponent config={filterConfig} values={filter} onChange={setFilter} />
          }
        >
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Request ID</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>City</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className={styles.loadingCell}>
                    <div className={styles.spinnerContainer}>
                      <div className={styles.customSpinner}></div>
                    </div>
                  </td>
                </tr>
              ) : requests.length > 0 ? (
                requests.map((req) => (
                  <tr key={req.id}>
                    <td className="font-medium">{req.requestId}</td>
                    <td>{req.name}</td>
                    <td>{req.mobile}</td>
                    <td>{req.city}</td>
                    <td className="max-w-xs truncate" title={req.kyc_verification_purpose}>
                      {req.kyc_verification_purpose?.slice(0, 50)}...
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          req.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : req.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <FaEye
                          className={`${styles.actionBtn} text-blue-600 hover:text-blue-800`}
                          onClick={() => setViewRequest(req)}
                          title="View Details"
                        />
                        <FaEdit
                          className={`${styles.actionBtn} text-green-600 hover:text-green-800`}
                          onClick={() => setEditRequest(req)}
                          title="Edit Request"
                        />
                        <FaTrash
                          className={`${styles.actionBtn} text-red-600 hover:text-red-800`}
                          onClick={() => handleDelete(req.id)}
                          title="Delete Request"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className={styles.noData}>
                    No ground verification requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className={styles.paginationContainer}>
            <div className={styles.pageInfo}>
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} requests
            </div>
            <div className={styles.pageControls}>
              <select
                value={pagination.pageSize}
                onChange={(e) =>
                  setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value), page: 1 }))
                }
                className={styles.pageSizeSelect}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <div className="flex gap-1">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className={`${styles.pageButton} ${pagination.page === 1 ? "disabled" : ""}`}
                >
                  Previous
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                    className={`${styles.pageButton} ${pagination.page === i + 1 ? styles.active : ""}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
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

      {/* Modals */}
      {viewRequest && <ViewKYC request={viewRequest} onClose={() => setViewRequest(null)} />}
      {editRequest && (
        <EditKYC
          request={editRequest}
          onClose={() => setEditRequest(null)}
          onSave={() => {
            fetchRequests();
            setEditRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default GroundVerification;