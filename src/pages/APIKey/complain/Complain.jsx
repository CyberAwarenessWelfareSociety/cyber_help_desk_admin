// Complaints.jsx
import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaSync, FaEye, FaFileAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "@/Utils/api";
import Table from "@/components/Table/Table";
import FilterComponent from "@/components/Filter/Filter";
import EditComplaint from "./EditComplaint";

import styles from "@/pages/APIKey/ApiKey.module.css";
import ViewLawyerOnly from "./ViewLawyerOnly";
import ViewComplaint from "./ViewComplaint";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editComplaint, setEditComplaint] = useState(null);
  const [viewComplaint, setViewComplaint] = useState(null);

const [viewLawyerOnly, setViewLawyerOnly] = useState(null);      // Only lawyers view
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  const filterConfig = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "Submitted", label: "Submitted" },
        { value: "In Progress", label: "In Progress" },
        { value: "Resolved", label: "Resolved" },
      ],
    },
    {
      key: "lawyerRequired",
      label: "Lawyer Required",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
    },
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchComplaints();
  }, [pagination.page, pagination.pageSize, filter, debouncedSearch]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch,
        ...cleanFilters(filter),
      };
      const response = await api.get("/get-complain_register", { params: queryParams });
      setComplaints(response.data?.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.total || 0,
        totalPages: Math.ceil((response.data?.total || 0) / pagination.pageSize),
      }));
    } catch (error) {
      console.error("Error fetching complaints:", error.response?.data || error.message);
      toast.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const cleanFilters = (filters) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value === "") continue;
      if (key === "lawyerRequired") {
        cleaned[key] = value === "true";
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      await api.delete(`/delete-complain_register/${id}`);
      toast.success("Complaint deleted successfully");
      fetchComplaints();
    } catch (error) {
      console.error("Error deleting complaint:", error.response?.data || error.message);
      toast.error("Failed to delete complaint");
    }
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
    fetchComplaints();
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
          <h2 className={styles.cardTitle}>Complaints</h2>
          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
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
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Incident Date</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
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
              ) : complaints.length > 0 ? (
                complaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>{complaint.complainantName}</td>
                    <td>{complaint.complainantEmail}</td>
                    <td>{complaint.complainantPhone}</td>
                    <td>{new Date(complaint.incidentDate).toLocaleDateString()}</td>
     <td className="max-w-xs">
  <div className="truncate" title={complaint.incidentDescription}>
    {complaint.incidentDescription?.length > 80
      ? `${complaint.incidentDescription.substring(0, 80)}...`
      : complaint.incidentDescription || "—"}
  </div>
</td>
                    <td>{complaint.status}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
      className={`${styles.actionBtn} ${styles.viewFull}`}
      onClick={() => setViewComplaint(complaint)}
      title="View Full Complaint"
      style={{"borderBottom":"2px solid blue"}}
      aria-label="View Full Complaint"
    >
   <p style={{color:"blue"}}>View Details</p>
    </button>
                      { complaint.lawyerRequired && <FaEye
                          className={`${styles.actionBtn} ${styles.edit}`}
                          onClick={() => setViewComplaint(complaint)}
                          aria-label="View Complaint"
                          title="View Complaint"
                        />}
                        <FaEdit
                          className={`${styles.actionBtn} ${styles.edit}`}
                          onClick={() => setEditComplaint(complaint)}
                          aria-label="Edit Complaint"
                          title="Edit Complaint"
                        />
                        <FaTrash
                          className={`${styles.actionBtn} ${styles.delete}`}
                          onClick={() => handleDelete(complaint.id)}
                          aria-label="Delete Complaint"
                          title="Delete Complaint"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={styles.noData}>
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className={styles.paginationContainer}>
            <div className={styles.pageInfo}>
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
              {pagination.total} complaints
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
    {viewComplaint && (
        <ViewComplaint
          complaint={viewComplaint}
          onClose={() => setViewComplaint(null)}
        />
      )}

      {/* Assigned Lawyers Only Modal */}
      {viewLawyerOnly && (
        <ViewLawyerOnly
          complaint={viewLawyerOnly}
          onClose={() => setViewLawyerOnly(null)}
        />
      )}

      {/* Edit Modal */}
      {editComplaint && (
        <EditComplaint
          complaint={editComplaint}
          onClose={() => setEditComplaint(null)}
          onSave={() => fetchComplaints()}
        />
      )}
    </div>
  );
};

export default Complaints;