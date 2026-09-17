import styles from "./OverRidePrice.module.css";
import { FaSearch, FaSync, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import Table from "../../components/Table/Table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../Utils/api";
import FilterComponent from "../../Components/Filter/Filter";
import Pagination from "../APIKey/Pagination";
import UpdateOverRidePrice from "./UpdateOverRidePrice";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DeleteConfirmModal from "../../Components/FinalDeleteModal/DeleteConfirmModal";
import SimpleConfirmationModal from "./SampleConfirmationModal";

const AddOverRidePrice = ({ onClose, onAdd }) => {
  const [clients, setClients] = useState([]);
  const [apis, setApis] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedApi, setSelectedApi] = useState("");
  const [overridePrice, setOverridePrice] = useState("");
  const [existingPriceId, setExistingPriceId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Fetch clients
        const clientsResponse = await api.get("/get-client?limit=all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(clientsResponse.data?.data || []);
        // Fetch APIs
        const apisResponse = await api.get("/getAllApi", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApis(apisResponse.data?.serviceNames || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch clients or APIs");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const checkExistingPrice = async () => {
      if (!selectedClient || !selectedApi) {
        setOverridePrice("");
        setExistingPriceId(null);
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/get-Override_Price", {
          params: {
            client_id: selectedClient,
            api_name: selectedApi,
          },
          headers: { Authorization: `Bearer ${token}` },
        });
        const existingPrice = response.data?.data?.[0];
        if (existingPrice) {
          setOverridePrice(parseFloat(existingPrice.override_price).toFixed(2));
          setExistingPriceId(existingPrice.id);
        } else {
          setOverridePrice("");
          setExistingPriceId(null);
        }
      } catch (error) {
        console.error("Error checking existing price:", error);
        toast.error("Failed to check existing override price");
      } finally {
        setLoading(false);
      }
    };
    checkExistingPrice();
  }, [selectedClient, selectedApi]);

  const handleSubmit = async () => {
    if (!selectedClient || !selectedApi || !overridePrice) {
      toast.error("Please fill in all fields");
      return;
    }
    const formattedPrice = parseFloat(overridePrice).toFixed(2);
    if (isNaN(formattedPrice) || formattedPrice < 0) {
      toast.error("Please enter a valid price");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        client_id: selectedClient,
        api_name: selectedApi,
        override_price: formattedPrice,
      };
      if (existingPriceId) {
        // Update existing override price
        await api.put(
          `/update-override_price/${existingPriceId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          }
        );
        toast.success("Override price updated successfully");
      } else {
        // Create new override price
        await api.post(
          "/create-override_price",
          payload,
          {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          }
        );
        toast.success("Override price added successfully");
      }
      onAdd();
    } catch (error) {
      console.error("Error saving override price:", error);
      toast.error(`Failed to ${existingPriceId ? "update" : "add"} override price`);
    } finally {
      setLoading(false);
    }
  };

  const selectedApiData = apis.find((api) => api.apiName === selectedApi);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[600px] p-4 bg-white text-black`}>
        <DialogHeader>
          <DialogTitle className="text-black text-lg">
            {existingPriceId ? "Update Override Price" : "Add Override Price"}
          </DialogTitle>
          <DialogDescription className="text-black text-sm">
            {existingPriceId
              ? "Update the existing override price for the selected client and API."
              : "Select a client and API, then set a custom override price."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 flex-grow">
          <div className="grid grid-cols-2 items-center gap-3">
            <label className="font-medium text-black text-sm">Client:</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="border rounded p-2 text-black text-sm"
              disabled={loading}
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.client_type})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 items-center gap-3">
            <label className="font-medium text-black text-sm">API:</label>
            <select
              value={selectedApi}
              onChange={(e) => setSelectedApi(e.target.value)}
              className="border rounded p-2 text-black text-sm"
              disabled={loading}
            >
              <option value="">Select API</option>
              {apis.map((api) => (
                <option key={api.apiName} value={api.apiName}>
                  {api.apiName}
                </option>
              ))}
            </select>
          </div>
          {selectedApiData && (
            <>
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="font-medium text-black text-sm">Default Buying Price:</label>
                <span className="text-black text-sm">₹{selectedApiData.buyingPrice.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="font-medium text-black text-sm">Default Selling Price:</label>
                <span className="text-black text-sm">₹{selectedApiData.sellingPrice.toFixed(2)}</span>
              </div>
            </>
          )}
          <div className="grid grid-cols-2 items-center gap-3">
            <label className="font-medium text-black text-sm">Override Price:</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={overridePrice}
              onChange={(e) => setOverridePrice(e.target.value)}
              placeholder="Enter override price (e.g., 1.00)"
              className="text-black text-sm"
              disabled={loading}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className={`${styles.actionBtn} text-sm`}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className={`${styles.actionBtn} text-sm`}
          >
            {loading ? "Saving..." : existingPriceId ? "Update" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const OverRidePrice = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  const filterConfig = [
    {
      key: "api_name",
      label: "API Name",
      options: [
        { value: "", label: "All" },
        { value: "vehicleTonumber", label: "Vehicle to Number" },
        // Add more API names as needed
      ],
    },
  ];

  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/delete-override_price/${itemToDelete.id}`);
      toast.success("Pricing deleted successfully");
      fetchApiPricing();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete pricing");
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  useEffect(() => {
    fetchApiPricing();
  }, [pagination.page, pagination.pageSize, filter]);

  const fetchApiPricing = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.pageSize,
        ...cleanFilters(filter),
      };
      const response = await api.get("/get-Override_Price", {
        params: queryParams,
      });
      setData(response.data?.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.total || 0,
        totalPages: Math.ceil((response.data?.total || 0) / pagination.pageSize),
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch API pricing data");
    } finally {
      setLoading(false);
    }
  };

  const cleanFilters = (filters) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value !== "") {
        cleaned[key] = value;
      }
    }
    return cleaned;
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
    fetchApiPricing();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>API Pricing</h2>
          <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
            <FaPlus /> Add Pricing
          </button>
        </div>
        <Table
          title=""
          rightSlot={
            <button className={styles.iconButton} onClick={handleRefresh}>
              <FaSync />
            </button>
          }
          showSearch
          onSearch={(val) => console.log("Search:", val)}
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
                <th>ID</th>
                <th>Client Name</th>
                <th>Client Type</th>
                <th>API Name</th>
                <th>Override Price</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className={styles.loadingCell}>
                    <div className={styles.spinnerContainer}>
                      <div className={styles.customSpinner}></div>
                    </div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.Client?.name || "N/A"}</td>
                    <td>{item.Client?.client_type || "N/A"}</td>
                    <td>{item.api_name}</td>
                    <td>₹{parseFloat(item.override_price).toFixed(2)}</td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td>{new Date(item.updatedAt).toLocaleString()}</td>
                    <td>
                      <button
                        className={`${styles.actionBtn} ${styles.edit}`}
                        onClick={() => setEditItem(item)}
                        aria-label="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.delete}`}
                        onClick={() => handleDelete(item)}
                        aria-label="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={styles.noData}>
                    No pricing data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Table>
      </div>
      {editItem && (
        <UpdateOverRidePrice
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={() => {
            fetchApiPricing();
            setEditItem(null);
          }}
        />
      )}
      {showAdd && (
        <AddOverRidePrice
          onClose={() => setShowAdd(false)}
          onAdd={() => {
            fetchApiPricing();
            setShowAdd(false);
          }}
        />
      )}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onDelete={confirmDelete}
          itemName={`override price for ${itemToDelete?.Client?.name || "this client"}`}
          message={`You are about to delete the override price for ${
            itemToDelete?.Client?.name || "this client"
          } and API ${itemToDelete?.api_name}.`}
        />
      )}
    </div>
  );
};

export default OverRidePrice;