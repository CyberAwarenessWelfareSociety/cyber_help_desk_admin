// src/pages/classes/GetClasses.jsx
import styles from "./class/Classes.module.css";
import {
  FaSync,
  FaPlus,
  FaEdit,
  FaTrash,
  FaQuestionCircle,
  FaBook,
  FaVideo,
  FaChartBar,
} from "react-icons/fa";
import Table from "../../components/Table/Table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FilterComponent from "../../Components/Filter/Filter";
import DeleteConfirmModal from "../../Components/FinalDeleteModal/DeleteConfirmModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddClass from "./class/AddClass";
import EditClass from "./class/EditClass";
import api from "@/Utils/api";
import { useParams, useNavigate } from "react-router-dom";

const GetClasses = () => {
  const { id } = useParams(); // courseId from URL
  const navigate = useNavigate();

  const courseId = id;

  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    course_id: "",
    class_type: "",
  });
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
  const [previewThumbnail, setPreviewThumbnail] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch courses for filter & add/edit forms
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/get-course?limit=all");
        setCourses(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        toast.error("Failed to load courses");
      }
    };
    fetchCourses();
  }, []);

  // Fetch classes
  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.pageSize, debouncedSearch, filter]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        course_id: filter.course_id || undefined,
        class_type: filter.class_type || undefined,
        sortBy: "createdAt",
        order: "DESC",
      };

      const response = await api.get(`/classes/${id}`, { params: queryParams });

      const classesData = response.data?.data || [];
      const total = response.data?.total || 0;

      setClasses(classesData);
      setPagination((prev) => ({
        ...prev,
        total,
        totalPages: Math.ceil(total / prev.pageSize),
      }));
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  const handleRefresh = () => fetchClasses();

  const handleDeleteClick = (cls) => {
    setClassToDelete(cls);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!classToDelete) return;
    try {
      await api.delete(`/classes/${classToDelete.id}`);
      toast.success("Class deleted successfully");
      fetchClasses();
      setIsDeleteModalOpen(false);
      setClassToDelete(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete class"
      );
    }
  };

  const filterConfig = [
    {
      key: "class_type",
      label: "Type",
      type: "select",
      options: [
        { value: "", label: "All Types" },
        { value: "NORMAL", label: "Normal" },
        { value: "LIVE", label: "Live" },
      ],
    },
  ];

  const toolbarRight = (
    <button className={styles.iconButton} onClick={handleRefresh}>
      <FaSync title="Refresh" />
    </button>
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>All Classes</h2>

          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by class title..."
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
          title=""
          rightSlot={toolbarRight}
          filterContent={
            <FilterComponent
              config={filterConfig}
              values={filter}
              onChange={(newFilter) => {
                setFilter(newFilter);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          }
        >
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Thumbnail</th>
                <th>Title</th>
                <th>Course</th>
                <th>Type</th>
                <th>Duration (min)</th>
                <th>Order</th>
                <th>Passing %</th>
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
                    <td>
                      {cls.thumbnail ? (
                        <img
                          src={cls.thumbnail}
                          alt={cls.title}
                          className={styles.thumbnail}
                          onClick={() => setPreviewThumbnail(cls.thumbnail)}
                          style={{ cursor: "pointer" }}
                        />
                      ) : (
                        <div className={styles.noThumbnail}>No Image</div>
                      )}
                    </td>

                    <td className={styles.noWrapText}>{cls.title}</td>
                    <td>{cls.Course?.title || "-"}</td>

                    <td>
                      <span
                        className={`${styles.typeBadge} ${
                          cls.class_type === "LIVE"
                            ? styles.live
                            : styles.normal
                        }`}
                      >
                        {cls.class_type || "-"}
                      </span>
                    </td>

                    <td>{cls.class_duration || "-"}</td>
                    <td>{cls.order_no ?? "-"}</td>

                    <td>
                      {cls.passing_percentage
                        ? `${cls.passing_percentage}%`
                        : "-"}
                    </td>

                    <td>
                      <div className={styles.actionGroup}>
                        {/* ✅ NEW: Video page (always show) -> /video/:id */}
                        <button
                          className={`${styles.actionBtn} ${styles.success}`}
                          onClick={() => navigate(`/video/${cls.id}`)}
                          title="Watch Video"
                        >
                          <FaVideo />
                        </button>

                        {/* View Questions */}
                        <button
                          className={`${styles.actionBtn} ${styles.info}`}
                          onClick={() => navigate(`/set-question/${cls.id}`)}
                          title="View Questions"
                        >
                          <FaQuestionCircle />
                        </button>

                        {/* Quiz stats */}
                        {/* <button
                          className={`${styles.actionBtn} ${styles.info}`}
                          onClick={() => navigate(`/answer/${cls.id}`)}
                          title="View Quiz Stats"
                        >
                          <FaChartBar />
                        </button> */}

                        {/* View Materials */}
                        <button
                          className={`${styles.actionBtn} ${styles.primary}`}
                          onClick={() => navigate(`/class-materials/${cls.id}`)}
                          title="View Class Materials"
                        >
                          <FaBook />
                        </button>

                        {/* Edit */}
                        <button
                          className={`${styles.actionBtn} ${styles.edit}`}
                          onClick={() => setEditClassItem(cls)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>

                        {/* Delete */}
                        <button
                          className={`${styles.actionBtn} ${styles.delete}`}
                          onClick={() => handleDeleteClick(cls)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
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
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}{" "}
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

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                  (page) => (
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

        {/* Modals */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setClassToDelete(null);
          }}
          onDelete={handleDeleteConfirmed}
          itemName="class"
          itemTitle={classToDelete?.title}
        />

        {showAdd && (
          <AddClass
            courseId={courseId}
            onClose={() => setShowAdd(false)}
            onSuccess={fetchClasses}
            courses={courses}
          />
        )}

        {editClassItem && (
          <EditClass
            courseId={courseId}
            classItem={editClassItem}
            onClose={() => setEditClassItem(null)}
            onSuccess={fetchClasses}
            courses={courses}
          />
        )}

        {/* Thumbnail Preview Modal */}
        <Dialog
          open={!!previewThumbnail}
          onOpenChange={() => setPreviewThumbnail(null)}
        >
          <DialogContent className="max-w-3xl p-0 border-0">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle>Class Thumbnail</DialogTitle>
            </DialogHeader>

            <div className="p-4">
              <img
                src={previewThumbnail}
                alt="Class thumbnail preview"
                className="w-full rounded-lg shadow-lg"
              />
            </div>

            <div className="p-4 pt-0 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setPreviewThumbnail(null)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GetClasses;
