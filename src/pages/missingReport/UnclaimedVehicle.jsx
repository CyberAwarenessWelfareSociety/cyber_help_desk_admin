import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";   // Added for better feedback
import styles from "./UnclaimedSeizedVehicles.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8600/api";

const UnclaimedSeizedVehicles = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedItem, setSelectedItem] = useState(null);
const token = localStorage.getItem("token");
  // =========================
  // FETCH DATA
  // =========================
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/unclaimedSeizedVehicles`, {
        page,
        limit: 10,
        search,
        is_approved: false,
      });

      setData(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load seized vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  // =========================
  // UPDATED: Approve + Deduct ₹200
  // =========================
  const updateStatus = async (id, status, client_id) => {
    if (!window.confirm(`Are you sure you want to ${status ? "approve" : "reject"} this seized vehicle?`)) {
      return;
    }

    if (status === true && !client_id) {
      toast.error("Client ID not found. Cannot deduct service fee.");
      return;
    }

    try {
      // Step 1: Update approval status
      await axios.put(`${API_URL}/update-unclaimed-seized-vehicle/${id}`, {
        is_approved: status,
        money: status === true ? 200 : 0,   // ₹200 fee for approval, no change for rejection
      });

      // Step 2: If approved → Deduct ₹200 from client's wallet
      if (status === true && client_id) {
        await axios.post(
          `${API_URL}/client-payments-recharge`,
          {
            client_id: client_id,
            amount: 200,                         
            mode: "system",
            method: "service_fee",
            transaction_id: `vehicle-approval-${id}-${Date.now()}`,
            description: "Service fee for approving unclaimed seized vehicle",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Seized vehicle approved successfully. ₹200 service fee Added to client wallet.");
      } else if (status === false) {
        toast.success("Seized vehicle report rejected successfully.");
      }

      fetchData();                       // Refresh list
      if (selectedItem?.id === id) setSelectedItem(null);

    } catch (err) {
      console.error("Update error:", err);
      toast.error(
        status 
          ? "Failed to approve vehicle or deduct fee" 
          : "Failed to reject vehicle"
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🚓 Unclaimed Seized Vehicles</h1>
        <p className={styles.subtitle}>
          Review and approve/reject unclaimed seized vehicle cases
        </p>
      </div>

      {/* Search */}
      <div className={styles.topBar}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by vehicle type, make, district, DD No..."
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
                <th>Vehicle Type</th>
                <th>Make / Model</th>
                <th>District</th>
                <th>Police Station</th>
                <th>DD No</th>
                <th>Status</th>
                <th className={styles.actionHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className={styles.loadingRow}>
                    <div className={styles.loader}>Loading seized vehicles...</div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td>{item.vehicle_type}</td>
                    <td>
                      <strong>{item.vehicle_make}</strong> {item.vehicle_model || ""}
                    </td>
                    <td>{item.district}</td>
                    <td>{item.police_station}</td>
                    <td className={styles.ddNo}>{item.dd_no}</td>
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
                        onClick={() => updateStatus(item.id, true, item.client_id)}
                      >
                        ✅ Approve (₹200)
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
                    No unclaimed seized vehicles found
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
      {selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>🚓 Seized Vehicle Details</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedItem(null)}>
                ✕
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.infoGrid}>
                <div className={styles.infoColumn}>
                  <h4>Vehicle Information</h4>
                  <p><strong>Vehicle Type:</strong> {selectedItem.vehicle_type}</p>
                  <p><strong>Make:</strong> {selectedItem.vehicle_make}</p>
                  <p><strong>Model:</strong> {selectedItem.vehicle_model || "—"}</p>
                  <p><strong>Color:</strong> {selectedItem.vehicle_color || "—"}</p>
                  <p><strong>Engine No:</strong> {selectedItem.engine_no || "—"}</p>
                  <p><strong>Chassis No:</strong> {selectedItem.chasis_no || "—"}</p>
                </div>

                <div className={styles.infoColumn}>
                  <h4>Location &amp; DD Details</h4>
                  <p><strong>State:</strong> {selectedItem.state}</p>
                  <p><strong>District:</strong> {selectedItem.district}</p>
                  <p><strong>Police Station:</strong> {selectedItem.police_station}</p>
                  <p><strong>DD No:</strong> {selectedItem.dd_no}</p>
                  <p><strong>DD Date:</strong> {selectedItem.dd_date || "—"}</p>
                  <p><strong>Created On:</strong> {selectedItem.created_on || "—"}</p>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              {!selectedItem.is_approved && (
                <>
                  <button
                    className={styles.acceptBtn}
                    onClick={() => updateStatus(selectedItem.id, true, selectedItem.client_id)}
                  >
                    ✅ Approve (Deduct ₹200)
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => updateStatus(selectedItem.id, false)}
                  >
                    ❌ Reject
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

export default UnclaimedSeizedVehicles;