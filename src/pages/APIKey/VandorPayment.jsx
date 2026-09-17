import styles from "./ApiKey.module.css";
import { FaSearch, FaSync, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Table from "../../components/Table/Table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../Utils/api";
import FilterComponent from "../../Components/Filter/Filter";
import Pagination from "./Pagination";
import AddClient from "./AddClient";
import EditClient from "./EditClient";

const VandorPayment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [showAdd, setShowAdd] = useState(false);
  const [editPayment, setEditPayment] = useState(null);

  const filterConfig = [
    {
      key: "mode",
      label: "Mode",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "ONLINE", label: "Online" },
        { value: "OFFLINE", label: "Offline" },
      ],
    },
    {
      key: "method",
      label: "Method",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "prepaid", label: "Prepaid" },
        { value: "postpaid", label: "Postpaid" },
        { value: "credit_card", label: "Credit Card" },
        { value: "upi", label: "UPI" },
        { value: "bank_transfer", label: "Bank Transfer" },
      ],
    },
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchPayments();
  }, [pagination.page, pagination.pageSize, filter, debouncedSearch]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const queryParams = {
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch,
        ...cleanFilters(filter),
      };

      const response = await api.get("/get-vendor_payment", {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams,
      });

      setPayments(response.data?.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.total || 0,
        totalPages: Math.ceil((response.data?.total || 0) / pagination.pageSize),
      }));
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to fetch vendor payments");
    } finally {
      setLoading(false);
    }
  };

  const cleanFilters = (filters) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value === "") continue;
      cleaned[key] = value;
    }
    return cleaned;
  };

  const handleDelete = async (payment) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        await api.delete(`/delete-vendor_payment/${payment.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success("Payment deleted");
        fetchPayments();
      } catch (error) {
        console.error("Error deleting payment:", error);
        toast.error("Failed to delete payment");
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: newSize,
      page: 1,
    }));
  };

  const handleRefresh = () => {
    fetchPayments();
  };

  const toolbarRight = (
    <button className={styles.iconButton} onClick={handleRefresh}>
      <FaSync />
    </button>
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>Vendor Payments</h2>
          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
              <FaPlus /> Pay to Vendor
            </button>
          </div>
        </div>
        <Table
          title=""
          rightSlot={toolbarRight}
          filterContent={
            <FilterComponent
              config={filterConfig}
              values={filter}
              onChange={setFilter}
            />
          }
        >
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Vendor Name</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Method</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className={styles.loadingCell}>
                    <div className={styles.spinnerContainer}>
                      <div className={styles.customSpinner}></div>
                    </div>
                  </td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.vendor_name || "N/A"}</td>
                    <td>₹{payment.amount}</td>
                    <td>{payment.mode}</td>
                    <td>{payment.method}</td>
                    <td>{new Date(payment.date).toLocaleDateString()}</td>
                    <td>
                      <button
                        className={`${styles.actionBtn} ${styles.edit}`}
                        onClick={() => setEditPayment(payment)}
                        aria-label="Edit Payment"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.delete}`}
                        onClick={() => handleDelete(payment)}
                        aria-label="Delete Payment"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={styles.noData}>
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className={styles.paginationContainer}>
            <div className={styles.pageInfo}>
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
              {pagination.total} payments
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
              <div className="flex gap-1">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`${styles.pageButton} ${pagination.page === 1 ? "disabled" : ""}`}
                >
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`${styles.pageButton} ${pagination.page === page ? styles.active : ""}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`${styles.pageButton} ${pagination.page === pagination.totalPages ? "disabled" : ""}`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </Table>
      </div>
      {showAdd && (
        <AddClient
          onClose={() => setShowAdd(false)}
        />
      )}
      {editPayment && (
        <EditClient
          client={editPayment}
          onClose={() => setEditPayment(null)}
        />
      )}
    </div>
  );
};

export default VandorPayment;