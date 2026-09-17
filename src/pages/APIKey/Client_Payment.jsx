import { useEffect, useState } from "react";
import { FaEye, FaSync, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8600/api";

const ClientPaymentDetailsModal = ({ isOpen, onClose, payment }) => {
  if (!payment) return null;

  const excludedKeys = ["id", "client_id", "createdAt", "updatedAt", "Client"];
  const paymentDetails = Object.entries(payment).filter(
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
      <DialogContent className="sm:max-w-[600px] p-4 bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-black">Payment Details</DialogTitle>
          <DialogDescription className="text-black">
            View details for payment ID {payment.id}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid gap-4 py-4">
            {paymentDetails.filter(([key]) => !excludedKeys.includes(key)).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 items-center gap-4">
                <span className="col-span-1 font-medium text-black">{formatKey(key)}:</span>
                <span className="col-span-2 text-black">{formatValue(value)}</span>
              </div>
            ))}
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="col-span-1 font-medium text-black">Client Name:</span>
              <span className="col-span-2 text-black">{payment.Client?.name || "N/A"}</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="col-span-1 font-medium text-black">Client Type:</span>
              <span className="col-span-2 text-black">{payment.Client?.client_type || "N/A"}</span>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const RechargeModal = ({ isOpen, onClose, clients, fetchPayments }) => { // Add fetchPayments as a prop
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
      fetchPayments(); // Call fetchPayments to refresh the payments list
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create recharge");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-4 bg-white text-black">
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
              className="col-span-2 border border-gray-300 rounded-md p-1"
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
              className="col-span-2"
              placeholder="Enter amount"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">Mode:</label>
            <select
              name="mode"
              value={rechargeData.mode}
              onChange={handleInputChange}
              className="col-span-2 border border-gray-300 rounded-md p-1"
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
              className="col-span-2 border border-gray-300 rounded-md p-1"
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
              className="col-span-2"
              placeholder="Enter transaction ID"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">Merchant ID:</label>
            <Input
              name="merchant_id"
              value={rechargeData.merchant_id}
              onChange={handleInputChange}
              className="col-span-2"
              placeholder="Enter merchant ID"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">Merchant Transaction ID:</label>
            <Input
              name="merchant_transaction_id"
              value={rechargeData.merchant_transaction_id}
              onChange={handleInputChange}
              className="col-span-2"
              placeholder="Enter merchant transaction ID"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ClientPayments = () => {
  const [payments, setPayments] = useState([]);
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
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
    fetchClients();
  }, [pagination.page, pagination.pageSize]);

  const token = localStorage.getItem("token");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/get-Client_Payment`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: pagination.page,
            limit: pagination.pageSize,
          },
        }
      );
      setPayments(response.data.data || []);
      setPagination({
        page: response.data.page || 1,
        pageSize: response.data.pageSize || 10,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch payments");
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

  const handlePageSizeChange = (e) => {
    setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value), page: 1 }));
  };

  const handleRefresh = () => {
    fetchPayments();
    fetchClients();
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setIsDetailsModalOpen(true);
  };

  const handleOpenRechargeModal = () => {
    setIsRechargeModalOpen(true);
  };

  return (
    <div className="container mx-auto p-6 font-sans">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Client Payments</h2>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleOpenRechargeModal}
              className="bg-green-600 text-black hover:bg-green-700 flex items-center gap-2"
            >
              <FaPlus/> Create Recharge
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
              aria-label="Refresh"
            >
              <FaSync />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600">
                <th className="py-3 px-4 font-semibold">Client Name</th>
                <th className="py-3 px-4 font-semibold">Client Type</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Payment Type</th>
                <th className="py-3 px-4 font-semibold">Mode</th>
                <th className="py-3 px-4 font-semibold">Method</th>
                <th className="py-3 px-4 font-semibold">Transaction ID</th>
                <th className="py-3 px-4 font-semibold">View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-6 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-t-indigo-500 border-gray-200 rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-gray-200">
                    <td className="py-3 px-4">{payment.Client?.name || "N/A"}</td>
                    <td className="py-3 px-4">{payment.Client?.client_type || "N/A"}</td>
                    <td className="py-3 px-4">{payment.amount}</td>
                    <td
                      className={`py-3 px-4 ${
                        payment.status === "COMPLETED"
                          ? "text-green-600"
                          : payment.status === "PENDING"
                          ? "text-yellow-600"
                          : payment.status === "FAILED"
                          ? "text-red-600"
                          : ""
                      } font-medium`}
                    >
                      {payment.status}
                    </td>
                    <td className="py-3 px-4">{payment.payment_type}</td>
                    <td className="py-3 px-4">{payment.mode || "N/A"}</td>
                    <td className="py-3 px-4">{payment.method || "N/A"}</td>
                    <td className="py-3 px-4">{payment.transaction_id || "N/A"}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewDetails(payment)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="View Details"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-6 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
            {pagination.total} payments
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              className="border border-gray-300 rounded-md p-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
                    pagination.page === page ? "bg-blue-600 text-white" : ""
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <ClientPaymentDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
        />
        <RechargeModal
          isOpen={isRechargeModalOpen}
          onClose={() => {
            setIsRechargeModalOpen(false);
          }}
          clients={clients}
          fetchPayments={fetchPayments} // Pass fetchPayments as a prop
        />
      </div>
    </div>
  );
};

export default ClientPayments;