import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "./Blackmails.module.css";
import { FaEye, FaTrash, FaSync } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8600/api";

const GetBlackmails = () => {
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
      const res = await axios.get(`${API_URL}/blackmail`, {
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
      toast.error("Failed to load blackmail reports");
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
      await axios.delete(`${API_URL}/blackmail/${reportToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Blackmail report deleted successfully");
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
        <h1>🛡️ Blackmail Reports</h1>
        <p className={styles.subtitle}>
          Review and manage blackmail / extortion cases
        </p>
      </div>

      {/* Search & Refresh */}
      <div className={styles.topBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name, suspect contact or threat details..."
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
                <th>Victim</th>
                <th>Gender</th>
                <th>Platform</th>
                <th>Suspect Contact</th>
                <th>Threat Summary</th>
                <th>Status</th>
                <th className={styles.actionHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className={styles.loadingRow}>
                    Loading blackmail reports...
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
                    <td className={styles.nameCell}>
                      {report.Reporter?.name || "Unknown"}
                    </td>
                    <td>{report.gender}</td>
                    <td>{report.platform_used || "-"}</td>
                    <td>{report.suspect_contact_details || "-"}</td>
                    <td className={styles.threatCell}>
                      {report.threat_details?.length > 80 
                        ? report.threat_details.substring(0, 77) + "..." 
                        : report.threat_details || "-"}
                    </td>
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
                  <td colSpan="8" className={styles.noData}>
                    No blackmail reports found
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
              <h2>🛡️ Blackmail Report Details</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedReport(null)}>✕</button>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.infoSection}>
                <h4>👤 Victim Information</h4>
                <p><strong>Name:</strong> {selectedReport.Reporter?.name}</p>
                <p><strong>Phone:</strong> {selectedReport.Reporter?.phone}</p>
                <p><strong>Gender:</strong> {selectedReport.gender}</p>
              </div>

              <div className={styles.infoSection}>
                <h4>⚠️ Threat Details</h4>
                <p><strong>Platform:</strong> {selectedReport.platform_used || "—"}</p>
                <p><strong>Suspect Contact:</strong> {selectedReport.suspect_contact_details || "—"}</p>
                <p><strong>Threat:</strong> {selectedReport.threat_details}</p>
              </div>

              <div className={styles.infoSection}>
                <h4>📋 Nature of Blackmail</h4>
                <p><strong>Threatening Messages:</strong> {selectedReport.received_threatening_messages ? "✅ Yes" : "❌ No"}</p>
                <p><strong>Asked for Money:</strong> {selectedReport.asked_for_money_or_benefit ? "✅ Yes" : "❌ No"}</p>
                <p><strong>Threatened to Leak Photos/Videos:</strong> {selectedReport.threatened_to_misuse_photos_videos ? "✅ Yes" : "❌ No"}</p>
                <p><strong>Received Nude/Obscene Content:</strong> {selectedReport.received_nude_obscene_content ? "✅ Yes" : "❌ No"}</p>
                <p><strong>Pretending to be Organization:</strong> {selectedReport.pretending_to_be_organization ? "✅ Yes" : "❌ No"}</p>
                <p><strong>Targeted Family/Friends:</strong> {selectedReport.targeted_family_or_friends ? "✅ Yes" : "❌ No"}</p>
              </div>

              <div className={styles.infoSection}>
                <h4>📌 Status & Remarks</h4>
                <p><strong>Status:</strong> {selectedReport.status}</p>
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
                      alt={`Evidence ${index + 1}`}
                      onClick={() => setSelectedImage(doc)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className={styles.modalActions}>
              <button 
                className={styles.deleteBtn} 
                onClick={() => {
                  setReportToDelete(selectedReport);
                  setShowDeleteModal(true);
                }}
              >
                🗑 Delete Report
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
          <div className={styles.amountModal} onClick={(e) => e.stopPropagation()}>
            <h3>Delete Blackmail Report?</h3>
            <p>This action cannot be undone.</p>
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

export default GetBlackmails;