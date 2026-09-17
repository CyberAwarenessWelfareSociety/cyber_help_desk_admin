import styles from "./ApiKey.module.css";
import { FaSearch, FaSync, FaWallet } from "react-icons/fa";
import Table from "../../components/Table/Table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../Utils/api";
import FilterComponent from "../../components/Filter/Filter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const VendorPaymentModal = ({ isOpen, onClose, vendorId, vendorName, fetchOutstandings }) => {
  const [paymentData, setPaymentData] = useState({
    vendor_id: vendorId || "",
    vendor_name: vendorName || "",
    amount: "",
    mode: "ONLINE",
    method: "prepaid",
    notes: "",
  });

  useEffect(() => {
    setPaymentData((prev) => ({
      ...prev,
      vendor_id: vendorId,
      vendor_name: vendorName,
    }));
  }, [vendorId, vendorName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/vendor-payments",
        {
          vendor_name: paymentData.vendor_name,
          amount: parseFloat(paymentData.amount),
          mode: paymentData.mode,
          method: paymentData.method,
          notes: paymentData.notes,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Payment created successfully");
      fetchOutstandings();
      onClose();
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Failed to create payment");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${styles.card} sm:max-w-[600px] p-4`}>
        <DialogHeader>
          <DialogTitle className="text-black">Create Vendor Payment</DialogTitle>
          <DialogDescription className="text-black">
            Enter details for the vendor payment for {vendorName || "vendor"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">Vendor Name:</label>
            <Input
              name="vendor_name"
              value={paymentData.vendor_name}
              readOnly
              className={`${styles.searchInput} col-span-2 bg-gray-100 cursor-not-allowed`}
              placeholder="Vendor name"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">Amount:</label>
            <Input
              type="number"
              name="amount"
              value={paymentData.amount}
              onChange={handleInputChange}
              className={`${styles.searchInput} col-span-2`}
              placeholder="Enter amount"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">Mode:</label>
            <select
              name="mode"
              value={paymentData.mode}
              onChange={handleInputChange}
              className={`${styles.searchInput} col-span-2`}
            >
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">Method:</label>
            <select
              name="method"
              value={paymentData.method}
              onChange={handleInputChange}
              className={`${styles.searchInput} col-span-2`}
            >
              <option value="prepaid">Prepaid</option>
              <option value="postpaid">Postpaid</option>
              <option value="credit_card">Credit Card</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">Notes:</label>
            <Input
              name="notes"
              value={paymentData.notes}
              onChange={handleInputChange}
              className={`${styles.searchInput} col-span-2`}
              placeholder="Enter notes (e.g., Payment for invoice #123)"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className={styles.actionBtn}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className={`${styles.actionBtn} bg-green-600 hover:bg-green-700`}>
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const VendorOutStanding = () => {
  const [outstandings, setOutstandings] = useState([]);
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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState({ id: null, name: null });

  const filterConfig = [
    {
      key: "vendor_name",
      label: "Vendor Name",
      type: "text",
      placeholder: "Enter vendor name",
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
    fetchOutstandings();
  }, [pagination.page, pagination.pageSize, filter, debouncedSearch]);

  const fetchOutstandings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const queryParams = {
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch,
        ...cleanFilters(filter),
      };

      const response = await api.get("/get-vendor_outstanding", {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams,
      });

      setOutstandings(response.data?.data || []);
      setPagination({
        page: response.data?.page || 1,
        pageSize: response.data?.pageSize || 10,
        total: response.data?.total || 0,
        totalPages: response.data?.totalPages || 1,
      });
    } catch (error) {
      console.error("Error fetching vendor outstandings:", error);
      toast.error("Failed to fetch vendor outstandings");
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

  const handlePaymentClick = (vendorId, vendorName) => {
    setSelectedVendor({ id: vendorId, name: vendorName });
    setIsPaymentModalOpen(true);
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
    fetchOutstandings();
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
          <h2 className={styles.cardTitle}>Vendor Outstanding</h2>
          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
                <th>Outstanding Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className={styles.loadingCell}>
                    <div className={styles.spinnerContainer}>
                      <div className={styles.customSpinner}></div>
                    </div>
                  </td>
                </tr>
              ) : outstandings.length > 0 ? (
                outstandings.map((outstanding) => (
                  <tr key={outstanding.id}>
                    <td className={styles.noWrapText}>{outstanding.vendor_name || "N/A"}</td>
                    <td
                      className={`${
                        outstanding.outstanding_balance.startsWith("-") ? styles.failed :
                        outstanding.outstanding_balance === "0.0000" ? styles.zeroBalance :
                        styles.positiveBalance
                      }`}
                    >
                      ₹{parseFloat(outstanding.outstanding_balance).toFixed(2)}
                    </td>
                    <td>
                      <button
                        className={`${styles.actionBtn} bg-green-600 hover:bg-green-700`}
                        onClick={() => handlePaymentClick(outstanding.id, outstanding.vendor_name)}
                        aria-label="Pay Vendor"
                      >
                        <FaWallet />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={styles.noData}>
                    No outstanding balances found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className={styles.paginationContainer}>
            <div className={styles.pageInfo}>
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
              {pagination.total} outstandings
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
      <VendorPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedVendor({ id: null, name: null });
        }}
        vendorId={selectedVendor.id}
        vendorName={selectedVendor.name}
        fetchOutstandings={fetchOutstandings}
      />
    </div>
  );
};

export default VendorOutStanding;