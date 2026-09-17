import { useState, useEffect } from "react";
import { FaEdit, FaPlus, FaSync, FaTrash } from "react-icons/fa";
import styles from "./Announcement.module.css";
import AnnounceModal from "./AnnounceModal";
import api from "../../../Utils/api";
import toast from "react-hot-toast";
import Table from "../../../components/Table/Table";
import Pagination from "../Pagination";
import DeleteConfirmModal from "../../../Components/FinalDeleteModal/DeleteConfirmModal";

const Announcement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDelete = (id) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const fetchAnnouncements = async () => {
    setFetching(true);
    try {
      const res = await api.get(
        `/get-Announcement?page=${pagination.page}&limit=${pagination.pageSize}`
      );

      setAnnouncements(res.data?.data || []);
      setPagination((prev) => ({
        ...prev,
        total: res.data?.total || 0,
        totalPages: Math.ceil((res.data?.total || 0) / prev.pageSize),
      }));
    } catch (err) {
      console.error("Error fetching announcements:", err);
      toast.error("Failed to load announcements");
    } finally {
      setFetching(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await api.delete(`/delete-announcement/${itemToDelete}`);
      toast.success("Announcement deleted successfully");
      await fetchAnnouncements(); // Re-fetch with current page & limit
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete announcement");
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [pagination.page, pagination.pageSize]);

  const handleSubmitAnnouncement = async (data) => {
    setLoading(true);
    try {
      const payload = {
        announcement_text: data.message,
        expiry_date: new Date(data.expiryDate).toISOString(),
      };

      let res;
      if (editingAnnouncement) {
        res = await api.put(
          `/update-announcement/${editingAnnouncement.id}`,
          payload
        );
        toast.success(res.data.message || "Announcement updated!");
      } else {
        res = await api.post("/create-Announcement", payload);
        toast.success(res.data.message || "Announcement created!");
      }

      setIsModalOpen(false);
      setEditingAnnouncement(null);
      await fetchAnnouncements();
    } catch (error) {
      const message = error?.response?.data?.message || "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>Announcements</h2>
          <div className={styles.topBarActions}>
            <button
              className={styles.addBtn}
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus /> Create Announcement
            </button>
          </div>
        </div>

        <Table
          title=""
          rightSlot={
            <button
              className={styles.iconButton}
              onClick={fetchAnnouncements}
              disabled={fetching}
            >
              <FaSync className={fetching ? styles.spin : ""} />
            </button>
          }
        >
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Announcement</th>
                <th>Expiry Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                  <td colSpan="3" className={styles.loadingCell}>
                    <div className={styles.spinnerContainer}>
                      <div className={styles.customSpinner}></div>
                    </div>
                  </td>
                </tr>
              ) : announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <tr key={announcement.id}>
                    <td>{announcement.announcement_text}</td>
                    <td>{formatDate(announcement.expiry_date)}</td>
                    <td className={styles.actions}>
                      <button
                        className={styles.iconButton}
                        onClick={() => handleEditAnnouncement(announcement)}
                        aria-label="Edit announcement"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={styles.iconButton}
                        onClick={() => handleDelete(announcement.id)}
                        aria-label="Delete announcement"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={styles.noData}>
                    No announcements found. Create your first announcement!
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Centered Pagination */}
          {announcements.length > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                totalItems={pagination.total}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </Table>
      </div>

      <AnnounceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAnnouncement(null);
        }}
        onSubmit={handleSubmitAnnouncement}
        loading={loading}
        initialData={editingAnnouncement}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onDelete={confirmDelete}
        itemName="this announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
      />
    </div>
  );
};

export default Announcement;