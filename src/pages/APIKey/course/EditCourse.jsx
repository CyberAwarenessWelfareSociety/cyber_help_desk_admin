// src/pages/courses/EditCourse.jsx
import modalStyles from "./Modal.module.css";
import { FaTimes } from "react-icons/fa";
import { useState, useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import api from "@/Utils/api";

export default function EditCourse({ course, onClose, onSuccess }) {
  // ✅ keep original URLs safe (never replace these with blob previews)
  const originalImagesRef = useRef(
    Array.isArray(course?.images) ? course.images : []
  );

  const [form, setForm] = useState({
    title: course?.title || "",
    description: course?.description || "",
    course_duration: course?.course_duration || "",
    course_type: course?.course_type || "NORMAL",
    actual_price: course?.actual_price || "",
    discount_price: course?.discount_price || "",
    images: Array.isArray(course?.images) ? course.images : [], // ✅ REAL URLs only
    is_published: !!course?.is_published,
    instructor_id: course?.instructor_id || "",
  });

  const [previewImages, setPreviewImages] = useState(
    Array.isArray(course?.images) ? course.images : []
  );

  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);

  // ✅ Autocomplete state
  const [searchInstructor, setSearchInstructor] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const suggestionRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch instructors (clients)
  useEffect(() => {
    const fetchInstructors = async () => {
      setLoadingInstructors(true);
      try {
        const res = await api.get("/get-client?limit=all");
        const list = res.data?.data || res.data || [];
        setInstructors(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load instructors");
        setInstructors([]);
      } finally {
        setLoadingInstructors(false);
      }
    };
    fetchInstructors();
  }, []);

  // ✅ when course/instructors load, show selected instructor label in input
  useEffect(() => {
    if (!form.instructor_id) return;
    if (!Array.isArray(instructors) || instructors.length === 0) return;

    const selected = instructors.find((x) => x.id === form.instructor_id);
    if (!selected) return;

    setSearchInstructor(
      `${selected.name || "Unknown"}${selected.phone ? ` (${selected.phone})` : ""}${
        selected.email ? ` - ${selected.email}` : ""
      }`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructors, form.instructor_id]);

  // ✅ close suggestions when click outside
  useEffect(() => {
    const onDocClick = (e) => {
      const inDropdown = suggestionRef.current?.contains(e.target);
      const inInput = inputRef.current?.contains(e.target);
      if (!inDropdown && !inInput) setShowSuggestions(false);
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // ✅ Filter suggestions
  const filteredInstructors = useMemo(() => {
    const s = (searchInstructor || "").trim().toLowerCase();
    if (!s) return instructors;

    return instructors.filter((inst) => {
      const name = (inst?.name || "").toLowerCase();
      const email = (inst?.email || "").toLowerCase();
      const phone = String(inst?.phone || "").toLowerCase();
      return name.includes(s) || email.includes(s) || phone.includes(s);
    });
  }, [searchInstructor, instructors]);

  // ✅ Select instructor
  const handleSelectInstructor = (inst) => {
    setForm((prev) => ({ ...prev, instructor_id: inst.id }));

    setSearchInstructor(
      `${inst.name || "Unknown"}${inst.phone ? ` (${inst.phone})` : ""}${
        inst.email ? ` - ${inst.email}` : ""
      }`
    );

    setShowSuggestions(false);

    if (errors.instructor_id) {
      setErrors((prev) => ({ ...prev, instructor_id: undefined }));
    }
  };

  const clearInstructor = () => {
    setForm((prev) => ({ ...prev, instructor_id: "" }));
    setSearchInstructor("");
    setShowSuggestions(false);
    inputRef.current?.focus?.();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);

    // ✅ previews ONLY (UI)
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  // ✅ cleanup previews safely (revoke previous blob urls only)
  const prevPreviewRef = useRef([]);
  useEffect(() => {
    const prev = prevPreviewRef.current || [];
    prev.forEach((url) => {
      if (typeof url === "string" && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    prevPreviewRef.current = previewImages || [];

    return () => {
      // on unmount
      (prevPreviewRef.current || []).forEach((url) => {
        if (typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewImages]);

  // ✅ normalize upload response to array of urls
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

  const uploadImages = async () => {
    // no new files -> keep existing saved URLs
    if (imageFiles.length === 0) return form.images;

    setUploading(true);
    const fd = new FormData();
    imageFiles.forEach((file) => fd.append("file", file));

    try {
      const res = await axios.post(
        "https://bucket.cyberawareness.ngo/bucket/upload/cybercrime",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const urls = extractUploadedUrls(res?.data);

      if (urls.length > 0) return urls;

      console.log("Upload response:", res?.data);
      // fallback to original backend urls (NOT blob previews)
      return originalImagesRef.current || [];
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Image upload failed");
      // fallback to original backend urls (NOT blob previews)
      return originalImagesRef.current || [];
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required.";
    if (!form.instructor_id) newErrors.instructor_id = "Instructor is required.";

    const durationNum = Number(form.course_duration);
    if (!durationNum || durationNum < 1) {
      newErrors.course_duration = "Duration must be at least 1 week.";
    }

    const actual = Number(form.actual_price);
    if (Number.isNaN(actual) || actual < 0) {
      newErrors.actual_price = "Actual price is required.";
    }

    const discount = form.discount_price === "" ? 0 : Number(form.discount_price);
    if (!Number.isNaN(discount) && discount > actual) {
      newErrors.discount_price = "Discount cannot exceed actual price.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const tId = toast.loading("Updating course...");

    try {
      const uploadedUrls = await uploadImages();

      const payload = {
        instructor_id: form.instructor_id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        course_duration: parseInt(form.course_duration, 10),
        course_type: form.course_type,
        actual_price: parseFloat(form.actual_price),
        discount_price: form.discount_price ? parseFloat(form.discount_price) : 0,
        images: uploadedUrls && uploadedUrls.length > 0 ? uploadedUrls : null,
        is_published: form.is_published,
      };

      await api.put(`/courses/${course.id}`, payload);

      // ✅ update local state + original ref after success
      originalImagesRef.current = uploadedUrls || [];
      setForm((prev) => ({ ...prev, images: uploadedUrls || [] }));
      setPreviewImages(uploadedUrls || []);
      setImageFiles([]);

      toast.dismiss(tId);
      toast.success("Course updated successfully!");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast.dismiss(tId);
      const msg = error?.response?.data?.message || error.message || "Failed to update course";
      toast.error(msg);
      console.error("Update error:", error);
    }
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal}>
        <button className={modalStyles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className={modalStyles.modalTitle}>Edit Course</h2>

        <div className={modalStyles.scrollContent}>
          <form className={modalStyles.form} onSubmit={handleSubmit}>
            {/* ✅ Instructor Autocomplete */}
            <label style={{ position: "relative" }}>
              Instructor <span style={{ color: "red" }}>*</span>

              {loadingInstructors ? (
                <p>Loading...</p>
              ) : (
                <>
                  <div style={{ position: "relative" }}>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Type to search instructor (name / email / phone)"
                      value={searchInstructor}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSearchInstructor(val);
                        setShowSuggestions(true);

                        if (!val.trim()) {
                          setForm((prev) => ({ ...prev, instructor_id: "" }));
                        }
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      autoComplete="off"
                    />

                    {form.instructor_id && (
                      <button
                        type="button"
                        onClick={clearInstructor}
                        style={{
                          position: "absolute",
                          right: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: 16,
                          lineHeight: 1,
                          opacity: 0.7,
                        }}
                        aria-label="Clear instructor"
                        title="Clear instructor"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {showSuggestions && (
                    <div
                      ref={suggestionRef}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: "100%",
                        marginTop: 6,
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        maxHeight: 220,
                        overflowY: "auto",
                        zIndex: 50,
                        boxShadow:
                          "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
                      }}
                    >
                      {filteredInstructors.length === 0 ? (
                        <div style={{ padding: 12, color: "#6b7280" }}>
                          No instructors found
                        </div>
                      ) : (
                        filteredInstructors.slice(0, 12).map((inst) => {
                          const active = form.instructor_id === inst.id;
                          return (
                            <button
                              key={inst.id}
                              type="button"
                              onClick={() => handleSelectInstructor(inst)}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: 12,
                                border: "none",
                                background: active ? "#f3f4f6" : "#fff",
                                cursor: "pointer",
                                borderBottom: "1px solid #f1f5f9",
                              }}
                            >
                              <div style={{ fontWeight: 600 }}>
                                {inst.name || "Unknown"}
                              </div>
                              <div style={{ fontSize: 12, color: "#6b7280" }}>
                                {inst.phone ? inst.phone : ""}
                                {inst.phone && inst.email ? " • " : ""}
                                {inst.email ? inst.email : ""}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </>
              )}

              {errors.instructor_id && (
                <span className={modalStyles.error}>{errors.instructor_id}</span>
              )}
            </label>

            {/* Title */}
            <label>
              Title <span style={{ color: "red" }}>*</span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Backend Mastery"
              />
              {errors.title && (
                <span className={modalStyles.error}>{errors.title}</span>
              )}
            </label>

            {/* Course Type */}
            <label>
              Course Type <span style={{ color: "red" }}>*</span>
              <select
                name="course_type"
                value={form.course_type}
                onChange={handleChange}
              >
                <option value="NORMAL">Normal (Recorded)</option>
                <option value="LIVE">Live</option>
              </select>
            </label>

            {/* Duration */}
            <label>
              Duration (weeks) <span style={{ color: "red" }}>*</span>
              <input
                type="number"
                name="course_duration"
                value={form.course_duration}
                onChange={handleChange}
                min="1"
                required
              />
              {errors.course_duration && (
                <span className={modalStyles.error}>{errors.course_duration}</span>
              )}
            </label>

            {/* Actual Price */}
            <label>
              Actual Price (₹) <span style={{ color: "red" }}>*</span>
              <input
                type="number"
                step="0.01"
                name="actual_price"
                value={form.actual_price}
                onChange={handleChange}
                min="0"
                required
              />
              {errors.actual_price && (
                <span className={modalStyles.error}>{errors.actual_price}</span>
              )}
            </label>

            {/* Discount Price */}
            <label>
              Discount Price (₹)
              <input
                type="number"
                step="0.01"
                name="discount_price"
                value={form.discount_price}
                onChange={handleChange}
                min="0"
                placeholder="Optional"
              />
              {errors.discount_price && (
                <span className={modalStyles.error}>{errors.discount_price}</span>
              )}
            </label>

            {/* Description - Full Width */}
            <label className={modalStyles.fullWidthLabel}>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Detailed course overview..."
              />
            </label>

            {/* Images - Full Width */}
            <label className={modalStyles.fullWidthLabel}>
              Course Images (replace all)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
              {previewImages.length > 0 && (
                <div className={modalStyles.imagePreviewGrid}>
                  {previewImages.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Image ${i + 1}`}
                      className={modalStyles.thumbnailPreview}
                    />
                  ))}
                </div>
              )}
              {uploading && <p>Uploading images...</p>}
            </label>

            {/* Publish Toggle */}
            <label className={modalStyles.checkboxLabel}>
              <input
                type="checkbox"
                name="is_published"
                checked={form.is_published}
                onChange={handleChange}
              />
              Published (visible to students)
            </label>

            {/* Actions */}
            <div className={modalStyles.actions}>
              <button type="button" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className={modalStyles.primaryBtn}
                disabled={uploading || loadingInstructors}
              >
                {uploading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
