import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "./AccountFreezes.module.css";
import { FaEye, FaTrash, FaSync } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8600/api";

const GetAccountFreezes = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  const token = localStorage.getItem("token");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/account-freeze`, {
        params: { 
          page, 
          limit: 10,
          search: searchTerm || undefined 
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      setReports(res.data.reports || []);
      setTotalPages(res.data.totalPages || Math.ceil((res.data.count || 0) / 10));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load account freeze requests");
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
      await axios.delete(`${API_URL}/account-freeze/${reportToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Account freeze request deleted successfully");
      fetchReports();
      setShowDeleteModal(false);
      setReportToDelete(null);
    } catch (err) {
      toast.error("Failed to delete request");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🏦 Account Freeze Requests</h1>
        <p className={styles.subtitle}>
          Review bank account freeze / money mule complaints
        </p>
      </div>

      {/* Search & Refresh */}
      <div className={styles.topBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name, bank branch or payment source..."
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

      {/* Table */}
      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Documents</th>
                <th>Victim Name</th>
                <th>Location</th>
                <th>Bank Branch</th>
                <th>Occupation</th>
                <th>Payment From</th>
                <th>Status</th>
                <th className={styles.actionHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className={styles.loadingRow}>Loading requests...</td></tr>
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
                    <td className={styles.nameCell}>{report.Reporter?.name}</td>
                    <td>{report.city_town}, {report.district}</td>
                    <td>{report.bank_branch}</td>
                    <td>{report.occupation}</td>
                    <td>{report.payment_from || "-"}</td>
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
                <tr><td colSpan="8" className={styles.noData}>No account freeze requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            ← Previous
          </button>
          <span className={styles.pageInfo}>Page <strong>{page}</strong> of {totalPages}</span>
          <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            Next →
          </button>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className={styles.modalOverlay} onClick={() => setSelectedImage(null)}>
          <div className={styles.imageModal} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedImage(null)}>✕</button>
            <img src={selectedImage} alt="Document" />
          </div>
        </div>
      )}

      {/* Full Details Modal */}
      {selectedReport && (
        <div className={styles.modalOverlay} onClick={() => setSelectedReport(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>🏦 Account Freeze Request Details</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedReport(null)}>✕</button>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.infoSection}>
                <h4>👤 Victim Information</h4>
                <p><strong>Name:</strong> {selectedReport.Reporter?.name}</p>
                <p><strong>Phone:</strong> {selectedReport.Reporter?.phone}</p>
                <p><strong>Location:</strong> {selectedReport.city_town}, {selectedReport.district}, {selectedReport.state}</p>
              </div>

              <div className={styles.infoSection}>
                <h4>🏦 Bank Details</h4>
                <p><strong>Branch:</strong> {selectedReport.bank_branch}</p>
                <p><strong>Occupation:</strong> {selectedReport.occupation}</p>
                <p><strong>Account Age:</strong> {selectedReport.account_opened_years_ago} years</p>
                <p><strong>Banking Habit:</strong> {selectedReport.banking_habit}</p>
              </div>

              <div className={styles.infoSection}>
                <h4>💰 Transaction Details</h4>
                <p><strong>Payment From:</strong> {selectedReport.payment_from}</p>
                <p><strong>Reason:</strong> {selectedReport.payment_reason}</p>
                <p><strong>Know the Person:</strong> {selectedReport.know_the_person ? "✅ Yes" : "❌ No"}</p>
                <p><strong>Spoken to Payer:</strong> {selectedReport.spoken_to_payer ? "✅ Yes" : "❌ No"}</p>
              </div>

              <div className={styles.infoSection}>
                <h4>📌 Status & Remarks</h4>
                <p><strong>Status:</strong> <span className={styles.statusBadge}>{selectedReport.status}</span></p>
                <p><strong>Remarks:</strong> {selectedReport.remarks || "No remarks"}</p>
                <p><strong>Reported On:</strong> {new Date(selectedReport.createdAt).toLocaleString('en-IN')}</p>
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
                🗑 Delete Request
              </button>
              <button className={styles.closeModalBtn} onClick={() => setSelectedReport(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.amountModal} onClick={e => e.stopPropagation()}>
            <h3>Delete Request?</h3>
            <p>This action cannot be undone.</p>
            <div className={styles.amountActions}>
              <button className={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className={styles.confirmApproveBtn} onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetAccountFreezes;