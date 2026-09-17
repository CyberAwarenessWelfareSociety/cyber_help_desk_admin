import { useEffect, useState } from "react";
import { FaEye, FaSync, FaPlus, FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FilterComponent from "../../components/Filter/Filter";
import styles from "./ApiKey.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8600/api";

const ClientWalletDetailsModal = ({ isOpen, onClose, wallet }) => {
  if (!wallet) return null;

  const excludedKeys = ["id", "client_id", "createdAt", "updatedAt", "Client"];
  const walletDetails = Object.entries(wallet).filter(
    ([key]) => !excludedKeys.some((excluded) => key.toLowerCase().includes(excluded))
  );

  const formatKey = (key) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return value.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${styles.card} sm:max-w-[600px] p-4`}>
        <DialogHeader>
          <DialogTitle className="text-black">Wallet Details</DialogTitle>
          <DialogDescription className="text-black">
            View details for wallet ID {wallet.id}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid gap-4 py-4">
            {walletDetails.filter(([key]) => !excludedKeys.includes(key)).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 items-center gap-4">
                <span className="col-span-1 font-medium text-black">{formatKey(key)}:</span>
                <span className="col-span-2 text-black">{formatValue(value)}</span>
              </div>
            ))}
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="col-span-1 font-medium text-black">Client Name:</span>
              <span className="col-span-2 text-black">{wallet.Client?.name || "N/A"}</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="col-span-1 font-medium text-black">Client Type:</span>
              <span className="col-span-2 text-black">{wallet.Client?.client_type || "N/A"}</span>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const RechargeModal = ({ isOpen, onClose, clients, fetchWallets }) => {
  const [rechargeData, setRechargeData] = useState({
    client_id: "",
    amount: "",
    mode: "online",
    method: "credit_card",
    transaction_id: "",
    merchant_id: "",
    merchant_transaction_id: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRechargeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${API_URL}/client-payments-recharge`,
        rechargeData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Recharge created successfully");
      fetchWallets();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create recharge");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${styles.card} sm:max-w-[600px] p-4`}>
        <DialogHeader>
          <DialogTitle className="text-black">Create Recharge</DialogTitle>
          <DialogDescription className="text-black">
            Enter details for the recharge
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">Client Name:</label>
            <select
              name="client_id"
              value={rechargeData.client_id}
              onChange={handleInputChange}
              className={`${styles.searchInput} col-span-2`}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">Amount:</label>
            <Input
              type="number"
              name="amount"
              value={rechargeData.amount}
              onChange={handleInputChange}
              className={`${styles.searchInput} col-span-2`}
              placeholder="Enter amount"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">Mode:</label>
            <select
              name="mode"
              value={rechargeData.mode}
              onChange={handleInputChange}
              className={`${styles.searchInput} col-span-2`}
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">Method:</label>
            <select
              name="method"
              value={rechargeData.method}
              onChange={handleInputChange}
              className={`${styles.searchInput} col-span-2`}
            >
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="net_banking">Net Banking</option>
              <option value="upi">UPI</option>
            </select>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">Transaction ID:</label>
            <Input
              name="transaction_id"
              value={rechargeData.transaction_id}
              onChange={handleInputChange}
              className={`${styles.searchInput} col-span-2`}
              placeholder="Enter transaction ID"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">Merchant ID:</label>
            <Input
              name="merchant_id"
              value={rechargeData.merchant_id}
              onChange={handleInputChange}
              className={`${styles.searchInput} col-span-2`}
              placeholder="Enter merchant ID"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">Merchant Transaction ID:</label>
            <Input
              name="merchant_transaction_id"
              value={rechargeData.merchant_transaction_id}
              onChange={handleInputChange}
              className={`${styles.searchInput} col-span-2`}
              placeholder="Enter merchant transaction ID"
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

const Client_Wallet = () => {
  const [wallets, setWallets] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const filterConfig = [
    {
      key: "client_type",
      label: "Client Type",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "USER", label: "User" },
        { value: "POLICE", label: "Police" },
        { value: "ADMIN", label: "Admin" },
      ],
    },
  ];

  useEffect(() => {
    fetchWallets();
    fetchClients();
  }, [pagination.page, pagination.pageSize, filters]);

  const token = localStorage.getItem("token");

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.pageSize,
        ...filters,
        search: searchQuery,
      };
      const response = await axios.get(
        `${API_URL}/get-Client_Wallet`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          params: queryParams,
        }
      );
      setWallets(response.data.data || []);
      setPagination({
        page: response.data.page || 1,
        pageSize: response.data.pageSize || 10,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch wallets");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/get-Client`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: "all",
          },
        }
      );
      setClients(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch clients");
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  const handleRefresh = () => {
    fetchWallets();
    fetchClients();
  };

  const handleViewDetails = (wallet) => {
    setSelectedWallet(wallet);
    setIsDetailsModalOpen(true);
  };

  const handleOpenRechargeModal = () => {
    setIsRechargeModalOpen(true);
  };

  const toolbarRight = (
    <>
      <button className={styles.iconButton} onClick={handleRefresh}>
        <FaSync />
      </button>
    </>
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>Client Wallets</h2>
          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              <Input
                type="text"
                className={styles.searchInput}
                placeholder="Search wallets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={handleOpenRechargeModal}
              className={`${styles.addBtn} bg-green-600 hover:bg-green-700`}
            >
              <FaPlus /> Create Recharge
            </button>
          </div>
        </div>

        <div className={styles.table}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Client Name</th>
                <th>Client Type</th>
                <th>Balance</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className={styles.loadingCell}>
                    <div className={styles.spinnerContainer}>
                      <div className={styles.customSpinner}></div>
                    </div>
                  </td>
                </tr>
              ) : wallets.length > 0 ? (
                wallets.map((wallet) => (
                  <tr key={wallet.id}>
                    <td>{wallet.Client?.name || "N/A"}</td>
                    <td>{wallet.Client?.client_type || "N/A"}</td>
                    <td
                      className={`${
                        wallet.balance.startsWith("-") ? styles.failed :
                        wallet.balance === "0.00" ? styles.zeroBalance :
                        styles.positiveBalance
                      }`}
                    >
                      ₹{wallet.balance}
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewDetails(wallet)}
                        className={`${styles.actionBtn} ${styles.edit}`}
                        aria-label="View Details"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className={styles.noData}>
                    No wallets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.paginationContainer}>
          <div className={styles.pageInfo}>
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
            {pagination.total} wallets
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

        <ClientWalletDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedWallet(null);
          }}
          wallet={selectedWallet}
        />
        <RechargeModal
          isOpen={isRechargeModalOpen}
          onClose={() => {
            setIsRechargeModalOpen(false);
          }}
          clients={clients}
          fetchWallets={fetchWallets}
        />
      </div>
    </div>
  );
};

export default Client_Wallet;