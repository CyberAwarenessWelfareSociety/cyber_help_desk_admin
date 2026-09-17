// src/pages/class-materials/classmaterials/EditClassMaterial.jsx
import modalStyles from "./Modal.module.css";
import { FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import api from "@/Utils/api";

export default function EditClassMaterial({
  class_id,
  material,
  onClose,
  onSuccess,
  classes = [],
}) {
  const [form, setForm] = useState({
    class_id: class_id || "",
    material_type: material?.material_type || "VIDEO",
    title: material?.title || "",
    url: material?.url || "",
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  // keep class_id in sync
  useEffect(() => {
    if (class_id) setForm((prev) => ({ ...prev, class_id }));
  }, [class_id]);

  // when material changes (edit another row)
  useEffect(() => {
    if (!material) return;
    setFile(null);
    setErrors({});
    setForm({
      class_id: material.class_id || class_id || "",
      material_type: material.material_type || "VIDEO",
      title: material.title || "",
      url: material.url || "",
    });
  }, [material, class_id]);

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
    if (!value) return false;
    try {
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
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // if user chooses file, url will be replaced after upload
    if (errors.file) setErrors((prev) => ({ ...prev, file: undefined }));
  };

  const uploadFile = async () => {
    // no new file => keep existing url
    if (!file) return (form.url || "").trim();

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "https://bucket.cyberawareness.ngo/bucket/upload/cybercrime",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const uploadedUrl = extractUploadedUrl(res?.data);

      if (!uploadedUrl) {
        console.log("Upload response (edit material):", res?.data);
        throw new Error("No URL returned from upload");
      }

      return uploadedUrl;
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(err?.response?.data?.error || err?.message || "Upload failed");
      return (form.url || "").trim(); // fallback
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const errs = {};

    if (!form.class_id) errs.class_id = "Required";
    if (!form.title.trim()) errs.title = "Required";

    // Require either existing url or new file
    const urlVal = (form.url || "").trim();
    if (!file && !urlVal) errs.file = "Upload a file or provide a URL";

    // If url exists (and no file), validate it
    if (!file && urlVal && !isValidUrl(urlVal)) errs.url = "Invalid URL";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const tId = toast.loading("Updating material...");

    try {
      const finalUrl = await uploadFile();

      const payload = {
        class_id: form.class_id,
        material_type: form.material_type,
        title: form.title.trim(),
        url: finalUrl,
      };

      await api.put(`/materials/${material.id}`, payload);

      toast.dismiss(tId);
      toast.success("Material updated!");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.dismiss(tId);
      toast.error(err?.response?.data?.message || "Failed to update");
    }
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal}>
        <button className={modalStyles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className={modalStyles.modalTitle}>Edit Class Material</h2>

        <div className={modalStyles.scrollContent}>
          <form className={modalStyles.form} onSubmit={handleSubmit}>
            {/* Class */}
            <label>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                Class <span style={{ color: "red" }}>*</span>
              </span>

              <select name="class_id" value={form.class_id} onChange={handleChange}>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              {errors.class_id && (
                <span className={modalStyles.error}>{errors.class_id}</span>
              )}
            </label>

            {/* Type */}
            <label>
              Type
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
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                Title <span style={{ color: "red" }}>*</span>
              </span>
              <input name="title" value={form.title} onChange={handleChange} required />
              {errors.title && <span className={modalStyles.error}>{errors.title}</span>}
            </label>

            {/* Replace file */}
            <label className={modalStyles.fullWidthLabel}>
              Replace File (optional)
              <input type="file" onChange={handleFileChange} />
              {file && <small>New file: {file.name}</small>}
              {uploading && <small>Uploading...</small>}
              {errors.file && <span className={modalStyles.error}>{errors.file}</span>}
            </label>

            {/* URL */}
            <label className={modalStyles.fullWidthLabel}>
              Current URL (will be replaced if new file uploaded)
              {/* ✅ editable: so you can change external links too. 
                  If you want readonly, add readOnly + background styling back. */}
              <input name="url" value={form.url} onChange={handleChange} />
              {errors.url && <span className={modalStyles.error}>{errors.url}</span>}
            </label>

            <div className={modalStyles.actions}>
              <button type="button" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className={modalStyles.primaryBtn}
                disabled={uploading}
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
