// src/pages/enrollments/GetEnrollments.jsx
import styles from "./enrollments/Enrollments.module.css";
import {
  FaSearch,
  FaSync,
  FaPlus,
  FaEdit,
  FaTrash,
  FaRupeeSign,
} from "react-icons/fa";
import Table from "../../components/Table/Table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FilterComponent from "../../Components/Filter/Filter";
import DeleteConfirmModal from "../../Components/FinalDeleteModal/DeleteConfirmModal";

import EditEnrollment from "./Enrollments/EditEnrollment";
import api from "@/Utils/api";
import { format } from "date-fns";
import { useParams } from "react-router-dom";

const GetEnrollments = () => {
  const { id } = useParams();
  const [enrollments, setEnrollments] = useState([]);
  const [clients, setClients] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    client_id: "",
    course_id: "",
    status: "",
    enrollment_for: "",
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
  const [editEnrollment, setEditEnrollment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load clients & courses for filters and modals
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [clientRes, courseRes] = await Promise.all([
          api.get("/get-client?limit=all"),
          api.get("/get-course?limit=all"),
        ]);
        setClients(clientRes.data?.data || []);
        setCourses(courseRes.data?.data || []);
      } catch (err) {
        console.error("Failed to load filters:", err);
        toast.error("Failed to load students or courses");
      }
    };
    loadFilters();
  }, []);

  // Fetch enrollments
  useEffect(() => {
    fetchEnrollments();
  }, [pagination.page, pagination.pageSize, debouncedSearch, filter]);

const fetchEnrollments = async () => {
  setLoading(true);
  try {
    const queryParams = {
      page: pagination.page,
      limit: pagination.pageSize,
      search: debouncedSearch || undefined,
      client_id: filter.client_id || undefined,
      course_id: filter.course_id || undefined,
      status: filter.status || undefined,
      enrollment_for: filter.enrollment_for || undefined,
      sortBy: "createdAt",
      order: "DESC",
    };

    const res = await api.get(`/enrollments/course/${id}`, {
      
    });

    const data = res.data?.data || [];
    const total = res.data?.total || 0;

    setEnrollments(data);
    setPagination((prev) => ({
      ...prev,
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
    }));
  } catch (err) {
    console.error("Error fetching enrollments:", err);
    toast.error("Failed to fetch enrollments");
  } finally {
    setLoading(false);
  }
};

  const handleRefresh = () => fetchEnrollments();

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  const handleDelete = (enrollment) => {
    setEnrollmentToDelete(enrollment);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!enrollmentToDelete) return;
    try {
      await api.delete(`/enrollments/${enrollmentToDelete.id}`);
      toast.success("Enrollment deleted successfully");
      fetchEnrollments();
      setIsDeleteModalOpen(false);
      setEnrollmentToDelete(null);
    } catch (err) {
      toast.error("Failed to delete enrollment");
    }
  };

  const filterConfig = [

   
  ];

  const toolbarRight = (
    <button
      className={styles.iconButton}
      onClick={handleRefresh}
      title="Refresh"
    >
      <FaSync />
    </button>
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>All Enrollments</h2>
          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search by student name, phone, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
     
            </div>
      
          </div>
        </div>

        <Table
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
                <th>Student</th>
                <th>Course</th>
                <th>Type</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Enrolled On</th>
                <th>Transaction ID</th>
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
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan="8" className={styles.noData}>
                    No enrollments found
                  </td>
                </tr>
              ) : (
                enrollments.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div className={styles.studentInfo}>
                        <div className={styles.studentName}>
                          {e.Student?.name || "Unknown Student"}
                        </div>
                        {e.Student?.phone && (
                          <small className={styles.studentPhone}>
                            {e.Student.phone}
                          </small>
                        )}
                        {e.Student?.email && (
                          <small className={styles.studentEmail}>
                            {e.Student.email}
                          </small>
                        )}
                      </div>
                    </td>
                    <td className={styles.courseTitle}>
                      {e.Course?.title || "-"}
                    </td>
                    <td>
                      <span
                        className={`${styles.typeBadge} ${
                          e.enrollment_for === "LIVE_SESSION"
                            ? styles.liveSession
                            : styles.course
                        }`}
                      >
                        {e.enrollment_for === "LIVE_SESSION"
                          ? "Live Session"
                          : "Course"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          e.status === "COMPLETED"
                            ? styles.completed
                            : styles.enrolled
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className={styles.payment}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FaRupeeSign />
                        {parseFloat(e.payment || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      {e.enrolled_at
                        ? format(
                            new Date(e.enrolled_at),
                            "dd MMM yyyy, hh:mm a"
                          )
                        : "-"}
                    </td>
                    <td className={styles.transaction}>
                      {e.transaction_id || "-"}
                    </td>
                    <td>
               
                      <button
                        className={`${styles.actionBtn} ${styles.delete}`}
                        onClick={() => handleDelete(e)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
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
              of {pagination.total} enrollments
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
            setEnrollmentToDelete(null);
          }}
          onDelete={confirmDelete}
          itemName="enrollment"
          itemTitle={`${enrollmentToDelete?.Student?.name || "Student"} - ${
            enrollmentToDelete?.Course?.title || "Course"
          }`}
        />

       
      </div>
    </div>
  );
};

export default GetEnrollments;
