import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/Utils/api";
import styles from "./VideoManager.module.css";
import modalStyles from "./Modal.module.css";

import { FaPlus, FaEdit, FaTrash, FaPlay, FaTimes } from "react-icons/fa";
import axios from "axios";

const BUCKET_UPLOAD_URL = "https://bucket.cyberawareness.ngo/bucket/upload/cybercrime";

const extractUploadedUrl = (data) => {
  if (!data) return null;

  // most common: { files: [{ url }] }
  if (Array.isArray(data?.files) && data.files[0]?.url) return data.files[0].url;

  // { file: { url } }
  if (data?.file?.url) return data.file.url;

  // { url: "..." }
  if (typeof data?.url === "string") return data.url;

  // { data: { url: "..." } }
  if (data?.data?.url) return data.data.url;

  // [{ url: "..." }]
  if (Array.isArray(data) && data[0]?.url) return data[0].url;

  return null;
};

const isValidUrl = (value) => {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

// ✅ bucket upload (video + thumbnail)
async function uploadToBucket(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await axios.post(BUCKET_UPLOAD_URL, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const url = extractUploadedUrl(res?.data);
  if (!url) {
    console.log("Bucket upload response:", res?.data);
    throw new Error("Upload succeeded but no URL returned");
  }
  return url;
}

const initialForm = (classId) => ({
  class_id: classId,
  title: "",
  video_url: "",
  duration: 0,
  thumbnail: "",
  description: "",
  order_no: 1,
  is_preview: false,
  is_published: true,
  is_skippable: true,
  min_watch_percent: 80,
});

export default function VideoManager() {
  const { classId } = useParams();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const filteredVideos = useMemo(() => {
    if (!search.trim()) return videos;
    const q = search.toLowerCase();
    return videos.filter((v) => (v.title || "").toLowerCase().includes(q));
  }, [videos, search]);

  // modal state
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null); // video object or null
  const [form, setForm] = useState(initialForm(classId));
  const [errors, setErrors] = useState({});

  // upload state
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // local preview (UI only)
  const [thumbPreview, setThumbPreview] = useState("");

  // preview modal
  const [previewThumb, setPreviewThumb] = useState(null);

  // delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/videos/class/${classId}`);
      setVideos(res.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm(classId));
    setVideoFile(null);
    setThumbFile(null);
    setThumbPreview("");
    setErrors({});
    setOpenModal(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({
      class_id: classId,
      title: v.title || "",
      video_url: v.video_url || "",
      duration: v.duration ?? 0,
      thumbnail: v.thumbnail || "",
      description: v.description || "",
      order_no: v.order_no ?? 1,
      is_preview: !!v.is_preview,
      is_published: !!v.is_published,
      is_skippable: !!v.is_skippable,
      min_watch_percent: v.min_watch_percent ?? 80,
    });
    setVideoFile(null);
    setThumbFile(null);
    setThumbPreview(v.thumbnail || "");
    setErrors({});
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setEditing(null);
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    setForm((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const onVideoFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("video/")) {
      toast.error("Please select a valid video file");
      return;
    }

    setVideoFile(f);

    // if uploading file, clear manual url to avoid conflicts
    setForm((p) => ({ ...p, video_url: "" }));

    if (errors.video_url) setErrors((p) => ({ ...p, video_url: undefined }));
  };

  const onThumbFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setThumbFile(f);

    // UI preview immediately
    const local = URL.createObjectURL(f);
    setThumbPreview(local);
  };

  // cleanup local thumb preview blobs
  useEffect(() => {
    return () => {
      if (thumbPreview && typeof thumbPreview === "string" && thumbPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbPreview);
      }
    };
  }, [thumbPreview]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.order_no || Number(form.order_no) < 1) e.order_no = "Order must be 1 or more.";

    // Create / edit: must have either existing url OR new file
    if (!videoFile) {
      const urlVal = (form.video_url || "").trim();
      if (!urlVal) e.video_url = "Video file or URL is required.";
      else if (!isValidUrl(urlVal)) e.video_url = "Please enter a valid http/https URL.";
    }

    const mwp = Number(form.min_watch_percent);
    if (Number.isNaN(mwp) || mwp < 0 || mwp > 100)
      e.min_watch_percent = "Min watch % must be between 0 and 100.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const tId = toast.loading(editing ? "Updating video..." : "Creating video...");
    setUploading(true);

    try {
      let videoUrl = (form.video_url || "").trim();
      let thumbUrl = (form.thumbnail || "").trim();

      // upload video if picked
      if (videoFile) {
        const uploadedVideo = await uploadToBucket(videoFile);
        videoUrl = uploadedVideo;
      }

      // upload thumbnail if picked
      if (thumbFile) {
        const uploadedThumb = await uploadToBucket(thumbFile);
        thumbUrl = uploadedThumb;
      }

      const payload = {
        class_id: classId,
        title: form.title.trim(),
        video_url: videoUrl,
        duration: Number(form.duration || 0),
        thumbnail: thumbUrl || null,
        description: form.description?.trim() || null,
        order_no: Number(form.order_no || 1),
        is_preview: !!form.is_preview,
        is_published: !!form.is_published,
        is_skippable: !!form.is_skippable,
        min_watch_percent: Number(form.min_watch_percent ?? 80),
      };

      if (editing) {
        await api.put(`/videos/${editing.id}`, payload);
      } else {
        await api.post(`/videos`, payload);
      }

      toast.dismiss(tId);
      toast.success(editing ? "Video updated!" : "Video created!");
      closeModal();
      fetchVideos();
    } catch (err) {
      console.error(err);
      toast.dismiss(tId);
      toast.error(err?.response?.data?.message || err?.message || "Failed");
    } finally {
      setUploading(false);
    }
  };

  const askDelete = (v) => {
    setDeleteItem(v);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    const tId = toast.loading("Deleting...");
    try {
      await api.delete(`/videos/${deleteItem.id}`);
      toast.dismiss(tId);
      toast.success("Deleted");
      setDeleteOpen(false);
      setDeleteItem(null);
      fetchVideos();
    } catch (err) {
      toast.dismiss(tId);
      toast.error(err?.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>Videos for this Class</h2>

          <div className={styles.topBarActions}>
            <input
              className={styles.searchInput}
              placeholder="Search video title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className={styles.addBtn} onClick={openAdd}>
              <FaPlus /> Add Video
            </button>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Order</th>
              <th>Status</th>
              <th>Preview</th>
              <th>Skippable</th>
              <th>Min Watch %</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className={styles.loadingCell}>
                  Loading...
                </td>
              </tr>
            ) : filteredVideos.length > 0 ? (
              filteredVideos.map((v) => (
                <tr key={v.id}>
                  <td>
                    {v.thumbnail ? (
                      <img
                        src={v.thumbnail}
                        className={styles.thumb}
                        onClick={() => setPreviewThumb(v.thumbnail)}
                        alt="thumb"
                      />
                    ) : (
                      <div className={styles.noThumb}>No image</div>
                    )}
                  </td>

                  <td>{v.title}</td>
                  <td>{v.order_no ?? "-"}</td>

                  <td>
                    <span
                      className={`${styles.badge} ${
                        v.is_published ? styles.published : styles.unpublished
                      }`}
                    >
                      {v.is_published ? "Published" : "Hidden"}
                    </span>
                  </td>

                  <td>
                    <span className={`${styles.badge} ${styles.preview}`}>
                      {v.is_preview ? "Yes" : "No"}
                    </span>
                  </td>

                  <td>{v.is_skippable ? "Yes" : "No"}</td>
                  <td>{v.min_watch_percent ?? 80}%</td>

                  <td>
                    <div className={styles.actions}>
                      {v.video_url && (
                        <button
                          className={`${styles.actionBtn} ${styles.play}`}
                          title="Play"
                          onClick={() => window.open(v.video_url, "_blank")}
                        >
                          <FaPlay />
                        </button>
                      )}

                      <button
                        className={`${styles.actionBtn} ${styles.edit}`}
                        title="Edit"
                        onClick={() => openEdit(v)}
                      >
                        <FaEdit />
                      </button>

                      <button
                        className={`${styles.actionBtn} ${styles.delete}`}
                        title="Delete"
                        onClick={() => askDelete(v)}
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
                  No videos found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ ADD/EDIT MODAL */}
      {openModal && (
        <div className={modalStyles.overlay}>
          <div className={modalStyles.modal}>
            <button className={modalStyles.closeBtn} onClick={closeModal}>
              <FaTimes />
            </button>

            <h2 className={modalStyles.modalTitle}>
              {editing ? "Edit Video" : "Add New Video"}
            </h2>

            <div className={modalStyles.scrollContent}>
              <form className={modalStyles.form} onSubmit={submit}>
                <label>
                  Title <span style={{ color: "red" }}>*</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    placeholder="e.g. Lesson 1 - Introduction"
                  />
                  {errors.title && <span className={modalStyles.error}>{errors.title}</span>}
                </label>

                <label>
                  Order No <span style={{ color: "red" }}>*</span>
                  <input
                    type="number"
                    name="order_no"
                    min="1"
                    value={form.order_no}
                    onChange={onChange}
                  />
                  {errors.order_no && <span className={modalStyles.error}>{errors.order_no}</span>}
                </label>

                <label>
                  Duration (seconds)
                  <input
                    type="number"
                    name="duration"
                    min="0"
                    value={form.duration}
                    onChange={onChange}
                    placeholder="Optional"
                  />
                </label>

                {/* ✅ VIDEO UPLOAD */}
                <label className={modalStyles.fullWidthLabel}>
                  Video File {editing ? "(optional)" : ""}
                  <input type="file" accept="video/*" onChange={onVideoFile} />
                  <small style={{ color: "#6b7280", display: "block", marginTop: 8 }}>
                    {editing
                      ? "Choose a file only if you want to replace the video."
                      : "Upload a video file or paste a URL below."}
                  </small>
                  {errors.video_url && <span className={modalStyles.error}>{errors.video_url}</span>}
                </label>

                {/* ✅ manual URL */}
                <label className={modalStyles.fullWidthLabel}>
                  Or Video URL (optional)
                  <input
                    name="video_url"
                    value={form.video_url}
                    onChange={onChange}
                    placeholder="https://...."
                  />
                </label>

                {/* ✅ THUMBNAIL */}
                <label className={modalStyles.fullWidthLabel}>
                  Thumbnail (optional)
                  <input type="file" accept="image/*" onChange={onThumbFile} />
                  {(thumbPreview || form.thumbnail) && (
                    <div className={modalStyles.imagePreviewGrid}>
                      <img
                        src={thumbPreview || form.thumbnail}
                        alt="thumb"
                        className={modalStyles.thumbnailPreview}
                      />
                    </div>
                  )}
                </label>

                <label className={modalStyles.fullWidthLabel}>
                  Description
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={onChange}
                    placeholder="Optional description..."
                  />
                </label>

                {/* ✅ FLAGS */}
                <label className={modalStyles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={form.is_published}
                    onChange={onChange}
                  />
                  Published (Visible)
                </label>

                <label className={modalStyles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="is_preview"
                    checked={form.is_preview}
                    onChange={onChange}
                  />
                  Preview video (Free)
                </label>

                <label className={modalStyles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="is_skippable"
                    checked={form.is_skippable}
                    onChange={onChange}
                  />
                  Skippable
                </label>

                <label>
                  Min Watch %
                  <input
                    type="number"
                    name="min_watch_percent"
                    min="0"
                    max="100"
                    value={form.min_watch_percent}
                    onChange={onChange}
                  />
                  {errors.min_watch_percent && (
                    <span className={modalStyles.error}>{errors.min_watch_percent}</span>
                  )}
                </label>

                <div className={modalStyles.actions}>
                  <button type="button" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={modalStyles.primaryBtn}
                    disabled={uploading}
                  >
                    {uploading ? "Saving..." : editing ? "Save Changes" : "Create Video"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Thumbnail Preview */}
      {previewThumb && (
        <div className={modalStyles.overlay} onClick={() => setPreviewThumb(null)}>
          <div
            className={modalStyles.modal}
            style={{ maxWidth: 900 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={modalStyles.closeBtn} onClick={() => setPreviewThumb(null)}>
              <FaTimes />
            </button>
            <h2 className={modalStyles.modalTitle}>Thumbnail Preview</h2>
            <div className={modalStyles.scrollContent}>
              <img
                src={previewThumb}
                alt="preview"
                style={{ width: "100%", borderRadius: 12 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirm */}
      {deleteOpen && (
        <div className={modalStyles.overlay}>
          <div className={modalStyles.modal} style={{ maxWidth: 520 }}>
            <button className={modalStyles.closeBtn} onClick={() => setDeleteOpen(false)}>
              <FaTimes />
            </button>
            <h2 className={modalStyles.modalTitle}>Delete Video</h2>
            <div className={modalStyles.scrollContent}>
              <p style={{ color: "#374151" }}>
                Are you sure you want to delete <b>{deleteItem?.title}</b>?
              </p>

              <div className={modalStyles.actions}>
                <button type="button" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={modalStyles.primaryBtn}
                  style={{ background: "#DC2626" }}
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
