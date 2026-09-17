// src/pages/classes/GetClasses.jsx
import styles from "./Classes.module.css";
import {
  FaSearch,
  FaSync,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUsers,
  FaCalendarAlt,
} from "react-icons/fa";
import Table from "../../components/Table/Table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../Utils/api";
import FilterComponent from "../../components/Filter/Filter";
import AddClass from "./AddClass";
import EditClass from "./EditClass";
import DeleteConfirmModal from "../../components/FinalDeleteModal/DeleteConfirmModal";

const GetClasses = () => {
  const [classes, setClasses] = useState([]);
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
  const [editClassItem, setEditClassItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchClasses();
  }, [pagination.page, pagination.pageSize, filter, debouncedSearch]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch,
        ...cleanFilters(filter),
        include: "Course", // Assuming backend supports including course title
      };
      const response = await api.get("/classes", { params: queryParams });
      const data = response.data?.data || [];

      setClasses(data);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.total || 0,
        totalPages: Math.ceil(
          (response.data?.total || 0) / pagination.pageSize
        ),
      }));
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const cleanFilters = (filters) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value === "" || value === undefined) continue;
      if (key === "is_active") cleaned[key] = value === "true";
      else cleaned[key] = value;
    }
    return cleaned;
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  const handleRefresh = () => fetchClasses();

  const handleToggleActive = async (id, current) => {
    try {
      await api.put(`/classes/${id}`, { is_active: !current });
      toast.success("Class status updated");
      fetchClasses();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteClick = (cls) => {
    setClassToDelete(cls);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await api.delete(`/classes/${classToDelete.id}`);
      toast.success("Class deleted successfully");
      fetchClasses();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete class");
      console.error("Failed to delete class", error);
    }
  };

  const filterConfig = [
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

  const toolbarRight = (
    <button className={styles.iconButton} onClick={handleRefresh}>
      <FaSync />
    </button>
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>All Classes / Batches</h2>
          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by batch name or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
              <FaPlus /> Add Class
            </button>
          </div>
        </div>

        <Table
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
                <th>Course</th>
                <th>Batch Name</th>
                <th>Schedule</th>
                <th>Dates</th>
                <th>Seats</th>
                <th>Instructor</th>
                <th>Meeting Link</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className={styles.loadingCell}>
                    <div className={styles.spinnerContainer}>
                      <div className={styles.customSpinner}></div>
                    </div>
                  </td>
                </tr>
              ) : classes.length > 0 ? (
                classes.map((cls) => (
                  <tr key={cls.id}>
                    <td className={styles.noWrapText}>
                      {cls.Course?.title || "Unknown Course"}
                    </td>
                    <td>{cls.batch_name}</td>
                    <td>
                      {cls.schedule_details ? (
                        <div>
                          <div>{cls.schedule_details.days?.join(", ")}</div>
                          <small>{cls.schedule_details.time}</small>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <div className={styles.dateColumn}>
                        <FaCalendarAlt className={styles.calendarIcon} />
                        <div>
                          <div>
                            {new Date(cls.start_date).toLocaleDateString()}
                          </div>
                          {cls.end_date && (
                            <small>
                              to {new Date(cls.end_date).toLocaleDateString()}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.seats}>
                        <FaUsers />
                        <span>
                          {cls.enrolled_count} / {cls.max_seats}
                        </span>
                        <div className={styles.seatBar}>
                          <div
                            className={styles.seatFill}
                            style={{
                              width: `${
                                (cls.enrolled_count / cls.max_seats) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>{cls.instructor_name || "-"}</td>
                    <td>
                      {cls.meeting_link ? (
                        <a
                          href={cls.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                        >
                          Join Meeting
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <label className={styles.toggleWrapper}>
                        <input
                          type="checkbox"
                          checked={cls.is_active}
                          onChange={() =>
                            handleToggleActive(cls.id, cls.is_active)
                          }
                          className={styles.toggleInput}
                        />
                        <div className={styles.toggleSlider}>
                          <div className={styles.toggleKnob}></div>
                        </div>
                      </label>
                    </td>
                    <td>
                      <button
                        className={`${styles.actionBtn} ${styles.edit}`}
                        onClick={() => setEditClassItem(cls)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.delete}`}
                        onClick={() => handleDeleteClick(cls)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className={styles.noData}>
                    No classes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className={styles.paginationContainer}>
            <div className={styles.pageInfo}>
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(
                pagination.page * pagination.pageSize,
                pagination.total
              )}{" "}
              of {pagination.total} classes
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
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`${styles.pageButton} ${
                      pagination.page === page ? styles.active : ""
                    }`}
                  >
                    {page}
                  </button>
                ))}
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

        {/* Modals */}
        {showAdd && (
          <AddClass
            onClose={() => setShowAdd(false)}
            onSuccess={fetchClasses}
          />
        )}

        {editClassItem && (
          <EditClass
            classItem={editClassItem}
            onClose={() => setEditClassItem(null)}
            onSuccess={fetchClasses}
          />
        )}

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteConfirmed}
          itemName="class/batch"
        />
      </div>
    </div>
  );
};

export default GetClasses;
