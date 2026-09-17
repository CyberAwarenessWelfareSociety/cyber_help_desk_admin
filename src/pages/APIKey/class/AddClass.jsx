// src/pages/classes/classes/AddClass.jsx
import modalStyles from "../Modal.module.css";
import { FaTimes } from "react-icons/fa";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import api from "@/Utils/api";

export default function AddClass({
  courseId,
  onClose,
  onSuccess,
  courses = [],
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    course_id: courseId || "",
    class_type: "NORMAL",
    class_duration: "",
    class_start_time: "",
    class_end_time: "",
    passing_percentage: 70,
    order_no: 1,

    // ✅ backend fields
    retry_enabled: false,
    max_attempts: 1,
    retry_deadline: "",
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, course_id: courseId || prev.course_id }));
  }, [courseId]);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const selectedCourse = useMemo(() => {
    return courses?.find((c) => c?.id === form.course_id) || null;
  }, [courses, form.course_id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const nextValue =
      type === "checkbox"
        ? checked
        : name === "passing_percentage"
          ? value
          : name === "class_duration" ||
              name === "order_no" ||
              name === "max_attempts"
            ? value
            : value;

    setForm((prev) => {
      const updated = { ...prev, [name]: nextValue };

      // ✅ keep retry fields consistent
      if (name === "retry_enabled" && !checked) {
        updated.max_attempts = 1;
        updated.retry_deadline = "";
      }

      // ✅ Live class: if switched to NORMAL, clear time fields
      if (name === "class_type" && value === "NORMAL") {
        updated.class_start_time = "";
        updated.class_end_time = "";
      }

      return updated;
    });

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setThumbnailFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    if (errors.thumbnail)
      setErrors((prev) => ({ ...prev, thumbnail: undefined }));
  };

// ✅ normalize upload response to a single url
const extractUploadedUrl = (data) => {
  if (!data) return null;

  // A) { files: [{ url }] }
  if (Array.isArray(data?.files) && data.files[0]?.url) return data.files[0].url;

  // B) { file: { url } }   <-- YOUR CASE (based on your earlier response)
  if (data?.file?.url) return data.file.url;

  // C) { url: "..." }
  if (typeof data?.url === "string") return data.url;

  // D) [{ url: "..." }]
  if (Array.isArray(data) && data[0]?.url) return data[0].url;

  return null;
};

const uploadThumbnail = async () => {
  if (!thumbnailFile) return null;

  setUploading(true);
  const formData = new FormData();
  formData.append("file", thumbnailFile);

  try {
    const res = await axios.post(
      "https://bucket.cyberawareness.ngo/bucket/upload/cybercrime",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const url = extractUploadedUrl(res?.data);

    if (!url) {
      console.log("Thumbnail upload response:", res?.data);
      throw new Error("Failed to get thumbnail URL from upload response");
    }

    return url;
  } catch (err) {
    console.error("Upload failed:", err);
    toast.error("Failed to upload thumbnail");
    return null;
  } finally {
    setUploading(false);
  }
};


  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required.";

    if (!form.course_id) newErrors.course_id = "Please select a course.";

    if (!thumbnailFile && !previewUrl)
      newErrors.thumbnail = "Thumbnail image is required.";

    const duration = Number(form.class_duration);
    if (!duration || duration < 1)
      newErrors.class_duration = "Duration must be at least 1 minute.";

    const orderNo = Number(form.order_no);
    if (!orderNo || orderNo < 1)
      newErrors.order_no = "Order number must be 1 or higher.";

    const passing = Number(form.passing_percentage);
    if (Number.isNaN(passing) || passing < 0 || passing > 100) {
      newErrors.passing_percentage =
        "Passing percentage must be between 0 and 100.";
    }

    // ✅ LIVE: require start/end, and end > start
    if (form.class_type === "LIVE") {
      if (!form.class_start_time)
        newErrors.class_start_time = "Start time is required for Live classes.";
      if (!form.class_end_time)
        newErrors.class_end_time = "End time is required for Live classes.";

      if (form.class_start_time && form.class_end_time) {
        const start = new Date(form.class_start_time).getTime();
        const end = new Date(form.class_end_time).getTime();
        if (Number.isFinite(start) && Number.isFinite(end) && end <= start) {
          newErrors.class_end_time = "End time must be after start time.";
        }
      }
    }

    // ✅ Retry validation (backend: min 1 always)
    if (form.retry_enabled) {
      const attempts = Number(form.max_attempts);
      if (!attempts || attempts < 1)
        newErrors.max_attempts = "Max attempts must be at least 1.";

      // Optional: if user sets a deadline, make sure it parses
      if (form.retry_deadline) {
        const d = new Date(form.retry_deadline).getTime();
        if (!Number.isFinite(d))
          newErrors.retry_deadline = "Retry deadline is not a valid date/time.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    toast.loading("Creating class...");

    try {
      const thumbnailUrl = await uploadThumbnail();
      if (thumbnailFile && !thumbnailUrl)
        throw new Error("Thumbnail upload failed");

      const payload = {
        course_id: form.course_id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        class_type: form.class_type,

        class_duration: parseInt(form.class_duration, 10),
        class_start_time:
          form.class_type === "LIVE" ? form.class_start_time : null,
        class_end_time: form.class_type === "LIVE" ? form.class_end_time : null,

        passing_percentage: parseFloat(form.passing_percentage),
        order_no: parseInt(form.order_no, 10),

        thumbnail: thumbnailUrl || previewUrl,

        // ✅ backend retry fields
        retry_enabled: Boolean(form.retry_enabled),
        max_attempts: parseInt(form.max_attempts, 10),
        retry_deadline: form.retry_enabled
          ? form.retry_deadline
            ? form.retry_deadline
            : null
          : null,
      };

      await api.post("/classes", payload);

      toast.dismiss();
      toast.success("Class created successfully!");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast.dismiss();
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Failed to create class";
      toast.error(msg);
      console.error("Create class error:", error);
    }
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={`${modalStyles.modal} ${modalStyles.wideModal || ""}`}>
        <button className={modalStyles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className={modalStyles.modalTitle}>Add New Class</h2>

        <div className={modalStyles.scrollContent}>
          <form className={modalStyles.form} onSubmit={handleSubmit}>
            {/* ✅ Course */}
            <label>
              <span style={{display:"flex",flexDirection:"row"}}>

              Course <span style={{ color: "red" }}>*</span>
              </span>
              <select
                name="course_id"
                value={form.course_id}
                onChange={handleChange}
                required
              >
                <option value="">Select course</option>
                {courses?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title || c.name || c.id}
                  </option>
                ))}
              </select>
              {errors.course_id && (
                <span className={modalStyles.error}>{errors.course_id}</span>
              )}
              {selectedCourse?.title && (
                <small className={modalStyles.helperText}>
                  Selected: {selectedCourse.title}
                </small>
              )}
            </label>

            {/* Title */}
            <label>
                            <span style={{display:"flex",flexDirection:"row"}}>

              Title <span style={{ color: "red" }}>*</span>
                            </span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Introduction to Node.js"
                required
              />
              {errors.title && (
                <span className={modalStyles.error}>{errors.title}</span>
              )}
            </label>

            {/* Class Type */}
            <label>
                            <span style={{display:"flex",flexDirection:"row"}}>

              Class Type <span style={{ color: "red" }}>*</span>
                            </span>
              <select
                name="class_type"
                value={form.class_type}
                onChange={handleChange}
              >
                <option value="NORMAL">Normal (Recorded)</option>
                <option value="LIVE">Live</option>
              </select>
            </label>

            {/* Duration */}
            <label>
                            <span style={{display:"flex",flexDirection:"row"}}>

              Duration (minutes) <span style={{ color: "red" }}>*</span>
                            </span>
              <input
                type="number"
                name="class_duration"
                value={form.class_duration}
                onChange={handleChange}
                min="1"
                placeholder="e.g. 45"
                required
              />
              {errors.class_duration && (
                <span className={modalStyles.error}>
                  {errors.class_duration}
                </span>
              )}
            </label>

            {/* Start Time - Conditional */}
            {form.class_type === "LIVE" && (
              <label>
                Start Time <span style={{ color: "red" }}>*</span>
                <input
                  type="datetime-local"
                  name="class_start_time"
                  value={form.class_start_time}
                  onChange={handleChange}
                  required
                />
                {errors.class_start_time && (
                  <span className={modalStyles.error}>
                    {errors.class_start_time}
                  </span>
                )}
              </label>
            )}

            {/* End Time - Conditional */}
            {form.class_type === "LIVE" && (
              <label>
                End Time <span style={{ color: "red" }}>*</span>
                <input
                  type="datetime-local"
                  name="class_end_time"
                  value={form.class_end_time}
                  onChange={handleChange}
                  required
                />
                {errors.class_end_time && (
                  <span className={modalStyles.error}>
                    {errors.class_end_time}
                  </span>
                )}
              </label>
            )}

            {/* Order No */}
            <label>
                            <span style={{display:"flex",flexDirection:"row"}}>

              Order Number <span style={{ color: "red" }}>*</span>
                            </span>
              <input
                type="number"
                name="order_no"
                value={form.order_no}
                onChange={handleChange}
                min="1"
                required
              />
              {errors.order_no && (
                <span className={modalStyles.error}>{errors.order_no}</span>
              )}
            </label>

            {/* Passing Percentage */}
            <label>
                            <span style={{display:"flex",flexDirection:"row"}}>

              Passing Percentage (%) <span style={{ color: "red" }}>*</span>
                            </span>
              <input
                type="number"
                name="passing_percentage"
                value={form.passing_percentage}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                required
              />
              {errors.passing_percentage && (
                <span className={modalStyles.error}>
                  {errors.passing_percentage}
                </span>
              )}
            </label>

            {/* ✅ Retry Controls (Backend fields) */}
            <div className={modalStyles.fullWidthLabel}>
              <div className={modalStyles.retryBox || ""}>
                <div className={modalStyles.retryHeader || ""}>
                  <label
                    className={modalStyles.inlineLabel || ""}
                    style={{ display: "flex", flexDirection: "row" }}
                  >
                    <span style={{ marginLeft: 8 }}>
                      Enable Retry / Reattempt
                    </span>
                    <input
                      type="checkbox"
                      name="retry_enabled"
                      checked={!!form.retry_enabled}
                      onChange={handleChange}
                    />
                  </label>
                </div>

                {form.retry_enabled && (
                  <div className={modalStyles.retryGrid || ""}>
                    <label>
                                    <span style={{display:"flex",flexDirection:"row"}}>

                      Max Attempts <span style={{ color: "red" }}>*</span>
                                    </span>
                      <input
                        type="number"
                        name="max_attempts"
                        value={form.max_attempts}
                        onChange={handleChange}
                        min="1"
                        placeholder="e.g. 2"
                        required
                      />
                      {errors.max_attempts && (
                        <span className={modalStyles.error}>
                          {errors.max_attempts}
                        </span>
                      )}
                      <small className={modalStyles.helperText}>
                        Example: 1 = only first attempt, 2 = one retry, 3 = two
                        retries...
                      </small>
                    </label>

                    <label>
                      Retry Deadline (Optional)
                      <input
                        type="datetime-local"
                        name="retry_deadline"
                        value={form.retry_deadline}
                        onChange={handleChange}
                      />
                      {errors.retry_deadline && (
                        <span className={modalStyles.error}>
                          {errors.retry_deadline}
                        </span>
                      )}
                      <small className={modalStyles.helperText}>
                        If set, students can retry only before this time.
                      </small>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Description - Full Width */}
            <label className={modalStyles.fullWidthLabel}>
              Description (Optional)
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Brief overview of this class..."
              />
            </label>

            {/* Thumbnail - Full Width */}
            <label className={modalStyles.fullWidthLabel}>
                            <span style={{display:"flex",flexDirection:"row"}}>

              Thumbnail Image <span style={{ color: "red" }}>*</span>
                            </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required={!previewUrl}
              />
              {previewUrl && (
                <div className={modalStyles.imagePreviewGrid}>
                  <img
                    src={previewUrl}
                    alt="Thumbnail preview"
                    className={modalStyles.thumbnailPreview}
                  />
                </div>
              )}
              {errors.thumbnail && (
                <span className={modalStyles.error}>{errors.thumbnail}</span>
              )}
              {uploading && <p>Uploading thumbnail...</p>}
            </label>

            {/* Actions */}
            <div className={modalStyles.actions}>
              <button type="button" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className={modalStyles.primaryBtn}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Create Class"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
