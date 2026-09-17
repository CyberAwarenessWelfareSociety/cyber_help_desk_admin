import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "./ContentTakedown.module.css";
import { FaEye, FaTrash, FaSync, FaComments } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8600/api";

const TYPE_LABELS = {
  NUDE_IMAGE: "Remove Nude Image",
  NUDE_VIDEO: "Remove Nude Video",
  HARMFUL_CONTENT: "Remove Harmful Content / URL",
};

const VOLUNTEER_MODEL = {
  NUDE_IMAGE: "NudeImage",
  NUDE_VIDEO: "NudeVideo",
  HARMFUL_CONTENT: "HarmfulContent",
};

const GetContentTakedowns = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterChat, setFilterChat] = useState(""); // "" | "true" | "false"

  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  const token = localStorage.getItem("token");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/content-takedown`, {
        params: {
          page,
          limit: 10,
          search: searchTerm || undefined,
          request_type: filterType || undefined,
          want_counselling_chat: filterChat || undefined,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      setReports(res.data.reports || []);
      setTotalPages(
        res.data.totalPages || Math.ceil((res.data.count || 0) / 10) || 1,
      );
    } catch (err) {
      console.error("[ContentTakedown admin] load error:", err);
      toast.error(
        err.response?.data?.message || "Failed to load content takedown reports",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, filterType, filterChat]);

  const handleDelete = async () => {
    if (!reportToDelete) return;
    try {
      await axios.delete(`${API_URL}/content-takedown/${reportToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Report deleted successfully");
      fetchReports();
      setShowDeleteModal(false);
      setReportToDelete(null);
      if (selectedReport?.id === reportToDelete.id) setSelectedReport(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete report");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🛡️ Content Takedown & Counselling</h1>
        <p className={styles.subtitle}>
          Global Clearinghouse removal requests. Users who chose counselling
          open a group chat with all admins + volunteers assigned to that type
          (Nude Image / Nude Video / Harmful Content). Assign experts under{" "}
          <strong>Volunteer → Assign Volunteer</strong>.
        </p>
      </div>

      <div className={styles.topBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name, platform, URL, phone..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
        <select
          className={styles.filterSelect}
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All types</option>
          <option value="NUDE_IMAGE">Nude Image</option>
          <option value="NUDE_VIDEO">Nude Video</option>
          <option value="HARMFUL_CONTENT">Harmful Content / URL</option>
        </select>
        <select
          className={styles.filterSelect}
          value={filterChat}
          onChange={(e) => {
            setFilterChat(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Chat: All</option>
          <option value="true">Wants counselling chat</option>
          <option value="false">No chat</option>
        </select>
        <button className={styles.refreshBtn} onClick={fetchReports}>
          <FaSync /> Refresh
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Docs</th>
                <th>Victim</th>
                <th>Type</th>
                <th>Platforms</th>
                <th>Summary</th>
                <th>Counselling Chat</th>
                <th>Status</th>
                <th className={styles.actionHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className={styles.loadingRow}>
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
                          onClick={() =>
                            setSelectedImage(report.supporting_documents[0])
                          }
                        />
                      ) : (
                        <div className={styles.noImage}>No Docs</div>
                      )}
                    </td>
                    <td className={styles.nameCell}>
                      <div>{report.full_name || report.Reporter?.name || "—"}</div>
                      <div className={styles.muted}>
                        {report.contact_phone || report.Reporter?.phone || ""}
                      </div>
                    </td>
                    <td>
                      <span className={styles.typeBadge}>
                        {TYPE_LABELS[report.request_type] || report.request_type}
                      </span>
                      <div className={styles.muted}>
                        Assign key: {VOLUNTEER_MODEL[report.request_type]}
                      </div>
                    </td>
                    <td>{report.platforms || "—"}</td>
                    <td className={styles.threatCell}>
                      {report.incident_description?.length > 80
                        ? report.incident_description.substring(0, 77) + "..."
                        : report.incident_description || "—"}
                    </td>
                    <td>
                      {report.want_counselling_chat ? (
                        <span className={styles.chatYes}>
                          <FaComments /> Yes — wants expert chat
                          {report.chat_id ? (
                            <div className={styles.muted}>
                              Chat ID: {String(report.chat_id).slice(0, 8)}…
                            </div>
                          ) : null}
                        </span>
                      ) : (
                        <span className={styles.chatNo}>No</span>
                      )}
                    </td>
                    <td>
                      <span className={styles.statusBadge}>{report.status}</span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => setSelectedReport(report)}
                      >
                        <FaEye /> View
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => {
                          setReportToDelete(report);
                          setShowDeleteModal(true);
                        }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className={styles.noData}>
                    No content takedown reports found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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

      {selectedImage && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedImage(null)}
        >
          <div
            className={styles.imageModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <img src={selectedImage} alt="Evidence" />
          </div>
        </div>
      )}

      {selectedReport && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedReport(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Content Takedown Details</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedReport(null)}
              >
                ✕
              </button>
            </div>

            <div className={styles.detailsGrid}>
              <p>
                <strong>Type:</strong>{" "}
                {TYPE_LABELS[selectedReport.request_type] ||
                  selectedReport.request_type}
              </p>
              <p>
                <strong>Volunteer assign model:</strong>{" "}
                {VOLUNTEER_MODEL[selectedReport.request_type]}
              </p>
              <p>
                <strong>Victim:</strong> {selectedReport.full_name}
              </p>
              <p>
                <strong>Gender:</strong> {selectedReport.gender}
              </p>
              <p>
                <strong>Phone:</strong> {selectedReport.contact_phone || "—"}
              </p>
              <p>
                <strong>Email:</strong> {selectedReport.contact_email || "—"}
              </p>
              <p>
                <strong>Platforms:</strong> {selectedReport.platforms}
              </p>
              <p>
                <strong>URLs:</strong> {selectedReport.content_urls || "—"}
              </p>
              <p>
                <strong>Discovered:</strong>{" "}
                {selectedReport.discovered_date || "—"}
              </p>
              <p>
                <strong>Category:</strong>{" "}
                {selectedReport.content_category || "—"}
              </p>
              <p>
                <strong>Wants counselling chat:</strong>{" "}
                {selectedReport.want_counselling_chat ? (
                  <span className={styles.chatYes}>YES — open group chat</span>
                ) : (
                  "No"
                )}
              </p>
              <p>
                <strong>Chat ID:</strong> {selectedReport.chat_id || "—"}
              </p>
              <p>
                <strong>Hash sharing allowed:</strong>{" "}
                {selectedReport.allow_hash_sharing ? "Yes" : "No"}
              </p>
              <p>
                <strong>Status:</strong> {selectedReport.status}
              </p>
              <p className={styles.fullWidth}>
                <strong>Incident:</strong>
                <br />
                {selectedReport.incident_description}
              </p>
              <p className={styles.fullWidth}>
                <strong>Suspect / source:</strong>
                <br />
                {selectedReport.suspect_details || "—"}
              </p>
              <p className={styles.fullWidth}>
                <strong>Remarks:</strong>
                <br />
                {selectedReport.remarks || "—"}
              </p>
              {selectedReport.want_counselling_chat && (
                <div className={`${styles.fullWidth} ${styles.infoBox}`}>
                  <strong>How to chat with this user</strong>
                  <ul>
                    <li>
                      Victim is already in the counselling group chat with all
                      admins.
                    </li>
                    <li>
                      Approve the volunteer application, then use{" "}
                      <strong>Volunteer → Assign Volunteer</strong> and select{" "}
                      <strong>
                        {VOLUNTEER_MODEL[selectedReport.request_type]}
                      </strong>
                      .
                    </li>
                    <li>
                      Assigned volunteers are auto-added to this chat and future
                      chats of the same type.
                    </li>
                  </ul>
                </div>
              )}
              {selectedReport.supporting_documents?.length > 0 && (
                <div className={styles.fullWidth}>
                  <strong>Documents</strong>
                  <div className={styles.docRow}>
                    {selectedReport.supporting_documents.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`doc-${i}`}
                        className={styles.thumbnail}
                        onClick={() => setSelectedImage(url)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h3>Delete this report?</h3>
            <p>This cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className={styles.deleteBtn} onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetContentTakedowns;
