import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "./CyberFrauds.module.css";
import { FaEye, FaTrash, FaSync } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8600/api";

const GetCyberFrauds = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  const token = localStorage.getItem("token");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/cyber-fraud`, {
        params: { 
          page, 
          limit: 10,
          search: searchTerm || undefined 
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      setReports(res.data.reports || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cyber fraud reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, searchTerm]);

  const handleDelete = async () => {
    if (!reportToDelete) return;
    try {
      await axios.delete(`${API_URL}/cyber-fraud/${reportToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Report deleted successfully");
      fetchReports();
      setShowDeleteModal(false);
      setReportToDelete(null);
      if (selectedReport?.id === reportToDelete.id) setSelectedReport(null);
    } catch (err) {
      toast.error("Failed to delete report");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🚨 Cyber Fraud Reports</h1>
        <p className={styles.subtitle}>
          Review and manage reported cyber fraud cases
        </p>
      </div>

      {/* Search & Refresh */}
      <div className={styles.topBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name, mobile, or fraud type..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
        <button className={styles.refreshBtn} onClick={fetchReports}>
          <FaSync /> Refresh
        </button>
      </div>

      {/* Table Card */}
      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Documents</th>
                <th>Victim Name</th>
                <th>Mobile</th>
                <th>Location</th>
                <th>Fraud Date</th>
                <th>Amount (₹)</th>
                <th>Fraud Type</th>
                <th>Status</th>
                <th className={styles.actionHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className={styles.loadingRow}>
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((report) => (
                  <tr key={report.id} className={styles.tableRow}>
                    <td>
                      {report.supporting_documents?.length > 0 ? (
                        <img
                          src={report.supporting_documents[0]}
                          alt="doc"
                          className={styles.thumbnail}
                          onClick={() => setSelectedImage(report.supporting_documents[0])}
                        />
                      ) : (
                        <div className={styles.noImage}>No Docs</div>
                      )}
                    </td>
                    <td className={styles.nameCell}>{report.full_name}</td>
                    <td>{report.mobile_number}</td>
                    <td>{report.city_town}, {report.state}</td>
                    <td>{new Date(report.fraud_date).toLocaleDateString('en-IN')}</td>
                    <td className={styles.amount}>
                      ₹{parseFloat(report.amount_involved).toLocaleString()}
                    </td>
                    <td>{report.fraud_type}</td>
                    <td>
                      <span className={styles.statusBadge}>
                        {report.status}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => setSelectedReport(report)}
                      >
                        👁️ View
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => {
                          setReportToDelete(report);
                          setShowDeleteModal(true);
                        }}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className={styles.noData}>
                    No cyber fraud reports found
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

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className={styles.modalOverlay} onClick={() => setSelectedImage(null)}>
          <div className={styles.imageModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedImage(null)}>✕</button>
            <img src={selectedImage} alt="Evidence" />
          </div>
        </div>
      )}

      {/* Full Details Modal */}
      {selectedReport && (
        <div className={styles.modalOverlay} onClick={() => setSelectedReport(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>🚨 Cyber Fraud Report Details</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedReport(null)}>✕</button>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.infoSection}>
                <h4>👤 Victim Information</h4>
                <p><strong>Name:</strong> {selectedReport.full_name}</p>
                <p><strong>Mobile:</strong> {selectedReport.mobile_number}</p>
                <p><strong>Location:</strong> {selectedReport.city_town}, {selectedReport.district}, {selectedReport.state}</p>
              </div>

              <div className={styles.infoSection}>
                <h4>⚠️ Fraud Details</h4>
                <p><strong>Fraud Type:</strong> {selectedReport.fraud_type}</p>
                <p><strong>Date:</strong> {new Date(selectedReport.fraud_date).toLocaleDateString('en-IN')}</p>
                <p><strong>Amount Involved:</strong> ₹{parseFloat(selectedReport.amount_involved).toLocaleString()}</p>
                <p><strong>Reference No:</strong> {selectedReport.reference_number || "N/A"}</p>
              </div>

              <div className={styles.infoSection}>
                <h4>📌 Status</h4>
                <p><strong>Status:</strong> {selectedReport.status}</p>
                <p><strong>Called 1930:</strong> {selectedReport.called_helpline_1930 ? "✅ Yes" : "❌ No"}</p>
                <p><strong>Filed on Portal:</strong> {selectedReport.filed_on_cybercrime_portal ? "✅ Yes" : "❌ No"}</p>
              </div>

              <div className={styles.infoSection}>
                <h4>📝 Remarks</h4>
                <p className={styles.remarks}>{selectedReport.remarks || "No remarks provided"}</p>
              </div>
            </div>

            {/* Supporting Documents */}
            {selectedReport.supporting_documents?.length > 0 && (
              <div className={styles.mediaSection}>
                <h4>📎 Supporting Documents ({selectedReport.supporting_documents.length})</h4>
                <div className={styles.mediaGrid}>
                  {selectedReport.supporting_documents.map((doc, index) => (
                    <img
                      key={index}
                      src={doc}
                      alt={`Document ${index + 1}`}
                      onClick={() => setSelectedImage(doc)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className={styles.modalActions}>
              <button className={styles.deleteBtn} onClick={() => {
                setReportToDelete(selectedReport);
                setShowDeleteModal(true);
              }}>
                🗑 Delete Report
              </button>
              <button className={styles.closeModalBtn} onClick={() => setSelectedReport(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.amountModal} onClick={(e) => e.stopPropagation()}>
            <h3>Delete Report?</h3>
            <p>Are you sure you want to delete this fraud report?</p>
            <div className={styles.amountActions}>
              <button className={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className={styles.confirmApproveBtn} onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetCyberFrauds;