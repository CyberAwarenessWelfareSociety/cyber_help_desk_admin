import styles from "./bulk.module.css";
import {
  FaSearch,
  FaSync,
  FaWallet,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../Utils/api";
import Table from "@/components/Table/Table";

const GrantAccessModal = ({ isOpen, onClose, client, fetchClients }) => {
  // ... (Your existing GrantAccessModal code - unchanged)
  const [form, setForm] = useState({
    client_id: "",
    duration_days: 30,
    purchase_amount: 199,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setForm((prev) => ({ ...prev, client_id: client.id }));
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "duration_days" || name === "purchase_amount"
        ? Number(value) || 0
        : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.duration_days || form.purchase_amount <= 0) {
      toast.error("Please fill all fields correctly");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await api.post("/police/admin/grant-bulk-check-access", form, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Bulk Check access granted successfully!");
      fetchClients();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to grant access");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <h2 className={styles.modalTitle}>Grant Bulk Check Access</h2>

        <div className={styles.clientInfo}>
          <strong>Client:</strong> {client.name} ({client.phone})
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Duration (Days)</label>
            <input
              type="number"
              name="duration_days"
              value={form.duration_days}
              onChange={handleChange}
              className={styles.modalInput}
              min="1"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Purchase Amount (₹)</label>
            <input
              type="number"
              name="purchase_amount"
              value={form.purchase_amount}
              onChange={handleChange}
              className={styles.modalInput}
              min="1"
            />
          </div>
        </div>

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.cancelBtn} disabled={loading}>
            Cancel
          </button>
          <button onClick={handleSubmit} className={styles.primaryBtn} disabled={loading}>
            {loading ? "Granting Access..." : "Grant Access"}
          </button>
        </div>
      </div>
    </div>
  );
};

const BulkCheckClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearch,
        page: pagination.page,
        limit: pagination.pageSize,
      };

      const res = await api.get("/police/bulk-check-clients", { params });
      setClients(res.data?.data || []);
      setPagination((prev) => ({
        ...prev,
        total: res.data?.total || 0,
        totalPages: res.data?.totalPages || 1,
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [pagination.page, pagination.pageSize, debouncedSearch]);

  // ===================== Toggle Bulk Check Access =====================
  // Enabling must set subscriptionEndsAt (via grant). Toggling only
  // bulk_check_access=true with null ends_at is treated as expired and
  // forces purchase on the app.
  const toggleBulkAccess = async (client) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = !client.bulk_check_access;

      if (newStatus) {
        // Grant 30-day subscription with a real end date
        await api.post(
          "/police/admin/grant-bulk-check-access",
          {
            client_id: client.id,
            duration_days: 30,
            purchase_amount: 199,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        toast.success("Bulk Check access enabled for 30 days");
      } else {
        // Revoke: clear access + end date
        await api.put(
          `/update-client/${client.id}`,
          {
            bulk_check_access: false,
            bulk_check_subscription_ends_at: null,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        toast.success("Bulk Check access disabled");
      }

      fetchClients();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to update access",
      );
    }
  };

  const handleGrantAccess = (client) => {
    setSelectedClient(client);
    setGrantModalOpen(true);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>Bulk Check Clients</h2>
          <div className={styles.topBarActions}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className={styles.iconButton} onClick={fetchClients}>
              <FaSync />
            </button>
          </div>
        </div>

        <Table title="">
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Client Type</th>
                  <th>Bulk Check Access</th>
                  <th>Subscription Ends</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className={styles.loadingCell}>
                      <div className={styles.spinnerContainer}>
                        <div className={styles.customSpinner}></div>
                      </div>
                    </td>
                  </tr>
                ) : clients.length > 0 ? (
                  clients.map((client) => (
                    <tr key={client.id}>
                      <td>{client.name}</td>
                      <td>{client.phone}</td>
                      <td>{client.email}</td>
                      <td>{client.client_type}</td>

                      {/* ==================== TOGGLE ==================== */}
                      <td>
                        <label className={styles.toggleWrapper}>
                          <input
                            type="checkbox"
                            checked={!!client.bulk_check_access}
                            onChange={() => toggleBulkAccess(client)}
                            className={styles.toggleInput}
                          />
                          <div className={styles.toggleSlider}>
                            <div className={styles.toggleKnob}></div>
                          </div>
                        </label>
                      </td>

                      <td>
                        {client.bulk_check_subscription_ends_at
                          ? new Date(client.bulk_check_subscription_ends_at).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <button
                          className={`${styles.actionBtn} ${styles.grantAccessBtn}`}
                          onClick={() => handleGrantAccess(client)}
                        >
                          <FaWallet /> Grant Access
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className={styles.noData}>
                      No clients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination remains same */}
          <div className={styles.paginationContainer}>
            <div className={styles.pageInfo}>
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
              {pagination.total} clients
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

              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={styles.pageButton}
              >
                Previous
              </button>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={styles.pageButton}
              >
                Next
              </button>
            </div>
          </div>
        </Table>
      </div>

      <GrantAccessModal
        isOpen={grantModalOpen}
        onClose={() => {
          setGrantModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        fetchClients={fetchClients}
      />
    </div>
  );
};

export default BulkCheckClients;