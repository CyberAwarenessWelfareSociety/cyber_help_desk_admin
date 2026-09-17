import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";        // Added for better feedback
import styles from "./UnidentifiedDeadBodies.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8600/api";

const UnidentifiedDeadBodies = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
const token = localStorage.getItem("token");
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/unidentifiedDeadBodies`, {
        page,
        limit: 10,
        search,
        is_approved: false,
      });

      setData(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load unidentified dead bodies");
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
    if (!window.confirm(`Are you sure you want to ${status ? "approve" : "reject"} this case?`)) return;

    if (status === true && !client_id) {
      toast.error("Client ID not found. Cannot deduct service fee.");
      return;
    }

    try {
      // Step 1: Update approval status
      await axios.put(`${API_URL}/update-unidentified-dead-body/${id}`, {
        is_approved: status,
        money: status === true ? 20 : 0,   // ₹20 fee for approval, no change for rejection
      });

      // Step 2: If approved → Deduct ₹20 from client's wallet
      if (status === true && client_id) {
 await axios.post(
  `${API_URL}/client-payments-recharge`,
  {
    client_id: client_id,
    amount: 20, // ₹20 fee for approval
    mode: "system",
    method: "service_fee",
    transaction_id: `uidb-approval-${id}-${Date.now()}`,
    description: "Service fee for approving unidentified dead body case",
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

        toast.success("Unidentified dead body case approved successfully. ₹20 service fee Added to client wallet.");
      } else if (status === false) {
        toast.success("Unidentified dead body case rejected successfully.");
      }

      fetchData();                     // Refresh the list
      if (selectedItem && selectedItem.id === id) setSelectedItem(null);

    } catch (err) {
      console.error("Update error:", err);
      toast.error(
        status 
          ? "Failed to approve case or deduct fee" 
          : "Failed to reject case"
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>⚰️ Unidentified Dead Bodies</h1>
        <p className={styles.subtitle}>
          Review and verify reported unidentified deceased persons
        </p>
      </div>

      {/* Search */}
      <div className={styles.topBar}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by UIDB number, place, gender..."
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
                <th>Photo</th>
                <th>Gender</th>
                <th>Age Range</th>
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
                    <td>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt="Unidentified body"
                          className={styles.thumbnail}
                          onClick={() => setSelectedImage(item.image_url)}
                        />
                      ) : (
                        <div className={styles.noImage}>No Photo</div>
                      )}
                    </td>
                    <td className={styles.gender}>{item.gender}</td>
                    <td>{item.age_from} - {item.age_to}</td>
                    <td>{item.state}</td>
                    <td>{item.police_station}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${item.is_approved ? styles.approved : styles.pending}`}>
                        {item.is_approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => setSelectedItem(item)}
                      >
                        👁️ View Details
                      </button>
                      <button
                        className={styles.acceptBtn}
                        onClick={() => updateStatus(item.id, true, item.client_id)}
                      >
                        ✅ Accept (₹20)
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
                    No unidentified dead body records found
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
            <button className={styles.closeBtn} onClick={() => setSelectedImage(null)}>
              ✕
            </button>
            <img src={selectedImage} alt="Unidentified body - Full view" />
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Case Details</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedItem(null)}>
                ✕
              </button>
            </div>

            <div className={styles.detailsGrid}>
              {selectedItem.image_url && (
                <div className={styles.detailImage}>
                  <img
                    src={selectedItem.image_url}
                    alt="body"
                    onClick={() => setSelectedImage(selectedItem.image_url)}
                  />
                </div>
              )}

              <div className={styles.detailContent}>
                <p><strong>UIDB Serial No:</strong> {selectedItem.uidb_serial_number}</p>
                <p><strong>Found Place:</strong> {selectedItem.found_place}</p>
                <p><strong>Found Date:</strong> {selectedItem.found_date}</p>
                <p><strong>Gender:</strong> {selectedItem.gender}</p>
                <p><strong>Age Range:</strong> {selectedItem.age_from} - {selectedItem.age_to} years</p>
                <p><strong>Height:</strong> {selectedItem.height}</p>
                <p><strong>Build:</strong> {selectedItem.build}</p>
                <p><strong>Complexion:</strong> {selectedItem.complexion}</p>

                <div className={styles.dressInfo}>
                  <p><strong>Upper Dress:</strong> {selectedItem.dress_upper} ({selectedItem.dress_upper_color})</p>
                  <p><strong>Lower Dress:</strong> {selectedItem.dress_lower} ({selectedItem.dress_lower_color})</p>
                </div>

                <p><strong>Remarks:</strong> {selectedItem.remarks || "No remarks"}</p>
              </div>
            </div>

            <div className={styles.modalActions}>
              {!selectedItem.is_approved && (
                <>
                  <button
                    className={styles.acceptBtn}
                    onClick={() => updateStatus(selectedItem.id, true, selectedItem.client_id)}
                  >
                    ✅ Accept Case (₹20)
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => updateStatus(selectedItem.id, false)}
                  >
                    ❌ Reject Case
                  </button>
                </>
              )}
              <button className={styles.closeModalBtn} onClick={() => setSelectedItem(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnidentifiedDeadBodies;