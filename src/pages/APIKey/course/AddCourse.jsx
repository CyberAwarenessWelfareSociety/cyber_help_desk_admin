// src/pages/courses/AddCourse.jsx
import modalStyles from "./Modal.module.css";
import { FaTimes } from "react-icons/fa";
import { useState, useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import api from "@/Utils/api";

export default function AddCourse({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    course_duration: "",
    course_type: "NORMAL",
    actual_price: "",
    discount_price: "",
    images: [], // preview URLs (blob)
    is_published: false,
    instructor_id: "",
  });

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

  // Fetch instructors
  useEffect(() => {
    const fetchInstructors = async () => {
      setLoadingInstructors(true);
      try {
        const res = await api.get("/get-client?limit=all");
        const instructorList = res.data?.data || res.data || [];
        setInstructors(Array.isArray(instructorList) ? instructorList : []);
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

  // Close dropdown when clicking outside
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
  };

  // ✅ filtered suggestions (memoized)
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

  // ✅ select instructor from suggestions
  const handleSelectInstructor = (inst) => {
    setForm((prev) => ({ ...prev, instructor_id: inst.id }));
    setSearchInstructor(
      `${inst.name || "Unknown"}${inst.phone ? ` (${inst.phone})` : ""}${
        inst.email ? ` - ${inst.email}` : ""
      }`
    );
    setShowSuggestions(false);

    setErrors((prev) => {
      const next = { ...prev };
      delete next.instructor_id;
      return next;
    });
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

    // Generate previews (blob)
    const previews = files.map((file) => URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, images: previews }));
  };

  // ✅ Cleanup preview URLs (ONLY blob)
  useEffect(() => {
    return () => {
      (form.images || []).forEach((url) => {
        if (typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (imageFiles.length === 0) return [];

    setUploading(true);
    const formData = new FormData();
    imageFiles.forEach((file) => formData.append("file", file));

    try {
      const res = await axios.post(
        "https://bucket.cyberawareness.ngo/bucket/upload/cybercrime",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const urls = extractUploadedUrls(res?.data);

      if (urls.length === 0) {
        console.log("Upload response:", res?.data);
        throw new Error("Failed to get uploaded image URLs");
      }

      return urls;
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Image upload failed");
      return [];
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required.";
    if (!form.instructor_id) newErrors.instructor_id = "Instructor is required.";

    const durationNum = Number(form.course_duration);
    if (!durationNum || durationNum < 1)
      newErrors.course_duration = "Duration must be at least 1 week.";

    const actual = Number(form.actual_price);
    if (Number.isNaN(actual) || actual < 0)
      newErrors.actual_price = "Actual price is required.";

    if (!form.course_type) newErrors.course_type = "Course type is required.";

    const discount = form.discount_price === "" ? 0 : Number(form.discount_price);
    if (!Number.isNaN(discount) && discount > actual) {
      newErrors.discount_price = "Discount price cannot exceed actual price.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const tId = toast.loading("Creating course...");

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
        images: uploadedUrls.length > 0 ? uploadedUrls : null,
        is_published: form.is_published,
      };

      await api.post("/courses", payload);

      toast.dismiss(tId);
      toast.success("Course created successfully!");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast.dismiss(tId);
      const msg = error?.response?.data?.message || error.message || "Failed to create course";
      toast.error(msg);
      console.error("Create course error:", error);
    }
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal}>
        <button className={modalStyles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className={modalStyles.modalTitle}>Add New Course</h2>

        <div className={modalStyles.scrollContent}>
          <form className={modalStyles.form} onSubmit={handleSubmit}>
            {/* ✅ Instructor Autocomplete */}
            <label style={{ position: "relative" }}>
              Instructor <span style={{ color: "red" }}>*</span>

              {loadingInstructors ? (
                <p>Loading instructors...</p>
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

                        // if user clears, remove selection
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
                placeholder="e.g. Backend Mastery with Node.js"
              />
              {errors.title && (
                <span className={modalStyles.error}>{errors.title}</span>
              )}
            </label>

            {/* Description */}
            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Brief overview of the course..."
              />
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
              {errors.course_type && (
                <span className={modalStyles.error}>{errors.course_type}</span>
              )}
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

            {/* Prices */}
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

            {/* Images */}
            <label className={modalStyles.fullWidthLabel}>
              Course Images (multiple allowed)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
              {form.images.length > 0 && (
                <div className={modalStyles.imagePreviewGrid}>
                  {form.images.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Preview ${i + 1}`}
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
              Publish immediately
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
                {uploading ? "Uploading Images..." : "Create Course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
