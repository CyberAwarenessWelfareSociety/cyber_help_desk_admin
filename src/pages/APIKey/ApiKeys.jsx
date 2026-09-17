import {
  FaSearch,
  FaSync,
  FaEye,
  FaEyeSlash,
  FaCopy,
  FaPlus,
} from "react-icons/fa";
import Table from "../../components/Table/Table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../Utils/api";
import FilterComponent from "../../components/Filter/Filter";
import Pagination from "./Pagination";
import AddClient from "./AddClient";
import EditClient from "./EditClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import styles from "./ApiKey.module.css";

const OverridePriceModal = ({ clientId, apiName, buyingPrice, sellingPrice, onClose, onSave }) => {
  const [overridePrice, setOverridePrice] = useState("");
  const [existingPriceId, setExistingPriceId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExistingPrice = async () => {
      if (!clientId || !apiName) {
        setOverridePrice("");
        setExistingPriceId(null);
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/get-Override_Price", {
          params: {
            client_id: clientId,
            api_name: apiName,
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
        console.error("Error checking existing override price:", error.response?.data || error.message);
        toast.error("Failed to check existing override price");
      } finally {
        setLoading(false);
      }
    };
    fetchExistingPrice();
  }, [clientId, apiName]);

  const handleSave = async () => {
    if (overridePrice && (isNaN(overridePrice) || parseFloat(overridePrice) < 0)) {
      toast.error("Please enter a valid price");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formattedPrice = overridePrice ? parseFloat(overridePrice).toFixed(2) : null;
      const payload = {
        client_id: clientId,
        api_name: apiName,
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
        toast.success(`Override price for ${apiName} updated successfully`);
      } else {
        // Create new override price
        await api.post(
          "/create-override_price",
          payload,
          {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          }
        );
        toast.success(`Override price for ${apiName} saved successfully`);
      }
      onSave(apiName, formattedPrice ? parseFloat(formattedPrice) : null);
      onClose();
    } catch (error) {
      console.error(`Error ${existingPriceId ? "updating" : "saving"} override price:`, error.response?.data || error.message);
      toast.error(`Failed to ${existingPriceId ? "update" : "save"} override price`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`${styles.card} sm:max-w-[400px] p-4`}>
        <DialogHeader>
          <DialogTitle className="text-black">
            {existingPriceId ? `Update Override Price for ${apiName}` : `Override Price for ${apiName}`}
          </DialogTitle>
          <DialogDescription className="text-black">
            {existingPriceId
              ? "Update the existing override price for this API."
              : "Set a custom price for this API. Leave empty to use default pricing."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <label className="font-medium text-black">Default Buying Price:</label>
            <span className="text-black">{buyingPrice.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <label className="font-medium text-black">Default Selling Price:</label>
            <span className="text-black">{sellingPrice.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <label className="font-medium text-black">Override Price:</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={overridePrice}
              onChange={(e) => setOverridePrice(e.target.value)}
              placeholder="Enter override price (e.g., 1.00)"
              className="text-black"
              disabled={loading}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className={styles.actionBtn} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className={styles.actionBtn}>
            {loading ? "Saving..." : existingPriceId ? "Update" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ManageApisModal = ({ clientId, apiKey, onClose }) => {
  const [availableApis, setAvailableApis] = useState([]);
  const [selectedApis, setSelectedApis] = useState([]);
  const [apiAccessIds, setApiAccessIds] = useState({});
  const [overridePrices, setOverridePrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedApiForPrice, setSelectedApiForPrice] = useState(null);

  useEffect(() => {
    const fetchApis = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Fetch all available APIs
        const allApisResponse = await api.get("/getAllApi", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allApis = allApisResponse.data?.serviceNames || [];
        setAvailableApis(allApis);

        // Fetch APIs the client has access to
        try {
          const accessApisResponse = await api.get("/accessApibyKey", {
            params: { apiKey },
            headers: { Authorization: `Bearer ${token}` },
          });
          const accessApis = accessApisResponse.data?.data || [];

          // Map the access APIs to selected APIs and their IDs
          const selected = accessApis.map((item) => item.api_name);
          const ids = accessApis.reduce((acc, item) => {
            acc[item.api_name] = item.id;
            return acc;
          }, {});
          const prices = accessApis.reduce((acc, item) => {
            acc[item.api_name] = item.override_price ? parseFloat(item.override_price).toFixed(2) : null;
            return acc;
          }, {});

          setSelectedApis(selected);
          setApiAccessIds(ids);
          setOverridePrices(prices);
        } catch (error) {
          console.error("Error fetching access APIs:", error.response?.data || error.message);
          // If /accessApibyKey fails or returns no data, set selectedApis to empty
          setSelectedApis([]);
          setApiAccessIds({});
          setOverridePrices({});
          toast.error("No API access found for this client");
        }
      } catch (error) {
        console.error("Error fetching all APIs:", error.response?.data || error.message);
        setAvailableApis([]);
        setSelectedApis([]);
        setApiAccessIds({});
        setOverridePrices({});
        toast.error("Failed to fetch APIs");
      } finally {
        setLoading(false);
      }
    };
    fetchApis();
  }, [apiKey]);

  const handleToggleApi = async (apiName) => {
    const isCurrentlySelected = selectedApis.includes(apiName);
    try {
      const token = localStorage.getItem("token");
      if (!isCurrentlySelected) {
        const response = await api.post(
          "/create-api_key_access",
          { api_key: apiKey, api_name: apiName },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        const newAccessId = response.data?.data?.id;
        if (newAccessId) {
          setApiAccessIds((prev) => ({ ...prev, [apiName]: newAccessId }));
          setSelectedApis((prev) => [...prev, apiName]);
          toast.success(`API ${apiName} enabled successfully`);
        } else {
          throw new Error("No access ID returned");
        }
      } else {
        const accessId = apiAccessIds[apiName];
        if (!accessId) {
          throw new Error("No access ID found for API");
        }
        await api.delete(`/delete-api_key_access/${accessId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApiAccessIds((prev) => {
          const newIds = { ...prev };
          delete newIds[apiName];
          return newIds;
        });
        setSelectedApis((prev) => prev.filter((name) => name !== apiName));
        setOverridePrices((prev) => {
          const newPrices = { ...prev };
          delete newPrices[apiName];
          return newPrices;
        });
        toast.success(`API ${apiName} disabled successfully`);
      }
    } catch (error) {
      console.error(`Error toggling API ${apiName}:`, error.response?.data || error.message);
      toast.error(`Failed to toggle API ${apiName}`);
    }
  };

  const handleOverridePriceSave = (apiName, price) => {
    setOverridePrices((prev) => ({ ...prev, [apiName]: price ? parseFloat(price).toFixed(2) : null }));
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className={`${styles.card} sm:max-w-[600px] max-h-[80vh] overflow-y-auto p-4`}>
          <DialogHeader>
            <DialogTitle className="text-black">Manage APIs for API Key</DialogTitle>
            <DialogDescription className="text-black">
              Select APIs to enable or disable for this client.
            </DialogDescription>
          </DialogHeader>
          {loading ? (
            <div className={styles.spinnerContainer}>
              <div className={styles.customSpinner}></div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              {availableApis.length > 0 ? (
                availableApis.map((data) => (
                  <div key={data.apiName} className="grid grid-cols-4 items-center gap-4">
                    <label className="col-span-2 font-medium text-black">{data.apiName}</label>
                    <div className="col-span-1">
                      <label className={styles.toggleWrapper}>
                        <input
                          type="checkbox"
                          className={styles.toggleInput}
                          checked={selectedApis.includes(data.apiName)}
                          onChange={() => handleToggleApi(data.apiName)}
                        />
                        <div className={styles.toggleSlider}>
                          <div className={styles.toggleKnob}></div>
                        </div>
                      </label>
                    </div>
                    <div className="col-span-1">
                      <Button
                        className={`${styles.actionBtn} bg-blue-600 hover:bg-blue-700`}
                        onClick={() => setSelectedApiForPrice(data)}
                        disabled={!selectedApis.includes(data.apiName)}
                      >
                        Override Price
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-black">No APIs available.</div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className={styles.actionBtn}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {selectedApiForPrice && (
        <OverridePriceModal
          clientId={clientId}
          apiName={selectedApiForPrice.apiName}
          buyingPrice={selectedApiForPrice.buyingPrice}
          sellingPrice={selectedApiForPrice.sellingPrice}
          onClose={() => setSelectedApiForPrice(null)}
          onSave={handleOverridePriceSave}
        />
      )}
    </>
  );
};

const ApiKeys = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [apiKeys, setApiKeys] = useState({});
  const [visibleApiKeys, setVisibleApiKeys] = useState({});
  const [showManageApis, setShowManageApis] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

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
    {
      key: "is_active",
      label: "Status",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
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
    fetchClients();
  }, [pagination.page, pagination.pageSize, filter, debouncedSearch]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch,
        ...cleanFilters(filter),
      };
      const response = await api.get("/get-Client", { params: queryParams });
      setClients(response.data?.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.total || 0,
        totalPages: Math.ceil((response.data?.total || 0) / pagination.pageSize),
      }));
    } catch (error) {
      console.error("Error fetching clients:", error.response?.data || error.message);
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  const cleanFilters = (filters) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value === "") continue;
      if (key === "is_active" || key === "approved") {
        cleaned[key] = value === "true";
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success("API Key copied to clipboard!");
      },
      (err) => {
        toast.error("Failed to copy API Key");
        console.error("Copy error:", err);
      }
    );
  };

  const handleApiKeyClick = async (clientId) => {
    if (apiKeys[clientId]) {
      setVisibleApiKeys((prev) => ({
        ...prev,
        [clientId]: !prev[clientId],
      }));
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/get-client_api_key", {
        params: { client_id: clientId },
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiKey = response.data?.data[0]?.api_key;
      if (apiKey) {
        setApiKeys((prev) => ({
          ...prev,
          [clientId]: apiKey,
        }));
        setVisibleApiKeys((prev) => ({
          ...prev,
          [clientId]: true,
        }));
      } else {
        toast.error("No API Key found");
      }
    } catch (error) {
      console.error("Error fetching API key:", error.response?.data || error.message);
      toast.error("Failed to fetch API Key");
    }
  };

  const handleManageApisClick = async (clientId) => {
    let apiKey = apiKeys[clientId];
    if (!apiKey) {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/get-client_api_key", {
          params: { client_id: clientId },
          headers: { Authorization: `Bearer ${token}` },
        });
        apiKey = response.data?.data[0]?.api_key;
        if (apiKey) {
          setApiKeys((prev) => ({
            ...prev,
            [clientId]: apiKey,
          }));
          setVisibleApiKeys((prev) => ({
            ...prev,
            [clientId]: true,
          }));
        } else {
          toast.error("No API Key found");
          return;
        }
      } catch (error) {
        console.error("Error fetching API key:", error.response?.data || error.message);
        toast.error("Failed to fetch API Key");
        return;
      }
    }
    setShowManageApis({ clientId, apiKey });
  };

  const handleCopyClick = (clientId) => {
    if (apiKeys[clientId]) {
      copyToClipboard(apiKeys[clientId]);
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
    fetchClients();
    setApiKeys({});
    setVisibleApiKeys({});
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
          <h2 className={styles.cardTitle}>API Keys</h2>
          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className={styles.addBtn}
              onClick={() => setShowAdd(true)}
            >
              <FaPlus /> Add Client
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
                <th>Name</th>
                <th>Type</th>
                <th>Number</th>
                <th>API Keys</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className={styles.loadingCell}>
                    <div className={styles.spinnerContainer}>
                      <div className={styles.customSpinner}></div>
                    </div>
                  </td>
                </tr>
              ) : clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.client_type}</td>
                    <td>{client.phone}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {apiKeys[client.id] ? (
                          <>
                            <span className={styles.noWrapText}>
                              {visibleApiKeys[client.id]
                                ? apiKeys[client.id]
                                : "••••••••••••••••"}
                            </span>
                            <FaCopy
                              className={`${styles.actionBtn} ${styles.edit}`}
                              onClick={() => handleCopyClick(client.id)}
                            />
                          </>
                        ) : (
                          <span className={styles.noWrapText}>••••••••••••••••</span>
                        )}
                        {visibleApiKeys[client.id] ? (
                          <FaEyeSlash
                            className={`${styles.actionBtn} ${styles.edit}`}
                            onClick={() => handleApiKeyClick(client.id)}
                          />
                        ) : (
                          <FaEye
                            className={`${styles.actionBtn} ${styles.edit}`}
                            onClick={() => handleApiKeyClick(client.id)}
                          />
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        className={`${styles.actionBtn} bg-green-600 hover:bg-green-700`}
                        onClick={() => handleManageApisClick(client.id)}
                      >
                        Manage APIs
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={styles.noData}>
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
      {showAdd && <AddClient onClose={() => setShowAdd(false)} />}
      {editClient && (
        <EditClient
          client={editClient}
          onClose={() => setEditClient(null)}
          handleRefresh={handleRefresh}
        />
      )}
      {showManageApis && (
        <ManageApisModal
          clientId={showManageApis.clientId}
          apiKey={showManageApis.apiKey}
          onClose={() => setShowManageApis(null)}
        />
      )}
    </div>
  );
};

export default ApiKeys;