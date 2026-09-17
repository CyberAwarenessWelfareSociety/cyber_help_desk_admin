// Banners.js
import React, { useEffect, useState } from "react";
import styles from "./Banners.module.css";
import BannerModal from "./BannerModal";
import api from "../../../Utils/api";
import toast from "react-hot-toast";
import axios from "axios";
import { FaPlus, FaEdit, FaTrashAlt } from "react-icons/fa";

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [loading, setLoading] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState(null);

  const totalPages = Math.ceil(total / limit);

  const getBanner = async () => {
    try {
      const response = await api.get(`/get-Banner?limit=${limit}&page=${page}`);
      setBanners(response.data?.data || []);
      setTotal(response.data?.total || 0);
    } catch (error) {
      toast.error("Something went wrong while fetching banners.");
    }
  };

  useEffect(() => {
    getBanner();
  }, [page]);

  // ✅ Handles ALL possible upload response shapes:
  // A) { files: [{ url }] }
  // B) { file: { url } }
  // C) { url: "..." }
  // D) [{ url: "..." }]
  const extractUploadedUrl = (data) => {
    if (!data) return null;

    if (Array.isArray(data?.files) && data.files[0]?.url) return data.files[0].url;
    if (data?.file?.url) return data.file.url;
    if (typeof data?.url === "string") return data.url;

    if (Array.isArray(data) && data[0]?.url) return data[0].url;

    return null;
  };

  const uploadSingleImage = async (imageFile) => {
    const formData = new FormData();
    formData.append("file", imageFile);

    const uploadRes = await axios.post(
      "https://bucket.cyberawareness.ngo/bucket/upload/cybercrime",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const imageUrl = extractUploadedUrl(uploadRes?.data);

    if (!imageUrl) {
      console.log("Upload response:", uploadRes?.data);
      throw new Error("Failed to get image URL from upload response");
    }

    return imageUrl;
  };

  const handleAddBanner = async ({ image, display_order }) => {
    if (!image) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);

    try {
      const imageUrl = await uploadSingleImage(image);

      const payload = {
        link: imageUrl,
        // ✅ your UI sends display_order but you were ignoring it; keeping your old behavior:
        display_order: banners.length + 1 || 1,
      };

      await api.post("/create-Banner", payload);
      toast.success("Banner created");

      await getBanner();
      setIsModalOpen(false);
      setSelectedImageData(null);
    } catch (err) {
      const errMessage =
        err?.response?.data?.error || err?.response?.data?.message || err.message || "Upload failed";
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFromBucketAndDB = async (_, img) => {
    const fileName = img?.link?.split("/").pop();
    if (!fileName) return;

    try {
      await axios.delete("https://qiktrack.com/bucket/delete-multiple/cybercrime", {
        data: { filenames: [fileName] },
        headers: { "Content-Type": "application/json" },
      });

      await api.delete(`/delete-banner/${img.id}`);
      toast.success("Banner deleted");
      await getBanner();
    } catch (error) {
      toast.error(error?.message || "Failed to delete banner");
    }
  };

  const handleOpenModal = (type = "add", img = null) => {
    setModalType(type);
    setSelectedImageData(img);
    setIsModalOpen(true);
  };

  const handleUpdateBanner = async ({ image, display_order }) => {
    if (!selectedImageData) {
      toast.error("No image selected for update");
      return;
    }

    setLoading(true);
    let newImageUrl = selectedImageData.link;

    try {
      // ✅ If user selected a new image, delete old one then upload new one
      if (image) {
        const oldFileName = selectedImageData.link?.split("/").pop();
        if (oldFileName) {
          await axios.delete("https://qiktrack.com/bucket/delete-multiple/cybercrime", {
            data: { filenames: [oldFileName] },
            headers: { "Content-Type": "application/json" },
          });
        }

        newImageUrl = await uploadSingleImage(image);
      }

      const payload = {
        link: newImageUrl,
        display_order: Number(display_order) || selectedImageData.display_order || 1,
      };

      await api.put(`/update-banner/${selectedImageData.id}`, payload);
      toast.success("Banner updated");

      await getBanner();
      setIsModalOpen(false);
      setSelectedImageData(null);
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.response?.data?.message || err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // Pagination UI
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
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} banners
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Banners</h2>
        <button className={styles.addButton} onClick={() => handleOpenModal("add")}>
          <FaPlus /> Add Banner
        </button>
      </div>

      <div className={styles.grid}>
        {banners.length > 0 ? (
          banners.map((img) => (
            <div key={img.id} className={styles.bannerCard}>
              <img src={img.link} alt="Banner" className={styles.bannerImage} />
              <div className={styles.bannerActions}>
                <button
                  className={`${styles.bannerButton} ${styles.edit}`}
                  onClick={() => handleOpenModal("update", img)}
                >
                  <FaEdit />
                </button>
                <button
                  className={`${styles.bannerButton} ${styles.delete}`}
                  onClick={() => handleDeleteFromBucketAndDB("delete", img)}
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>No banners available.</div>
        )}
      </div>

      {renderPagination()}

      <BannerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedImageData(null);
        }}
        onSubmit={modalType === "add" ? handleAddBanner : handleUpdateBanner}
        type={modalType}
        loading={loading}
        existingImage={selectedImageData}
      />
    </div>
  );
};

export default Banners;
