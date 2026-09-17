import styles from "./ApiKey.module.css";
import { FaSearch, FaSync, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Table from "../../components/Table/Table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../Utils/api";
import FilterComponent from "../../components/Filter/Filter";
import Pagination from "./Pagination";
import AddClient from "./AddClient";
import EditClient from "./EditClient";
import { FaDeleteLeft } from "react-icons/fa6";

const ClientApiHitBalance = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const handleDelete = async (client) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await api.delete(`/delete-Client/${client.id}`);
        toast.success("Client deleted");
        // refetch or filter clients on frontend
        fetchClients();
      } catch (e) {
        toast.error("Failed to delete client");
      }
    }
  };

  const filterConfig = [
    {
      key: "client_type",
      label: "Client Type",
      options: [
        { value: "", label: "All" },
        { value: "USER", label: "User" },
        { value: "POLICE", label: "Police" },
      ],
    },
    {
      key: "approved",
      label: "Approval Status",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Approved" },
        { value: "false", label: "Not Approved" },
      ],
    },
    {
      key: "billing_method",
      label: "Billing Method",
      options: [
        { value: "", label: "All" },
        { value: "PREPAID", label: "Prepaid" },
        { value: "POSTPAID", label: "Postpaid" },
      ],
    },
    {
      key: "is_active",
      label: "Active Status",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  useEffect(() => {
    fetchClients();
  }, [pagination.page, pagination.pageSize, filter]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.pageSize,
        ...cleanFilters(filter),
      };

      const response = await api.get("/get-Client", { params: queryParams });

      setClients(response.data?.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.total || 0,
        totalPages: Math.ceil(
          (response.data?.total || 0) / pagination.pageSize
        ),
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  const cleanFilters = (filters) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value === "") continue;

      // Convert string booleans to actual booleans
      if (key === "is_active" || key === "approved") {
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

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: newSize,
      page: 1,
    }));
  };

  const handleRefresh = () => {
    fetchClients();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>Clients API Hit/Balance</h2>
          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              {/* <FaSearch className={styles.searchIcon} /> */}
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search clients..."
                onChange={(e) => console.log("Search:", e.target.value)}
              />
            </div>
            {/* <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
              <FaPlus /> Add Clients
            </button> */}
          </div>
        </div>
  <Table
          title=""
          rightSlot={
            <button className={styles.iconButton} onClick={handleRefresh}>
              <FaSync />
            </button>
          }
          // showSearch
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
              <th>Name</th>
              <th>Type</th>
              <th>Number</th>
              <th>Email</th>
              <th>Approval</th>
              <th>Status</th>
              <th>API Hit/Balance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className={styles.loadingCell}>
                  <div className={styles.spinnerContainer}>
                    <div className={styles.customSpinner}></div>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                <tr>
                  <td>John Doe</td>
                  <td>User</td>
                  <td>+91 9876543210</td>
                  <td>john@example.com</td>
                  <td>Approved</td>
                  <td>Active</td>
                  <td>234 / 500</td>
                  <td>
                    <button
                      className={`${styles.actionBtn} ${styles.edit}`}
                      onClick={() => setEditClient({ name: "John Doe" })}
                      aria-label="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.delete}`}
                      onClick={() => handleDelete({ id: 1 })}
                      aria-label="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Jane Smith</td>
                  <td>Police</td>
                  <td>+91 9988776655</td>
                  <td>jane@example.com</td>
                  <td>Not Approved</td>
                  <td>Inactive</td>
                  <td>50 / 300</td>
                  <td>
                    <button
                      className={`${styles.actionBtn} ${styles.edit}`}
                      onClick={() => setEditClient({ name: "Jane Smith" })}
                      aria-label="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.delete}`}
                      onClick={() => handleDelete({ id: 2 })}
                      aria-label="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              </>
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
      {showAdd && (
        <AddClient
          onClose={() => setShowAdd(false)}
          // onAdd={handleAddClient}
        />
      )}
      {editClient && (
        <EditClient
          client={editClient}
          onClose={() => setEditClient(null)}
          // onSave={handleEditClient}
        />
      )}
    </div>
  );
};

export default ClientApiHitBalance;
