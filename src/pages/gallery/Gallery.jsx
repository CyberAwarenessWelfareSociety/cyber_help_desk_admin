import React, { useEffect, useState } from "react";
import styles from "./Gallery.module.css";
import GalleryModal from "./GalleryModal";
import toast from "react-hot-toast";
import axios from "axios";
import { FaPlus, FaEdit, FaTrashAlt } from "react-icons/fa";
import api from "@/Utils/api";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, item }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Confirm Deletion</h2>
        <p>
          Do you really want to delete the gallery item "{item?.header}"?
        </p>
        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.deleteConfirmButton} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const GalleryDetailModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  const reversedPhotos = [...(item.photo || [])].reverse();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{item.header}</h2>
        <div className={styles.detailContent}>
          <div className={styles.imageGrid}>
            {reversedPhotos.map((url, index) => (
              <img
                key={`detail-${index}`}
                src={url}
                alt={`${item.header} - Image ${(item.photo || []).length - index}`}
                className={styles.detailImage}
              />
            ))}
          </div>
          <p className={styles.detailDescription}>
            {item.description || "No description available."}
          </p>
          <p className={styles.detailDate}>
            Created:{" "}
            {new Date(item.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Gallery = () => {
  /* --------------------- Pagination State --------------------- */
  const [galleryItems, setGalleryItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 4;

  const totalPages = Math.ceil(total / limit);

  /* --------------------- Modal State --------------------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [loading, setLoading] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = user?.client_type === "ADMIN";

  /* --------------------- Fetch Gallery --------------------- */
  const getGallery = async () => {
    try {
      const res = await api.get(`/get-gallery?limit=${limit}&page=${page}`);
      setGalleryItems(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      toast.error("Something went wrong while fetching gallery items.");
    }
  };

  useEffect(() => {
    getGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  /* --------------------- Upload helpers --------------------- */
  const extractUploadedUrls = (data) => {
    if (!data) return [];

    // A) { files: [{ url }] }
    if (Array.isArray(data?.files)) {
      return data.files.map((f) => f?.url).filter(Boolean);
    }

    // B) { file: { url } }
    if (data?.file?.url) return [data.file.url];

    // C) { url: "..." }
    if (typeof data?.url === "string") return [data.url];

    // D) [{ url: "..." }]
    if (Array.isArray(data)) {
      return data.map((x) => x?.url).filter(Boolean);
    }

    return [];
  };

  const uploadImagesInBatches = async (images) => {
    const batchSize = 5;
    const imageUrls = [];

    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      const formData = new FormData();
      batch.forEach((img) => formData.append("file", img));

      const uploadRes = await axios.post(
        "https://bucket.cyberawareness.ngo/bucket/upload/cybercrime",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const batchUrls = extractUploadedUrls(uploadRes?.data);

      if (!batchUrls.length) {
        console.log("Upload response (gallery batch):", uploadRes?.data);
        throw new Error("Failed to upload images (no URLs returned)");
      }

      imageUrls.push(...batchUrls);
    }

    return imageUrls;
  };

  /* --------------------- CRUD Handlers --------------------- */
  const handleAddGalleryItem = async ({
    images,
    header,
    description,
    existingImages,
    createdAt,
  }) => {
    if (!images?.length) {
      toast.error("Please select at least one image");
      return;
    }

    setLoading(true);
    try {
      const imageUrls = await uploadImagesInBatches(images);
      const allImageUrls = [...(existingImages || []), ...imageUrls];

      const payload = {
        header,
        description,
        photo: allImageUrls,
        createdAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
      };

      await api.post("/create-gallery", payload);
      toast.success("Gallery item created");
      await getGallery();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGalleryItem = async ({
    images,
    header,
    description,
    existingImages,
    createdAt,
  }) => {
    if (!selectedGalleryItem) return toast.error("No item selected");

    setLoading(true);
    let newImageUrls = existingImages || [];

    try {
      // 1) Delete removed images
      const removed = (selectedGalleryItem.photo || []).filter(
        (url) => !newImageUrls.includes(url)
      );

      if (removed.length) {
        await axios.delete("https://qiktrack.com/bucket/delete-multiple/cybercrime", {
          data: { filenames: removed.map((u) => u.split("/").pop()).filter(Boolean) },
          headers: { "Content-Type": "application/json" },
        });
      }

      // 2) Upload new images
      if (images?.length) {
        const uploaded = await uploadImagesInBatches(images);
        newImageUrls = [...newImageUrls, ...uploaded];
      }

      // 3) Update DB
      const payload = {
        header,
        description,
        photo: newImageUrls,
        createdAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
      };

      await api.put(`/update-gallery/${selectedGalleryItem.id}`, payload);

      toast.success("Gallery item updated");
      await getGallery();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFromBucketAndDB = async (item) => {
    const filenames = (item?.photo || [])
      .map((url) => url?.split("/")?.pop())
      .filter(Boolean);

    try {
      if (filenames.length) {
        await axios.delete("https://qiktrack.com/bucket/delete-multiple/cybercrime", {
          data: { filenames },
          headers: { "Content-Type": "application/json" },
        });
      }

      await api.delete(`/delete-gallery/${item.id}`);
      toast.success("Gallery item deleted");
      await getGallery();
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    }
  };

  const handleOpenDeleteModal = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await handleDeleteFromBucketAndDB(itemToDelete);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleOpenModal = (type = "add", item = null) => {
    setModalType(type);
    setSelectedGalleryItem(item);
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (item) => {
    setSelectedDetailItem(item);
    setIsDetailModalOpen(true);
  };

  /* --------------------- Pagination UI --------------------- */
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`${styles.pageButton} ${i === page ? styles.active : ""}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className={styles.paginationContainer}>
        <div className={styles.pageInfo}>
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} items
        </div>

        <div className={styles.pageControls}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={styles.pageButton}
          >
            Previous
          </button>

          {pages}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={styles.pageButton}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  /* --------------------- Render --------------------- */
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gallery</h2>
        {isSuperAdmin && (
          <button className={styles.addButton} onClick={() => handleOpenModal("add")}>
            <FaPlus /> Add Gallery Item
          </button>
        )}
      </div>

      <div className={styles.grid}>
        {galleryItems.length > 0 ? (
          galleryItems.map((item) => (
            <div
              key={item.id}
              className={styles.galleryCard}
              onClick={() => handleOpenDetailModal(item)}
            >
              <img
                src={(item.photo || [])[ (item.photo || []).length - 1 ] || ""}
                alt={item.header || "Gallery item"}
                className={styles.galleryImage}
              />

              <div className={styles.galleryInfo}>
                <h3 className={styles.galleryHeader}>{item.header}</h3>
                <p className={styles.galleryDescription}>{item.description}</p>
              </div>

              {isSuperAdmin && (
                <div
                  className={styles.galleryActions}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className={`${styles.galleryButton} ${styles.edit}`}
                    onClick={() => handleOpenModal("update", item)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className={`${styles.galleryButton} ${styles.delete}`}
                    onClick={() => handleOpenDeleteModal(item)}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No gallery items available.</p>
          </div>
        )}
      </div>

      {renderPagination()}

      <GalleryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGalleryItem(null);
        }}
        onSubmit={modalType === "add" ? handleAddGalleryItem : handleUpdateGalleryItem}
        type={modalType}
        loading={loading}
        existingItem={selectedGalleryItem}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        item={itemToDelete}
      />

      <GalleryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailItem(null);
        }}
        item={selectedDetailItem}
      />
    </div>
  );
};

export default Gallery;
