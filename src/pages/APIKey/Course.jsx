// src/pages/courses/GetCourses.jsx
import styles from "./course/Courses.module.css";
import {
  FaSearch,
  FaSync,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBook,
  FaClipboardCheck,
  FaVideo,
  FaQuestionCircle,
  FaUsers,
  FaChalkboardTeacher,
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
import AddCourse from "./course/AddCourse";
import EditCourse from "./course/EditCourse";
import api from "@/Utils/api";
import { useNavigate } from "react-router-dom";

const GetCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    course_type: "",
    is_published: "",
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
  const [editCourse, setEditCourse] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch courses when dependencies change
  useEffect(() => {
    fetchCourses();
  }, [pagination.page, pagination.pageSize, debouncedSearch, filter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        course_type: filter.course_type || undefined,
        is_published:
          filter.is_published === "" ? undefined : filter.is_published,
        sortBy: "createdAt",
        order: "DESC",
      };

      const response = await api.get("/courses", { params: queryParams });

      const coursesData = response.data?.data || [];
      const total = response.data?.total || 0;

      setCourses(coursesData);
      setPagination((prev) => ({
        ...prev,
        total,
        totalPages: Math.ceil(total / pagination.pageSize),
      }));
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
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

  const handleRefresh = () => fetchCourses();

  const handleTogglePublish = async (id, current) => {
    try {
      await api.put(`/courses/${id}`, { is_published: !current });
      toast.success("Publish status updated");
      fetchCourses();
    } catch (error) {
      toast.error("Failed to update publish status");
    }
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!courseToDelete) return;
    try {
      await api.delete(`/courses/${courseToDelete.id}`);
      toast.success("Course deleted successfully");
      fetchCourses();
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
    } catch (error) {
      toast.error(
        error.response.data?.message ||
          error.message ||
          "Failed to delete course"
      );
      console.error("Failed to delete course", error);
    }
  };

  const filterConfig = [
    {
      key: "is_published",
      label: "Published",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Published" },
        { value: "false", label: "Draft" },
      ],
    },
    {
      key: "course_type",
      label: "Type",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "LIVE", label: "Live" },
        { value: "NORMAL", label: "Normal" },
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
          <h2 className={styles.cardTitle}>All Courses</h2>
          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
              <FaPlus /> Add Course
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
                <th>Image</th>
                <th>Title</th>
                <th>Type</th>
                <th>Duration (weeks)</th>
                <th>Actual Price</th>
                <th>Discount Price</th>
                <th>Published</th>
                <th>Actions</th>
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
              ) : courses.length > 0 ? (
                courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      {course.images && course.images.length > 0 ? (
                        <img
                          src={course.images[0]}
                          alt={course.title}
                          className={styles.thumbnail}
                          onClick={() => setPreviewImage(course.images[0])}
                          style={{ cursor: "pointer" }}
                        />
                      ) : (
                        <div className={styles.noThumbnail}>No Image</div>
                      )}
                    </td>
                    <td className={styles.noWrapText}>{course.title}</td>
                    <td>{course.course_type || "-"}</td>
                    <td>{course.course_duration || "-"}</td>
                    <td>₹{course.actual_price || "0.00"}</td>
                    <td>₹{course.discount_price || "0.00"}</td>
                    <td>
                      <label className={styles.toggleWrapper}>
                        <input
                          type="checkbox"
                          checked={course.is_published}
                          onChange={() =>
                            handleTogglePublish(course.id, course.is_published)
                          }
                          className={styles.toggleInput}
                        />
                        <div className={styles.toggleSlider}>
                          <div className={styles.toggleKnob}></div>
                        </div>
                      </label>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                
                        <button
                          className={`${styles.actionBtn} ${styles.warning}`}
                          onClick={() => {
                            navigate(`/class/${course.id}`);
                          }}
                          title="View Classes"
                        >
                          <FaChalkboardTeacher />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.primary}`}
                          onClick={() => {
                            navigate(`/enrollment/${course.id}`);
                          }}
                          title="View Enrollments"
                        >
                          <FaUsers />
                        </button>
                        {/* View Materials */}
                    

                        {/* Existing Edit */}
                        <button
                          className={`${styles.actionBtn} ${styles.edit}`}
                          onClick={() => setEditCourse(course)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>

                        {/* Existing Delete */}
                        <button
                          className={`${styles.actionBtn} ${styles.delete}`}
                          onClick={() => handleDeleteClick(course)}
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
                  <td colSpan="8" className={styles.noData}>
                    No courses found
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
              of {pagination.total} courses
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
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCourseToDelete(null);
          }}
          onDelete={handleDeleteConfirmed}
          itemName="course"
          itemTitle={courseToDelete?.title}
        />

        {showAdd && (
          <AddCourse
            onClose={() => setShowAdd(false)}
            onSuccess={fetchCourses}
          />
        )}

        {editCourse && (
          <EditCourse
            course={editCourse}
            onClose={() => setEditCourse(null)}
            onSuccess={fetchCourses}
          />
        )}

        {/* Image Preview Modal */}
        <Dialog
          open={!!previewImage}
          onOpenChange={() => setPreviewImage(null)}
        >
          <DialogContent className="max-w-3xl p-0">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle>Course Image Preview</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full rounded-lg"
              />
            </div>
            <div className="p-4 pt-0 flex justify-end">
              <Button variant="outline" onClick={() => setPreviewImage(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GetCourses;
