import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "./AccidentCases.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8600/api";

const AccidentCases = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
const token = localStorage.getItem("token");
  // Amount Modal States
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [pendingApproveId, setPendingApproveId] = useState(null);
  const [pendingClientId, setPendingClientId] = useState(null);
  const [amount, setAmount] = useState(500);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/accident-cases`, {
        params: { page, limit: 10 , status: "pending" },
      });
      setData(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load accident cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  // Open Amount Modal for Approval
  const openAmountModal = (id, client_id) => {
    if (!client_id) {
      toast.error("Client ID not found. Cannot proceed with approval.");
      return;
    }
    setPendingApproveId(id);
    setPendingClientId(client_id);
    setAmount(500);
    setShowAmountModal(true);
  };

  // Approve with Custom Amount
  const handleApproveWithAmount = async () => {
    if (!pendingApproveId || !pendingClientId) return;

    if (!window.confirm(`Approve this case and deduct ₹${amount} to client wallet?`)) {
      setShowAmountModal(false);
      return;
    }

    try {
      await axios.put(`${API_URL}/update-accident-case/${pendingApproveId}`, {
        is_approved: true,
        status: "Approved",
        money: Number(amount),
      });

      await axios.post(
  `${API_URL}/client-payments-recharge`,
  {
    client_id: pendingClientId,
    amount: Number(amount),
    mode: "system",
    method: "service_fee",
    transaction_id: `accident-approval-${pendingApproveId}-${Date.now()}`,
    description: `Service fee for approving road accident case (₹${amount})`,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      toast.success(`Accident case approved successfully. ₹${amount} Added.`);
      
      fetchData();
      if (selectedItem?.id === pendingApproveId) setSelectedItem(null);
    } catch (err) {
      console.error("Approval error:", err);
      toast.error("Failed to approve case or deduct fee");
    } finally {
      setShowAmountModal(false);
      setPendingApproveId(null);
      setPendingClientId(null);
    }
  };

  // Reject Case
  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this accident case?")) return;

    try {
      await axios.put(`${API_URL}/update-accident-case/${id}`, {
        is_approved: false,
        money: 0,
      });
      toast.success("Accident case rejected successfully.");
      fetchData();
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject case");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🚑 Accident Cases</h1>
        <p className={styles.subtitle}>
          Review and verify road accident reports
        </p>
      </div>

      {/* Table Card */}
      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Media</th>
                <th>Location</th>
                <th>Date & Time</th>
                <th>Vehicles Involved</th>
                <th>Injured</th>
                <th>Status</th>
                <th className={styles.actionHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className={styles.loadingRow}>
                    Loading accident cases...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td>
                      {item.media_files && item.media_files.length > 0 ? (
                        <img
                          src={item.media_files[0]}
                          alt="accident"
                          className={styles.thumbnail}
                          onClick={() => setSelectedImage(item.media_files[0])}
                        />
                      ) : (
                        <div className={styles.noImage}>No Media</div>
                      )}
                    </td>
                    <td>{item.accident_location}</td>
                    <td>
                      {item.accident_date}<br />
                      <small>{item.accident_time}</small>
                    </td>
                    <td className={styles.vehicles}>
                      {item.victim_vehicle_no} <strong>vs</strong><br />
                      {item.accused_vehicle_no}
                    </td>
                    <td>
                      <strong>{item.injured_count}</strong>
                    </td>
                    <td>
                      <span className={styles.statusBadge}>
                        {item.status || "Pending"}
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
                        onClick={() => openAmountModal(item.id, item.client_id)}
                      >
                        ✅ Approve
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => handleReject(item.id)}
                      >
                        ❌ Reject
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={styles.noData}>No accident cases found</td>
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
            <img src={selectedImage} alt="Accident media" />
          </div>
        </div>
      )}

      {/* Full Details Modal */}
      {selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>🚑 Accident Case Details</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedItem(null)}>✕</button>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.infoSection}>
                <h4>Incident Information</h4>
                <p><strong>Location:</strong> {selectedItem.accident_location}</p>
                <p><strong>Date:</strong> {selectedItem.accident_date}</p>
                <p><strong>Time:</strong> {selectedItem.accident_time}</p>
                <p><strong>District:</strong> {selectedItem.district}</p>
                <p><strong>City:</strong> {selectedItem.city}</p>
                {selectedItem.gps_location && (
                  <p><strong>GPS:</strong> {selectedItem.gps_location}</p>
                )}
              </div>

              <div className={styles.infoSection}>
                <h4>Vehicles Involved</h4>
                <p><strong>Victim Vehicle:</strong> {selectedItem.victim_vehicle_no}</p>
                <p><strong>Accused Vehicle:</strong> {selectedItem.accused_vehicle_no}</p>
                <p><strong>Victim Driver:</strong> {selectedItem.victim_driver_name || "—"}</p>
                <p><strong>Accused Driver:</strong> {selectedItem.accused_driver_name || "—"}</p>
                <p><strong>Driver Under Influence:</strong> {selectedItem.driver_under_influence}</p>
                
                <h4>Impact</h4>
                <p><strong>Injured Count:</strong> {selectedItem.injured_count}</p>
                <p><strong>Death Occurred:</strong> {selectedItem.death_occurred ? "Yes" : "No"}</p>
                <p><strong>Hospitalized:</strong> {selectedItem.hospitalized ? "Yes" : "No"}</p>
                {selectedItem.hospital_name && (
                  <p><strong>Hospital:</strong> {selectedItem.hospital_name}</p>
                )}
              </div>

              <div className={styles.infoSection}>
                <h4>People Involved</h4>
                <p><strong>Caller:</strong> {selectedItem.caller_name || "—"}</p>
                <p><strong>Caller Mobile:</strong> {selectedItem.caller_mobile || "—"}</p>
                <p><strong>Witness:</strong> {selectedItem.witness_name || "—"}</p>
                <p><strong>Witness Mobile:</strong> {selectedItem.witness_mobile || "—"}</p>
                <p><strong>Witness Relation:</strong> {selectedItem.witness_relation || "—"}</p>
                <p><strong>Victim Mobile:</strong> {selectedItem.victim_mobile || "—"}</p>
              </div>

              <div className={styles.infoSection}>
                <h4>Reports & Assistance</h4>
                <p><strong>FIR Number:</strong> {selectedItem.fir_number || "—"}</p>
                <p><strong>Medical Report Available:</strong> {selectedItem.medical_report_available ? "Yes" : "No"}</p>
                <p><strong>Police Called:</strong> {selectedItem.police_called ? "Yes" : "No"}</p>
                <p><strong>Victim Financial Help:</strong> {selectedItem.victim_financial_help ? "Yes" : "No"}</p>
                <p><strong>Accused Financial Help:</strong> {selectedItem.accused_financial_help ? "Yes" : "No"}</p>
              </div>
            </div>

            {/* Media Files */}
            {selectedItem.media_files && selectedItem.media_files.length > 0 && (
              <div className={styles.mediaSection}>
                <h4>Media Evidence ({selectedItem.media_files.length})</h4>
                <div className={styles.mediaGrid}>
                  {selectedItem.media_files.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Evidence ${index + 1}`}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons in Modal */}
            <div className={styles.modalActions}>
              {!selectedItem.is_approved && (
                <>
                  <button
                    className={styles.acceptBtn}
                    onClick={() => openAmountModal(selectedItem.id, selectedItem.client_id)}
                  >
                    ✅ Approve Case
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => handleReject(selectedItem.id)}
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

      {/* Amount Input Modal */}
      {showAmountModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAmountModal(false)}>
          <div className={styles.amountModal} onClick={(e) => e.stopPropagation()}>
            <h3>Enter Service Fee Amount</h3>
            <p className={styles.amountSubtitle}>
              This amount will be Added from the client's wallet.
            </p>

            <div className={styles.amountInputGroup}>
              <span className={styles.rupee}>₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={styles.amountInput}
                min="0"
                autoFocus
              />
            </div>

            <div className={styles.amountActions}>
              <button 
                className={styles.cancelBtn} 
                onClick={() => setShowAmountModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmApproveBtn} 
                onClick={handleApproveWithAmount}
              >
                Confirm & Approve (₹{amount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccidentCases;