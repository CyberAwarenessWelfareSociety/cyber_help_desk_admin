// src/pages/class-materials/GetClassMaterials.jsx
import styles from "./ClassMaterials.module.css";
import {
  FaSearch,
  FaSync,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilePdf,
  FaVideo,
  FaImage,
  FaMusic,
  FaFile,
} from "react-icons/fa";
import Table from "../../components/Table/Table";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import FilterComponent from "../../components/Filter/Filter";
import DeleteConfirmModal from "../../components/FinalDeleteModal/DeleteConfirmModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddClassMaterial from "./AddClassMaterial";
import EditClassMaterial from "./EditClassMaterial";
import api from "@/Utils/api";
import { useParams } from "react-router-dom";

const GetClassMaterials = () => {
  const { id } = useParams();
  const class_id = id;
  const [materials, setMaterials] = useState([]);
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
  const [editMaterial, setEditMaterial] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch classes for filter
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/get-class?limit=all");
        setClasses(res.data?.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load classes");
      }
    };
    fetchClasses();
  }, []);

  // Fetch materials
  useEffect(() => {
    fetchMaterials();
  }, [pagination.page, pagination.pageSize, debouncedSearch, filter]);

  const fetchMaterials = async () => {
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

      const res = await api.get(`/materials/class/${id}`, { params: queryParams });

      const data = res.data?.data || [];
      setMaterials(data);
      setPagination((prev) => ({
        ...prev,
        total: res.data?.total || 0,
        totalPages: Math.ceil((res.data?.total || 0) / pagination.pageSize),
      }));
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch class materials");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchMaterials();

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  const handleDelete = (material) => {
    setMaterialToDelete(material);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!materialToDelete) return;
    try {
      await api.delete(`/materials/${materialToDelete.id}`);
      toast.success("Material deleted successfully");
      fetchMaterials();
      setIsDeleteModalOpen(false);
      setMaterialToDelete(null);
    } catch (err) {
      toast.error("Failed to delete material");
    }
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case "VIDEO": return <FaVideo style={{ color: "#ef4444" }} />;
      case "PDF": return <FaFilePdf style={{ color: "#dc2626" }} />;
      case "IMAGE": return <FaImage style={{ color: "#10b981" }} />;
      case "AUDIO": return <FaMusic style={{ color: "#8b5cf6" }} />;
      default: return <FaFile style={{ color: "#6b7280" }} />;
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
    <button className={styles.iconButton} onClick={handleRefresh} title="Refresh">
      <FaSync />
    </button>
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>All Class Materials</h2>
          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
     
            </div>
            <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
              <FaPlus /> Add Material
            </button>
          </div>
        </div>

        <Table
          rightSlot={toolbarRight}
          filterContent={
            <div className="p-4 pt-0"></div>
          }
        >
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Type</th>
                <th>Title</th>
    
                <th>Preview / Link</th>
                <th>Actions</th>
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
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.noData}>
                    No materials found
                  </td>
                </tr>
              ) : (
                materials.map((m) => (
                  <tr key={m.id}>
                    {/* Type */}
                    <td>
                      <div className={styles.typeIcon}>
                        {getMaterialIcon(m.material_type)}
                        <span>{m.material_type}</span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className={styles.title}>{m.title}</td>

                

                    {/* Preview / Link */}
                    <td>
                      {m.material_type === "IMAGE" ? (
                        <img
                          src={m.url}
                          alt={m.title}
                          className={styles.thumbnail}
                          onClick={() => setPreviewUrl(m.url)}
                          style={{ cursor: "pointer" }}
                        />
                      ) : (
                        <div className={styles.noPreview}>
                          {getMaterialIcon(m.material_type)}
                          <div>No Preview</div>
                        </div>
                      )}
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.externalLink}
                      >
                        Open Link ↗
                      </a>
                    </td>

                    {/* Actions */}
                    <td>
                      <button
                        className={`${styles.actionBtn} ${styles.edit}`}
                        onClick={() => setEditMaterial(m)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.delete}`}
                        onClick={() => handleDelete(m)}
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
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
              {pagination.total} materials
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

        {/* Delete Modal */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={confirmDelete}
          itemName="material"
          itemTitle={materialToDelete?.title}
        />

        {/* Add Modal */}
        {showAdd && (
          <AddClassMaterial
            class_id={class_id}
            onClose={() => setShowAdd(false)}
            onSuccess={fetchMaterials}
            classes={classes}
          />
        )}

        {/* Edit Modal */}
        {editMaterial && (
          <EditClassMaterial
          class_id={class_id}
            material={editMaterial}
            onClose={() => setEditMaterial(null)}
            onSuccess={fetchMaterials}
            classes={classes}
          />
        )}

        {/* Image Preview Modal */}
        <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
          <DialogContent className="max-w-4xl p-0 border-0 shadow-2xl">
            <DialogHeader className="p-6 pb-3 bg-gray-50">
              <DialogTitle className="text-xl font-semibold">
                {materials.find(m => m.url === previewUrl)?.title || "Material Preview"}
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 bg-black">
              <img
                src={previewUrl}
                alt="Full preview"
                className="w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
            <div className="p-4 bg-gray-50 flex justify-end">
              <Button variant="outline" onClick={() => setPreviewUrl(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GetClassMaterials;