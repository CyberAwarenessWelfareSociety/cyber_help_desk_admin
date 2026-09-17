// src/pages/class-questions/GetClassQuestions.jsx
import styles from "./ClassQuestions.module.css";
import {
  FaSearch,
  FaSync,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaUser,
} from "react-icons/fa";
import Table from "../../components/Table/Table";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import FilterComponent from "../../Components/Filter/Filter";
import DeleteConfirmModal from "../../Components/FinalDeleteModal/DeleteConfirmModal";
import AddQuestion from "./AddQuestion";
import EditQuestion from "./EditQuestion";
import api from "@/Utils/api";
import { useParams } from "react-router-dom";

const GetClassQuestions = () => {
  const { id } = useParams();
  const class_id = id;
  const [questions, setQuestions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ class_id: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editQuestionItem, setEditQuestionItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch all classes for filter dropdown
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/get-class?limit=all");
        setClasses(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load classes:", err);
        toast.error("Failed to load classes for filter");
      }
    };
    fetchClasses();
  }, []);

  // Fetch questions
  useEffect(() => {
    fetchQuestions();
  }, [pagination.page, pagination.pageSize, debouncedSearch, filter]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        class_id: filter.class_id || undefined,
        sortBy: "createdAt",
        order: "DESC",
      };

      const res = await api.get(`/questions/${id}`, { params: queryParams });

      const data = res.data?.data || [];
      const total = res.data?.total || 0;

      setQuestions(data);
      setPagination((prev) => ({
        ...prev,
        total,
        totalPages: Math.ceil(total / pagination.pageSize),
      }));
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to fetch class questions");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchQuestions();

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  const handleDelete = (question) => {
    setQuestionToDelete(question);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    try {
      await api.delete(`/questions/${questionToDelete.id}`);
      toast.success("Question deleted successfully");
      fetchQuestions();
      setIsDeleteModalOpen(false);
      setQuestionToDelete(null);
    } catch (err) {
      console.error("Delete question error:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete question"
      );
    }
  };

  const filterConfig = [
    {
      key: "class_id",
      label: "Class",
      type: "select",
      options: [
        { value: "", label: "All Classes" },
        ...classes.map((cls) => ({
          value: cls.id,
          label: `${cls.title} `,
        })),
      ],
    },
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

  // Helper to display correct answer
  const renderCorrectAnswer = (q) => {
    if (!q.correct_answer) return <em style={{ color: "#9ca3af" }}>Not set</em>;

    const optionKey = q.correct_answer; // "option_a", etc.
    const optionLetter = optionKey.replace("option_", "").toUpperCase();
    const optionText = q[optionKey];

    return (
      <span className={styles.correctAnswer}>
        <FaCheckCircle style={{ color: "#16a34a", marginRight: 6 }} />
        <strong>
          {optionLetter}: {optionText}
        </strong>
      </span>
    );
  };

  // Helper to render asked by
  const renderAskedBy = (q) => {
    if (!q.AskedBy) return <span style={{ color: "#6b7280" }}>Admin</span>;
    return (
      <div className={styles.askedBy}>
        <FaUser style={{ marginRight: 4 }} />
        {q.AskedBy.name}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>All Class Questions (MCQs)</h2>
          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search by question text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
              <FaPlus /> Add Question
            </button>
          </div>
        </div>

        <Table
          rightSlot={toolbarRight}
          filterContent={<div className="p-2"></div>}
        >
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Question</th>
                <th>Class </th>
                <th>Asked By</th>
                <th>Options</th>
                <th>Correct Answer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className={styles.loadingCell}>
                    <div className={styles.spinnerContainer}>
                      <div className={styles.customSpinner}></div>
                    </div>
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan="6" className={styles.noData}>
                    No questions found
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id}>
                    <td className={styles.questionText}>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: q.question.replace(/\n/g, "<br />"),
                        }}
                      />
                    </td>
                    <td>
                      <div>
                        <strong>{q.Class?.title || "-"}</strong>
                        <br />
                        <small style={{ color: "#6b7280" }}></small>
                      </div>
                    </td>
                    <td>{renderAskedBy(q)}</td>
                    <td className={styles.optionsCell}>
                      {q.option_a && (
                        <div>
                          <strong>A:</strong> {q.option_a}
                        </div>
                      )}
                      {q.option_b && (
                        <div>
                          <strong>B:</strong> {q.option_b}
                        </div>
                      )}
                      {q.option_c && (
                        <div>
                          <strong>C:</strong> {q.option_c}
                        </div>
                      )}
                      {q.option_d && (
                        <div>
                          <strong>D:</strong> {q.option_d}
                        </div>
                      )}
                    </td>
                    <td>{renderCorrectAnswer(q)}</td>
                    <td>
                      <button
                        className={`${styles.actionBtn} ${styles.edit}`}
                        onClick={() => setEditQuestionItem(q)}
                        title="Edit Question"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.delete}`}
                        onClick={() => handleDelete(q)}
                        title="Delete Question"
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
              of {pagination.total} questions
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
            setQuestionToDelete(null);
          }}
          onDelete={confirmDelete}
          itemName="question"
          itemTitle={questionToDelete?.question?.slice(0, 50) + "..."}
        />

        {showAdd && (
          <AddQuestion
            class_id={class_id}
            onClose={() => setShowAdd(false)}
            onSuccess={fetchQuestions}
            classes={classes}
          />
        )}

        {editQuestionItem && (
          <EditQuestion
            class_id={class_id}
            question={editQuestionItem}
            onClose={() => setEditQuestionItem(null)}
            onSuccess={fetchQuestions}
            classes={classes}
          />
        )}
      </div>
    </div>
  );
};

export default GetClassQuestions;
