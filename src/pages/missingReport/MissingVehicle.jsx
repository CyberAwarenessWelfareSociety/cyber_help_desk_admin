import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";           // ← Added for better UX
import styles from "./MissingVehicles.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8600/api";

const MissingVehicles = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
const token = localStorage.getItem("token");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/missingVehicles`, {
        page,
        limit: 10,
        search,
        is_approved: false,
      });

      setData(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, search]);

  // ====================== UPDATED LOGIC: Approve + Deduct ₹20 ======================
  const updateStatus = async (id, status, client_id) => {
    if (!window.confirm(`Are you sure you want to ${status ? "approve" : "reject"} this vehicle report?`)) {
      return;
    }

    if (status === true && !client_id) {
      toast.error("Client ID not found. Cannot deduct service fee.");
      return;
    }

    try {
      // Step 1: Update approval status
      await axios.put(`${API_URL}/update-missing-vehicle/${id}`, {
        is_approved: status,
        money: status === true ? 20 : 0,   // ₹20 fee for approval, no change for rejection
      });

      // Step 2: If approved → Deduct ₹20 from client's wallet
      if (status === true && client_id) {
        await axios.post(
          `${API_URL}/client-payments-recharge`,   // Same endpoint used in wallet for recharge/deduction
          {
            client_id: client_id,
            amount: 20,                         // Positive amount = recharge,
            mode: "system",
            method: "service_fee",
            transaction_id: `vehicle-approval-${id}-${Date.now()}`,  // Unique transaction ID
            description: "Service fee for approving missing vehicle report",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
      
        );

        toast.success("Vehicle approved successfully. ₹20 service fee Added to client wallet.");
      } else if (status === false) {
        toast.success("Vehicle report rejected successfully.");
      }

      fetchVehicles();                    // Refresh the list
      if (selectedVehicle?.id === id) setSelectedVehicle(null);

    } catch (err) {
      console.error("Update error:", err);
      toast.error(status ? "Failed to approve vehicle or deduct fee" : "Failed to reject vehicle");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🚗 Missing Vehicles</h1>
        <p className={styles.subtitle}>
          Review and verify reported missing/stolen vehicle cases
        </p>
      </div>

      {/* Search */}
      <div className={styles.topBar}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by registration no, make, model, FIR or complainant..."
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
                <th>Registration No</th>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Complainant</th>
                <th>State</th>
                <th>Police Station</th>
                <th>Status</th>
                <th className={styles.actionHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className={styles.loadingRow}>
                    <div className={styles.loader}>Loading vehicle records...</div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className={styles.regNo}>{item.vehicle_registration_no}</td>
                    <td>
                      <strong>{item.vehicle_make}</strong> {item.vehicle_model}
                    </td>
                    <td>{item.vehicle_type}</td>
                    <td>{item.complainant}</td>
                    <td>{item.state}</td>
                    <td>{item.police_station}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${item.missing_status?.toLowerCase() === 'stolen' ? styles.stolen : styles.missing}`}>
                        {item.missing_status || "Pending"}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => setSelectedVehicle(item)}
                      >
                        👁️ View Details
                      </button>

                      <button
                        className={styles.acceptBtn}
                        onClick={() => updateStatus(item.id, true, item.client_id)}
                      >
                        ✅ Approve (₹20)
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
                  <td colSpan="8" className={styles.noData}>
                    No missing vehicle records found
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

      {/* Details Modal */}
      {selectedVehicle && (
        <div className={styles.modalOverlay} onClick={() => setSelectedVehicle(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>🚗 Vehicle Details</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedVehicle(null)}>
                ✕
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.infoGrid}>
                <div className={styles.infoColumn}>
                  <h4>Vehicle Information</h4>
                  <p><strong>Registration No:</strong> {selectedVehicle.vehicle_registration_no}</p>
                  <p><strong>Make & Model:</strong> {selectedVehicle.vehicle_make} {selectedVehicle.vehicle_model}</p>
                  <p><strong>Type:</strong> {selectedVehicle.vehicle_type}</p>
                  <p><strong>Color:</strong> {selectedVehicle.vehicle_color}</p>
                  <p><strong>Engine No:</strong> {selectedVehicle.engine_no || "—"}</p>
                  <p><strong>Chassis No:</strong> {selectedVehicle.chasis_no || "—"}</p>
                </div>

                <div className={styles.infoColumn}>
                  <h4>Complaint Details</h4>
                  <p><strong>Complainant:</strong> {selectedVehicle.complainant}</p>
                  <p><strong>Phone:</strong> {selectedVehicle.complainant_phone || "—"}</p>
                  <p><strong>Address:</strong> {selectedVehicle.address || "—"}</p>
                  <p><strong>FIR No:</strong> {selectedVehicle.fir_no || "—"}</p>
                  <p><strong>FIR Date:</strong> {selectedVehicle.fir_date || "—"}</p>
                  <p><strong>Stolen Date:</strong> {selectedVehicle.stolen_date || "—"}</p>
                  <p><strong>Stolen From:</strong> {selectedVehicle.stolen_from || "—"}</p>
                </div>

                <div className={styles.infoColumn}>
                  <h4>Location Details</h4>
                  <p><strong>State:</strong> {selectedVehicle.state}</p>
                  <p><strong>District:</strong> {selectedVehicle.district}</p>
                  <p><strong>Police Station:</strong> {selectedVehicle.police_station}</p>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              {!selectedVehicle.is_approved && (
                <>
                  <button
                    className={styles.acceptBtn}
                    onClick={() => updateStatus(selectedVehicle.id, true, selectedVehicle.client_id)}
                  >
                    ✅ Approve (Deduct ₹20)
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => updateStatus(selectedVehicle.id, false)}
                  >
                    ❌ Reject
                  </button>
                </>
              )}
              <button className={styles.closeModalBtn} onClick={() => setSelectedVehicle(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissingVehicles;