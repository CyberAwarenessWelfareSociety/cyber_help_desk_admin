// Banners.js
import React, { useCallback, useEffect, useState } from "react";
import styles from "./Banners.module.css";
import BannerModal from "./BannerModal";
import api from "../../../Utils/api";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrashAlt } from "react-icons/fa";
import { BANNER_COUNTRIES, countryLabel } from "./bannerCountries";

const platformLabel = (banner) => {
  const labels = {
    IOS: "iOS",
    ANDROID: "Android",
    WEB: "Web",
  };
  const platforms = Array.isArray(banner?.platforms)
    ? banner.platforms
    : String(banner?.platform || "ALL").toUpperCase() === "ALL"
      ? Object.keys(labels)
      : String(banner?.platform || "")
          .split(",")
          .map((platform) => platform.trim());
  const selected = [...new Set(platforms)].filter((platform) => labels[platform]);

  return selected.length === Object.keys(labels).length
    ? "All devices"
    : selected.map((platform) => labels[platform]).join(" + ") || "All devices";
};

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [loading, setLoading] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState(null);
  const [countryFilter, setCountryFilter] = useState("ALL");

  const totalPages = Math.ceil(total / limit);

  const getBanner = useCallback(async () => {
    try {
      const params = { limit, page };
      if (countryFilter !== "ALL") params.country_code = countryFilter;
      const response = await api.get("/get-banner", { params });
      setBanners(response.data?.data || []);
      setTotal(response.data?.total || 0);
    } catch {
      toast.error("Something went wrong while fetching banners.");
    }
  }, [countryFilter, page]);

  useEffect(() => {
    getBanner();
  }, [getBanner]);

  const uploadBannerImage = async (image) => {
    const formData = new FormData();
    formData.append("file", image);
    const response = await api.post("/banner/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const data = response?.data;
    const imageUrl = data?.files?.[0]?.url || data?.file?.url || data?.url || data?.data?.url || (Array.isArray(data) ? data[0]?.url : null);
    if (!imageUrl) throw new Error("Upload completed but the image URL was missing");
    return imageUrl;
  };

  const handleAddBanner = async ({ image, display_order, placement, platforms, target_url, country_code }) => {
    if (!image) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);

    try {
      const imageUrl = await uploadBannerImage(image);

      const payload = {
        link: imageUrl,
        display_order: Number(display_order) || banners.length + 1 || 1,
        placement,
        platforms,
        target_url,
        country_code,
      };

      await api.post("/create-banner", payload);
      toast.success("Advertisement uploaded");

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

  const handleDelete = async (img) => {
    if (!window.confirm(`Delete this ${countryLabel(img.country_code)} advertisement?`)) return;
    setLoading(true);
    try {
      await api.delete(`/delete-banner/${img.id}`);
      toast.success("Advertisement deleted");
      await getBanner();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete advertisement");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type = "add", img = null) => {
    setModalType(type);
    setSelectedImageData(img);
    setIsModalOpen(true);
  };

  const handleUpdateBanner = async ({ image, display_order, placement, platforms, target_url, country_code }) => {
    if (!selectedImageData) {
      toast.error("No image selected for update");
      return;
    }

    setLoading(true);
    let newImageUrl = selectedImageData.link;

    try {
      // Upload first. The backend removes the replaced bucket object only after
      // the database update succeeds.
      if (image) {
        newImageUrl = await uploadBannerImage(image);
      }

      const payload = {
        link: newImageUrl,
        display_order: Number(display_order) || selectedImageData.display_order || 1,
        placement,
        platforms,
        target_url,
        country_code,
      };

      await api.put(`/update-banner/${selectedImageData.id}`, payload);
      toast.success("Advertisement updated");

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
        <div>
          <h2 className={styles.title}>Home Advertisements</h2>
          <p className={styles.subtitle}>
            Upload separate advertisements for the Cyber Help Desk Team and District Safety Force home sections.
          </p>
        </div>
        <button className={styles.addButton} onClick={() => handleOpenModal("add")}>
          <FaPlus /> Upload Advertisement
        </button>
      </div>

      <div className={styles.filters}>
        <label htmlFor="banner-country-filter">Country</label>
        <select
          id="banner-country-filter"
          value={countryFilter}
          onChange={(event) => { setCountryFilter(event.target.value); setPage(1); }}
        >
          <option value="ALL">All countries</option>
          <option value="GLOBAL">Global only</option>
          {BANNER_COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name} ({country.code})
            </option>
          ))}
        </select>
      </div>

      <div className={styles.grid}>
        {banners.length > 0 ? (
          banners.map((img) => (
            <div key={img.id} className={styles.bannerCard}>
              <img src={img.link} alt="Advertisement" className={styles.bannerImage} />
              <span className={styles.placementBadge}>
                {img.placement === "DISTRICT_SAFETY_FORCE"
                  ? "District Safety Force"
                  : img.placement === "CYBER_HELP_DESK"
                    ? "Cyber Help Desk Team"
                    : "General banner"}
              </span>
              <span className={styles.countryBadge}>{countryLabel(img.country_code)}</span>
              <span className={styles.platformBadge}>{platformLabel(img)}</span>
              {img.target_url && (
                <span className={styles.linkBadge}>Redirect enabled</span>
              )}
              <div className={styles.bannerActions}>
                <button
                  className={`${styles.bannerButton} ${styles.edit}`}
                  onClick={() => handleOpenModal("update", img)}
                >
                  <FaEdit />
                </button>
                <button
                  className={`${styles.bannerButton} ${styles.delete}`}
                  onClick={() => handleDelete(img)}
                  disabled={loading}
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>No advertisements available.</div>
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
