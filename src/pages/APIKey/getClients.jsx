import styles from "./ApiKey.module.css";
import {
  FaSearch,
  FaSync,
  FaPlus,
  FaWallet,
  FaEdit,
  FaTrash,
  FaEye,
  FaKey,
  FaCopy,
  FaCheck,
} from "react-icons/fa";
import Table from "../../components/Table/Table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../Utils/api";
import FilterComponent from "../../components/Filter/Filter";
import Pagination from "./Pagination";
import AddClient from "./AddClient";
import EditClient from "./EditClient";
import DeleteConfirmModal from "../../components/FinalDeleteModal/DeleteConfirmModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AccessControlModal from "./AccessControlModal";
import SyncClientModal from "./SyncClientModal";

const generateCawsDeviceNumber = (deviceId) => {
  if (!deviceId) return "";
  let hash = 0;
  const str = String(deviceId || "").replace(/^VIC_/, "").trim();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  const num = (positiveHash % 900000) + 100000;
  return `CAWS-${num}`;
};

const isGuestClient = (client) => {
  if (!client) return false;
  const type = String(client.client_type || "").toUpperCase();
  const role = String(client.role || "").toUpperCase();
  const name = String(client.name || "").trim();
  return (
    type === "GUEST" ||
    role === "GUEST" ||
    name.toUpperCase().startsWith("CAWS-") ||
    name.toUpperCase().startsWith("VIC_") ||
    name.toLowerCase().includes("guest") ||
    (Boolean(client.device_id || client.deviceId) && !client.phone)
  );
};

const getGuestDisplayName = (client) => {
  if (!client) return "";
  const name = String(client.name || "").trim();
  const cawsMatch = name.match(/CAWS-\d+/i);
  if (cawsMatch) {
    return cawsMatch[0].toUpperCase();
  }
  const devId = client.device_id || client.deviceId;
  if (devId) {
    return generateCawsDeviceNumber(devId);
  }
  if (client.id) {
    return generateCawsDeviceNumber(client.id);
  }
  return "CAWS-GUEST";
};

const COUNTRY_MAP = {
  IN: { name: "India", flag: "🇮🇳" },
  INDIA: { name: "India", flag: "🇮🇳" },
  US: { name: "United States", flag: "🇺🇸" },
  USA: { name: "United States", flag: "🇺🇸" },
  GB: { name: "United Kingdom", flag: "🇬🇧" },
  UK: { name: "United Kingdom", flag: "🇬🇧" },
  AE: { name: "UAE", flag: "🇦🇪" },
  UAE: { name: "UAE", flag: "🇦🇪" },
  CA: { name: "Canada", flag: "🇨🇦" },
  AU: { name: "Australia", flag: "🇦🇺" },
  SG: { name: "Singapore", flag: "🇸🇬" },
  NP: { name: "Nepal", flag: "🇳🇵" },
  BD: { name: "Bangladesh", flag: "🇧🇩" },
};

const getCountryInfo = (countryStr) => {
  if (!countryStr) return { code: "IN", name: "India", flag: "🇮🇳" };
  const upper = String(countryStr).toUpperCase().trim();
  if (COUNTRY_MAP[upper]) {
    return {
      code: upper.length === 2 ? upper : (upper === "INDIA" ? "IN" : upper),
      ...COUNTRY_MAP[upper],
    };
  }
  return { code: upper.slice(0, 2) || "IN", name: countryStr, flag: "🌐" };
};

const getClientLocationInfo = (client) => {
  if (!client) {
    return {
      countryInfo: getCountryInfo("IN"),
      locationDetails: "",
      locationType: "",
    };
  }

  // 1. Determine country code/name
  const rawCountry =
    client.country ||
    client.NgoPartnerApplications?.[0]?.country ||
    "IN";
  const countryInfo = getCountryInfo(rawCountry);

  // 2. Specific jurisdiction / location details for Police, Volunteer, NGO
  const parts = [];
  let locationType = "";

  if (client.client_type === "POLICE") {
    locationType = "Police Jurisdiction";
    if (client.district) parts.push(client.district);
    if (client.state && client.state !== client.district) parts.push(client.state);
    if (client.police_station_name) parts.push(`PS: ${client.police_station_name}`);
  } else if (client.VolunteerProfile) {
    locationType = "Volunteer Area";
    if (client.VolunteerProfile.district) parts.push(client.VolunteerProfile.district);
    if (
      client.VolunteerProfile.state &&
      client.VolunteerProfile.state !== client.VolunteerProfile.district
    ) {
      parts.push(client.VolunteerProfile.state);
    }
  } else if (client.NgoPartnerApplications && client.NgoPartnerApplications.length > 0) {
    locationType = "NGO Headquarters";
    const ngo = client.NgoPartnerApplications[0];
    if (ngo.organization_name) parts.push(ngo.organization_name);
    if (ngo.city) parts.push(ngo.city);
    if (ngo.state && ngo.state !== ngo.city) parts.push(ngo.state);
  } else {
    if (client.district) parts.push(client.district);
    if (client.state && client.state !== client.district) parts.push(client.state);
  }

  return {
    countryInfo,
    locationDetails: parts.join(" • "),
    locationType,
  };
};

const getAssignedId = (client) => {
  if (!client) return { display: "—", copyValue: "", badgeClass: "", label: "ID" };

  // 1. If Volunteer profile has a volunteer_id (e.g. CAWS-00008)
  if (client.VolunteerProfile?.volunteer_id) {
    return {
      display: client.VolunteerProfile.volunteer_id,
      copyValue: client.VolunteerProfile.volunteer_id,
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      label: "Volunteer ID",
    };
  }

  // 2. If client.name is a CAWS identifier (e.g. CAWS-601344)
  const cawsMatch = client.name?.match(/CAWS-\d+/i);
  if (cawsMatch) {
    return {
      display: cawsMatch[0].toUpperCase(),
      copyValue: cawsMatch[0].toUpperCase(),
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      label: "CAWS Guest ID",
    };
  }

  // 3. If device_id exists, deterministic CAWS reference
  const rawDevId = client.device_id || client.deviceId;
  if (rawDevId) {
    const cawsNum = generateCawsDeviceNumber(rawDevId);
    return {
      display: cawsNum,
      copyValue: cawsNum,
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      label: "CAWS Device ID",
    };
  }

  // 4. Guest user detected
  if (isGuestClient(client)) {
    const gName = getGuestDisplayName(client);
    return {
      display: gName,
      copyValue: gName,
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      label: "CAWS Guest ID",
    };
  }

  // 5. Police client
  if (client.client_type === "POLICE" && client.id) {
    const shortId = client.id.length > 12 ? `${client.id.slice(0, 8)}...` : client.id;
    return {
      display: shortId,
      copyValue: client.id,
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      label: "Police ID",
    };
  }

  // 6. Assigned Client ID (UUID)
  if (client.id) {
    const shortId = client.id.length > 12 ? `${client.id.slice(0, 8)}...` : client.id;
    return {
      display: shortId,
      copyValue: client.id,
      badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
      label: `${client.client_type || "Client"} ID`,
    };
  }

  return { display: "—", copyValue: "", badgeClass: "", label: "ID" };
};

const RechargeModal = ({ isOpen, onClose, clientId, fetchClients }) => {
  const [rechargeData, setRechargeData] = useState({
    client_id: clientId || "",
    amount: "",
    mode: "online",
    method: "credit_card",
    transaction_id: "",
    merchant_id: "",
    merchant_transaction_id: "",
  });

  useEffect(() => {
    setRechargeData((prev) => ({ ...prev, client_id: clientId }));
  }, [clientId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRechargeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post("/client-payments-recharge", rechargeData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Recharge created successfully");
      fetchClients();
      onClose();
    } catch (error) {
      console.error(
        "Error creating recharge:",
        error.response?.data || error.message
      );
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
            <label className="col-span-1 font-medium text-black">
              Transaction ID:
            </label>
            <Input
              name="transaction_id"
              value={rechargeData.transaction_id}
              onChange={handleInputChange}
              className={`${styles.searchInput} col-span-2`}
              placeholder="Enter transaction ID"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">
              Merchant ID:
            </label>
            <Input
              name="merchant_id"
              value={rechargeData.merchant_id}
              onChange={handleInputChange}
              className={`${styles.searchInput} col-span-2`}
              placeholder="Enter merchant ID"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 font-medium text-black">
              Merchant Transaction ID:
            </label>
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
          <Button
            variant="outline"
            onClick={onClose}
            className={styles.actionBtn}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className={`${styles.actionBtn} bg-green-600 hover:bg-green-700`}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
const GetClients = () => {
  const [clients, setClients] = useState([]);
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
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [clientToSync, setClientToSync] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [copiedItem, setCopiedItem] = useState(null);

  const handleCopy = (text, label = "ID") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedItem(text);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => {
      setCopiedItem(null);
    }, 2000);
  };

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
  const handleAccessClick = (client) => {
    setSelectedClient(client);
    setIsAccessModalOpen(true);
  };
  const handleSyncClick = (client) => {
    setClientToSync(client);
    setIsSyncModalOpen(true);
  };
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
      const clientsData = response.data?.data || [];
      // Normalize boolean fields, including pan_access and is_phone_linked
      let normalizedClients = clientsData.map((client) => ({
        ...client,
        approved: client.approved === "true" || client.approved === true,
        is_active: client.is_active === "true" || client.is_active === true,
        is_phone_linked:
          client.is_phone_linked === "true" || client.is_phone_linked === true,
        aadhar_access:
          client.aadhar_access === "true" || client.aadhar_access === true,
        pan_access: client.pan_access === "true" || client.pan_access === true,
      }));

      // Client-side fallback filter for GUEST, VOLUNTEER, device_id, and country
      if (filter.client_type === "GUEST") {
        normalizedClients = normalizedClients.filter(isGuestClient);
      } else if (filter.client_type === "VOLUNTEER") {
        normalizedClients = normalizedClients.filter(
          (c) => Boolean(c.VolunteerProfile?.volunteer_id) || c.role === "VOLUNTEER"
        );
      }
      if (filter.device_id) {
        const q = filter.device_id.trim().toLowerCase();
        normalizedClients = normalizedClients.filter((c) => {
          const devId = String(c.device_id || c.deviceId || "").toLowerCase();
          const gName = getGuestDisplayName(c).toLowerCase();
          const assigned = getAssignedId(c).copyValue.toLowerCase();
          const cName = String(c.name || "").toLowerCase();
          return devId.includes(q) || gName.includes(q) || assigned.includes(q) || cName.includes(q);
        });
      }
      if (filter.country) {
        const targetCountry = filter.country.toUpperCase();
        normalizedClients = normalizedClients.filter((c) => {
          const cCountry = (c.country || "IN").toUpperCase();
          if (targetCountry === "OTHER") {
            return !["IN", "INDIA", "US", "USA", "GB", "UK", "AE", "UAE", "CA", "AU"].includes(cCountry);
          }
          return cCountry === targetCountry || (targetCountry === "IN" && cCountry === "INDIA");
        });
      }
      if (filter.has_device_id) {
        if (filter.has_device_id === "yes") {
          normalizedClients = normalizedClients.filter(
            (c) => Boolean(c.device_id || c.deviceId)
          );
        } else if (filter.has_device_id === "guest") {
          normalizedClients = normalizedClients.filter(isGuestClient);
        } else if (filter.has_device_id === "no") {
          normalizedClients = normalizedClients.filter(
            (c) => !Boolean(c.device_id || c.deviceId) && !isGuestClient(c)
          );
        }
      }

      setClients(normalizedClients);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.total || normalizedClients.length,
        totalPages: Math.ceil(
          (response.data?.total || normalizedClients.length) / pagination.pageSize
        ),
      }));
    } catch (error) {
      console.error(
        "Error fetching clients:",
        error.response?.data || error.message
      );
      toast.dismiss();
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  const cleanFilters = (filters) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value === "") continue;
      if (
        key === "is_active" ||
        key === "approved" ||
        key === "aadhar_access" ||
        key === "pan_access" ||
        key === "is_phone_linked"
      ) {
        // Added pan_access and is_phone_linked
        cleaned[key] = value === "true";
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };
const getVisiblePages = () => {
  const total = pagination.totalPages;
  const current = pagination.page;
  const delta = 2; // how many pages around current

  const range = [];
  const rangeWithDots = [];

  let l;

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
};
  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  const handleRefresh = () => {
    fetchClients();
  };

  const handleToggle = async (id, field, value) => {
    try {
      const token = localStorage.getItem("token");
      // Map field to server-expected name if necessary
      const payloadField = field === "approved" ? "approved" : field;
      const response = await api.put(
        `/update-client/${id}`,
        { [payloadField]: value },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(`Toggle ${field} response:`, response.data);
      toast.success(`Client ${field} updated`);
      fetchClients();
    } catch (error) {
      console.error(
        `Error updating ${field}:`,
        error.response?.data || error.message
      );
      toast.error(`Failed to update ${field}`);
    }
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!clientToDelete?.id) return;
    const toastId = toast.loading("Deleting client and all associated data...");
    try {
      await api.delete(`/delete-Client/${clientToDelete.id}`);
      fetchClients();
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
      toast.success("Client and all associated records deleted successfully", {
        id: toastId,
      });
    } catch (error) {
      console.error(
        "Error deleting client:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete client",
        { id: toastId }
      );
    }
  };

  const handleRechargeClick = (clientId) => {
    setSelectedClientId(clientId);
    setIsRechargeModalOpen(true);
  };

  const filterConfig = [
    {
      key: "client_type",
      label: "Client Type",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "USER", label: "User" },
        { value: "GUEST", label: "Guest User" },
        { value: "POLICE", label: "Police" },
        { value: "VOLUNTEER", label: "Volunteer" },
        { value: "INSURANCE", label: "Insurance" },
        { value: "BANK", label: "Bank" },
        { value: "COMPANY", label: "Company" },
        { value: "ADMIN", label: "Admin" },
        { value: "SUBUSER", label: "Sub User" },
      ],
    },
    {
      key: "device_id",
      label: "Device / Assigned ID",
      type: "text",
      placeholder: "Filter by Device ID or CAWS...",
    },
    {
      key: "country",
      label: "Country",
      type: "select",
      options: [
        { value: "", label: "All Countries" },
        { value: "IN", label: "🇮🇳 India (IN)" },
        { value: "US", label: "🇺🇸 United States (US)" },
        { value: "GB", label: "🇬🇧 United Kingdom (GB)" },
        { value: "AE", label: "🇦🇪 UAE (AE)" },
        { value: "CA", label: "🇨🇦 Canada (CA)" },
        { value: "AU", label: "🇦🇺 Australia (AU)" },
        { value: "OTHER", label: "🌐 Other" },
      ],
    },
    {
      key: "has_device_id",
      label: "Device Status",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "yes", label: "With Device ID" },
        { value: "guest", label: "Guest Users (CAWS)" },
        { value: "no", label: "Without Device ID" },
      ],
    },
    {
      key: "approved",
      label: "Approval Status",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Approved" },
        { value: "false", label: "Not Approved" },
      ],
    },
    {
      key: "billing_method",
      label: "Billing Method",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "PREPAID", label: "Prepaid" },
        { value: "POSTPAID", label: "Postpaid" },
      ],
    },
    {
      key: "is_active",
      label: "Active Status",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
    {
      key: "aadhar_access",
      label: "Aadhar Access",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Enabled" },
        { value: "false", label: "Disabled" },
      ],
    },
    // Added pan_access filter
    {
      key: "pan_access",
      label: "PAN Access",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Enabled" },
        { value: "false", label: "Disabled" },
      ],
    },
    // Sync Status filter
    {
      key: "is_phone_linked",
      label: "Sync Status",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Synced" },
        { value: "false", label: "Unsynced" },
      ],
    },
  ];

  const toolbarRight = (
    <button className={styles.iconButton} onClick={handleRefresh}>
      <FaSync />
    </button>
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>All Clients</h2>
          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by name, phone, or device ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
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
          <div className={styles.tableWrapper}>

 
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Name</th>
                <th>Client Type</th>
                <th>Billing Method</th>
                <th>Phone</th>
                <th>Sync</th>
                <th>Device ID</th>
                <th>Assigned ID</th>
                <th>Country</th>
                <th>Created At</th>
                <th>Attachment</th>
                <th>Approved</th>
                {/* <th>Aadhar Access</th> */}
                {/* <th>PAN Access</th> Added PAN Access column */}
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="13" className={styles.loadingCell}>
                    {" "}
                    <div className={styles.spinnerContainer}>
                      <div className={styles.customSpinner}></div>
                    </div>
                  </td>
                </tr>
              ) : clients.length > 0 ? (
                clients.map((client) => {
                  console.log(
                    `Client ${client.name} approved:`,
                    client.approved,
                    typeof client.approved
                  );
                  const isGuest = isGuestClient(client);
                  const guestGeneratedName = getGuestDisplayName(client);
                  const rawDevId = client.device_id || client.deviceId || "";
                  const assignedInfo = getAssignedId(client);
                  const locationData = getClientLocationInfo(client);

                  return (
                    <tr key={client.id}>
                      <td className={styles.noWrapText}>
                        {isGuest ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs font-mono">
                                {guestGeneratedName}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(guestGeneratedName, "CAWS ID")}
                                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                title={`Copy ${guestGeneratedName}`}
                              >
                                {copiedItem === guestGeneratedName ? (
                                  <FaCheck className="text-green-600 text-xs" />
                                ) : (
                                  <FaCopy className="text-xs" />
                                )}
                              </button>
                            </div>
                            {client.name && client.name !== guestGeneratedName && !client.name.startsWith("CAWS-") && (
                              <span className="text-xs text-gray-500">{client.name}</span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{client.name}</span>
                            {client.email && (
                              <span className="text-xs text-gray-400">{client.email}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        {isGuest ? (
                          <div>
                            <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                              GUEST USER
                            </span>
                            {client?.client_type === "POLICE" && client?.police_station_name && (
                              <p className="text-xs text-gray-500 mt-0.5">{client.police_station_name}</p>
                            )}
                          </div>
                        ) : client.VolunteerProfile?.volunteer_id ? (
                          <div>
                            <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                              VOLUNTEER
                            </span>
                          </div>
                        ) : client.NgoPartnerApplications?.length > 0 ? (
                          <div>
                            <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                              NGO PARTNER
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold text-xs text-gray-800">{client.client_type}</span>
                            {client?.client_type === "POLICE" && client?.police_station_name && (
                              <p className="text-xs text-gray-500 mt-0.5">{client.police_station_name}</p>
                            )}
                          </div>
                        )}
                      </td>
                      <td>{client.billing_method}</td>
                      <td>{client.phone || <span className="text-gray-400">—</span>}</td>
                      <td>
                        <div className="flex flex-col items-start gap-1">
                          {client.is_phone_linked && client.phone ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <FaCheck className="text-[9px]" /> Synced
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Unsynced
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSyncClick(client)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors shadow-xs cursor-pointer"
                            title="Sync phone and email"
                          >
                            <FaSync className="text-[9px]" /> Sync
                          </button>
                        </div>
                      </td>
                      <td className={styles.noWrapText}>
                        {rawDevId ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-800 border border-gray-200"
                              title={rawDevId}
                            >
                              {rawDevId.length > 18
                                ? `${rawDevId.slice(0, 16)}...`
                                : rawDevId}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(rawDevId, "Device ID")}
                              className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                              title={`Copy Device ID: ${rawDevId}`}
                            >
                              {copiedItem === rawDevId ? (
                                <FaCheck className="text-green-600 text-xs" />
                              ) : (
                                <FaCopy className="text-xs" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className={styles.noWrapText}>
                        {assignedInfo.display !== "—" ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-mono text-xs px-2 py-0.5 rounded border font-semibold ${assignedInfo.badgeClass}`}
                                title={assignedInfo.copyValue}
                              >
                                {assignedInfo.display}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(assignedInfo.copyValue, assignedInfo.label)}
                                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                title={`Copy ${assignedInfo.label}: ${assignedInfo.copyValue}`}
                              >
                                {copiedItem === assignedInfo.copyValue ? (
                                  <FaCheck className="text-green-600 text-xs" />
                                ) : (
                                  <FaCopy className="text-xs" />
                                )}
                              </button>
                            </div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                              {assignedInfo.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td>
                        <div className="flex flex-col gap-0.5 min-w-[130px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base leading-none" role="img" aria-label={locationData.countryInfo.name}>
                              {locationData.countryInfo.flag}
                            </span>
                            <span className="text-xs font-semibold text-gray-800">
                              {locationData.countryInfo.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              ({locationData.countryInfo.code})
                            </span>
                          </div>
                          {locationData.locationDetails ? (
                            <span
                              className="text-[11px] text-gray-500 line-clamp-2"
                              title={locationData.locationDetails}
                            >
                              {locationData.locationDetails}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td>{formatDateTime(client.createdAt)}</td>
                      <td>
                        {client.attachment ? (
                          <a
                            href={client.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          "None"
                        )}
                      </td>
                      <td>
                        <label className={styles.toggleWrapper}>
                          <input
                            type="checkbox"
                            checked={client.approved}
                            onChange={() =>
                              handleToggle(
                                client.id,
                                "approved",
                                !client.approved
                              )
                            }
                            className={styles.toggleInput}
                          />
                          <div className={styles.toggleSlider}>
                            <div className={styles.toggleKnob}></div>
                          </div>
                        </label>
                      </td>
                      {/* <td>
                        {client.aadhar_access !== undefined && (
                          <label className={styles.toggleWrapper}>
                            <input
                              type="checkbox"
                              checked={client.aadhar_access}
                              onChange={() =>
                                handleToggle(client.id, "aadhar_access", !client.aadhar_access)
                              }
                              className={styles.toggleInput}
                            />
                            <div className={styles.toggleSlider}>
                              <div className={styles.toggleKnob}></div>
                            </div>
                          </label>
                        )}
                      </td> */}
                      {/* Added PAN Access toggle */}
                      {/* <td>
                        {client.pan_access !== undefined && (
                          <label className={styles.toggleWrapper}>
                            <input
                              type="checkbox"
                              checked={client.pan_access}
                              onChange={() =>
                                handleToggle(client.id, "pan_access", !client.pan_access)
                              }
                              className={styles.toggleInput}
                            />
                            <div className={styles.toggleSlider}>
                              <div className={styles.toggleKnob}></div>
                            </div>
                          </label>
                        )}
                      </td> */}
                      <td>
                        <label className={styles.toggleWrapper}>
                          <input
                            type="checkbox"
                            checked={client.is_active}
                            onChange={() =>
                              handleToggle(
                                client.id,
                                "is_active",
                                !client.is_active
                              )
                            }
                            className={styles.toggleInput}
                          />
                          <div className={styles.toggleSlider}>
                            <div className={styles.toggleKnob}></div>
                          </div>
                        </label>
                      </td>
                      <td>
                        {client.attachment && (
                          <button
                            onClick={() =>
                              window.open(client.attachment, "_blank")
                            }
                            className={`${styles.actionBtn} bg-blue-600 hover:bg-blue-700`}
                            aria-label="View Attachment"
                          >
                            <FaEye />
                          </button>
                        )}
                        <button
                          className={`${styles.actionBtn} bg-purple-600 hover:bg-purple-700`}
                          onClick={() => handleAccessClick(client)}
                          aria-label="Manage Access"
                        >
                          <FaKey />
                        </button>
                        <button
                          className={`${styles.actionBtn} bg-indigo-600 hover:bg-indigo-700`}
                          onClick={() => handleSyncClick(client)}
                          aria-label="Sync Phone & Email"
                          title="Sync Phone & Email"
                        >
                          <FaSync />
                        </button>
                        <button
                          className={`${styles.actionBtn} bg-green-600 hover:bg-green-700`}
                          onClick={() => handleRechargeClick(client.id)}
                          aria-label="Recharge"
                        >
                          <FaWallet />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.edit}`}
                          onClick={() => setEditClient(client)}
                          aria-label="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.delete}`}
                          onClick={() => handleDeleteClick(client)}
                          aria-label="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="13" className={styles.noData}>
                    No clients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
         </div>
          <div className={styles.paginationContainer}>
            <div className={styles.pageInfo}>
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(
                pagination.page * pagination.pageSize,
                pagination.total
              )}{" "}
              of {pagination.total} clients
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
                  className={`${styles.pageButton} ${
                    pagination.page === 1 ? "disabled" : ""
                  }`}
                >
                  Previous
                </button>
       {getVisiblePages().map((page, index) =>
  page === "..." ? (
    <span key={index} className={styles.ellipsis}>
      ...
    </span>
  ) : (
    <button
      key={page}
      onClick={() => handlePageChange(page)}
      className={`${styles.pageButton} ${
        pagination.page === page ? styles.active : ""
      }`}
    >
      {page}
    </button>
  )
)}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`${styles.pageButton} ${
                    pagination.page === pagination.totalPages ? "disabled" : ""
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </Table>

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteConfirmed}
        />

        <RechargeModal
          isOpen={isRechargeModalOpen}
          onClose={() => {
            setIsRechargeModalOpen(false);
            setSelectedClientId(null);
          }}
          clientId={selectedClientId}
          fetchClients={fetchClients}
        />
        {isAccessModalOpen && (
          <AccessControlModal
            client={selectedClient}
            onClose={() => {
              setIsAccessModalOpen(false);
              setSelectedClient(null);
            }}
            handleRefresh={fetchClients}
          />
        )}
        {isSyncModalOpen && clientToSync && (
          <SyncClientModal
            client={clientToSync}
            onClose={() => {
              setIsSyncModalOpen(false);
              setClientToSync(null);
            }}
            handleRefresh={fetchClients}
          />
        )}
        {showAdd && <AddClient onClose={() => setShowAdd(false)} />}
        {editClient && (
          <EditClient
            client={editClient}
            onClose={() => setEditClient(null)}
            handleRefresh={handleRefresh}
          />
        )}
      </div>
    </div>
  );
};

export default GetClients;
