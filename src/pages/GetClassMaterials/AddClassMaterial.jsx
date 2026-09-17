// src/pages/class-materials/classmaterials/AddClassMaterial.jsx
import modalStyles from "./Modal.module.css";
import { FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import api from "@/Utils/api";

export default function AddClassMaterial({ class_id, onClose, onSuccess }) {
  const [form, setForm] = useState({
    class_id: class_id || "",
    material_type: "VIDEO",
    title: "",
    url: "",
  });

  useEffect(() => {
    if (class_id) setForm((prev) => ({ ...prev, class_id }));
  }, [class_id]);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const extractUploadedUrl = (data) => {
    if (!data) return null;

    // A) { files: [{ url }] }
    if (Array.isArray(data?.files) && data.files[0]?.url) return data.files[0].url;

    // B) { file: { url } }
    if (data?.file?.url) return data.file.url;

    // C) { url: "..." }
    if (typeof data?.url === "string") return data.url;

    // D) [{ url: "..." }]
    if (Array.isArray(data) && data[0]?.url) return data[0].url;

    return null;
  };

  const isValidUrl = (value) => {
    if (!value) return true; // optional
    try {
      // allow http/https only
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));

    // if user is typing url, they likely aren't uploading a file
    if (name === "url" && value?.trim()) {
      if (file) setFile(null);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // if user uploads a file, clear url to avoid conflicts
    setForm((prev) => ({ ...prev, url: "" }));

    if (errors.file) setErrors((prev) => ({ ...prev, file: undefined }));
    if (errors.url) setErrors((prev) => ({ ...prev, url: undefined }));
  };

  const uploadFile = async () => {
    if (!file) return null;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "https://bucket.cyberawareness.ngo/bucket/upload/cybercrime",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const url = extractUploadedUrl(res?.data);

      if (!url) {
        console.log("Upload response (material):", res?.data);
        throw new Error("No URL returned from upload");
      }

      return url;
    } catch (err) {
      console.error("File upload failed:", err);
      toast.error(err?.response?.data?.error || err?.message || "File upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const errs = {};

    if (!form.class_id) errs.class_id = "Required";
    if (!form.title.trim()) errs.title = "Required";

    // require either url or file
    const urlVal = (form.url || "").trim();
    if (!urlVal && !file) errs.file = "Either upload a file or provide a URL";

    if (urlVal && !isValidUrl(urlVal)) errs.url = "Please enter a valid http/https URL";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const tId = toast.loading("Adding material...");

    try {
      let finalUrl = (form.url || "").trim();

      if (file) {
        const uploadedUrl = await uploadFile();
        if (!uploadedUrl) throw new Error("Upload failed");
        finalUrl = uploadedUrl;
      }

      const payload = {
        class_id: form.class_id,
        material_type: form.material_type,
        title: form.title.trim(),
        url: finalUrl,
      };

      await api.post("/materials", payload);

      toast.dismiss(tId);
      toast.success("Material added successfully!");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.dismiss(tId);
      toast.error(err?.response?.data?.message || err?.message || "Failed to add material");
    }
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal}>
        <button className={modalStyles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className={modalStyles.modalTitle}>Add Class Material</h2>

        <div className={modalStyles.scrollContent}>
          <form className={modalStyles.form} onSubmit={handleSubmit}>
            {/* Material Type */}
            <label>
              Material Type <span style={{ color: "red" }}>*</span>
              <select
                name="material_type"
                value={form.material_type}
                onChange={handleChange}
              >
                <option value="VIDEO">Video</option>
                <option value="PDF">PDF</option>
                <option value="IMAGE">Image</option>
                <option value="AUDIO">Audio</option>
                <option value="OTHER">Other</option>
              </select>
            </label>

            {/* Title */}
            <label>
              Title <span style={{ color: "red" }}>*</span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Lecture Notes Week 1"
                required
              />
              {errors.title && (
                <span className={modalStyles.error}>{errors.title}</span>
              )}
            </label>

            {/* Upload */}
            <label className={modalStyles.fullWidthLabel}>
              Upload File (or provide URL below)
              <input type="file" onChange={handleFileChange} />
              {file && <small>File selected: {file.name}</small>}
              {uploading && <small>Uploading...</small>}
            </label>

            {/* URL */}
            <label className={modalStyles.fullWidthLabel}>
              OR Enter External URL
              <input
                name="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://example.com/file.pdf"
              />
              <small style={{ color: "#6b7280" }}>
                Use if hosting externally (YouTube, Google Drive, etc.)
              </small>
              {errors.url && (
                <span className={modalStyles.error}>{errors.url}</span>
              )}
            </label>

            {/* Either-or error */}
            {errors.file && (
              <span className={modalStyles.error} style={{ gridColumn: "1 / -1" }}>
                {errors.file}
              </span>
            )}

            <div className={modalStyles.actions}>
              <button type="button" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className={modalStyles.primaryBtn}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Add Material"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
