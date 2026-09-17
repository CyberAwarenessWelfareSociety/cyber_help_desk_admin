import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";        // Added for better user feedback
import styles from "./MissingPersons.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8600/api";

const MissingPersons = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
const token = localStorage.getItem("token");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/missingPersons`, {
        page,
        limit: 8,
        search,
        is_approved: false,
      });

      setData(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load missing persons");
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
    if (!window.confirm(`Are you sure you want to ${status ? "approve" : "reject"} this missing person report?`)) {
      return;
    }

    if (status === true && !client_id) {
      toast.error("Client ID not found. Cannot deduct service fee.");
      return;
    }

    try {
      // Step 1: Update approval status
      await axios.put(`${API_URL}/update-missing-person/${id}`, {
        is_approved: status,
        money: status === true ? 20 : 0,   // ₹20 fee for approval, no change for rejection
      });

      // Step 2: If approved → Deduct ₹20 from client's wallet
      if (status === true && client_id) {
     await axios.post(
  `${API_URL}/client-payments-recharge`,
  {
    client_id: client_id,
    amount: 20, //recharge amount (positive for recharge, negative for deduction)
    mode: "system",
    method: "service_fee",
    transaction_id: `mobile-approval-${id}-${Date.now()}`,
    description: "Service fee for approving missing person report",
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

        toast.success("Missing person report approved successfully. ₹20 service fee Added to client wallet.");
      } else if (status === false) {
        toast.success("Missing person report rejected successfully.");
      }

      fetchData();                     // Refresh the list
      if (selectedPerson?.id === id) setSelectedPerson(null);

    } catch (err) {
      console.error("Update error:", err);
      toast.error(
        status 
          ? "Failed to approve report or deduct fee" 
          : "Failed to reject report"
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>👤 Missing Persons</h1>
        <p className={styles.subtitle}>
          Review and approve/reject reported missing person cases
        </p>
      </div>

      {/* Search Bar */}
      <div className={styles.topBar}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by name, district, or guardian..."
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
                <th>Name</th>
                <th>Gender</th>
                <th>Birth Year</th>
                <th>State</th>
                <th>Police Station</th>
                <th className={styles.actionHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className={styles.loadingRow}>
                    <div className={styles.loader}>Loading missing persons...</div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className={styles.thumbnail}
                          onClick={() => setSelectedImage(item.image_url)}
                        />
                      ) : (
                        <div className={styles.noImage}>No Photo</div>
                      )}
                    </td>
                    <td className={styles.name}>{item.name || "—"}</td>
                    <td>{item.gender}</td>
                    <td>{item.birth_year || "—"}</td>
                    <td>{item.state}</td>
                    <td>{item.police_station}</td>
                    <td className={styles.actions}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => setSelectedPerson(item)}
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
                  <td colSpan="7" className={styles.noData}>
                    No missing person records found
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
            <img src={selectedImage} alt="Missing Person" />
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedPerson && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPerson(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Missing Person Details</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedPerson(null)}>
                ✕
              </button>
            </div>

            <div className={styles.detailsGrid}>
              {selectedPerson.image_url && (
                <div className={styles.detailImage}>
                  <img
                    src={selectedPerson.image_url}
                    alt={selectedPerson.name}
                    onClick={() => setSelectedImage(selectedPerson.image_url)}
                  />
                </div>
              )}

              <div className={styles.detailContent}>
                <p><strong>Name:</strong> {selectedPerson.name || "—"}</p>
                <p><strong>Gender:</strong> {selectedPerson.gender}</p>
                <p><strong>Birth Year:</strong> {selectedPerson.birth_year || "—"}</p>
                <p><strong>Guardian Name:</strong> {selectedPerson.guardian_name || "—"}</p>
                <p><strong>Address:</strong> {selectedPerson.address || "—"}</p>
                <p><strong>Missing From:</strong> {selectedPerson.missing_from || "—"}</p>
                <p><strong>Reporting Date:</strong> {selectedPerson.reporting_date}</p>
                <p><strong>State:</strong> {selectedPerson.state}</p>
                <p><strong>District:</strong> {selectedPerson.district}</p>
                <p><strong>Police Station:</strong> {selectedPerson.police_station}</p>
              </div>
            </div>

            <div className={styles.modalActions}>
              {!selectedPerson.is_approved && (
                <>
                  <button
                    className={styles.acceptBtn}
                    onClick={() => updateStatus(selectedPerson.id, true, selectedPerson.client_id)}
                  >
                    ✅ Approve Report (₹20)
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => updateStatus(selectedPerson.id, false)}
                  >
                    ❌ Reject Report
                  </button>
                </>
              )}
              <button className={styles.closeModalBtn} onClick={() => setSelectedPerson(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissingPersons;