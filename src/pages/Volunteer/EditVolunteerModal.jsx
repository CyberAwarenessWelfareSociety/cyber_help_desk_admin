// src/pages/Volunteer/EditVolunteerModal.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import {
  FaTimes,
  FaCamera,
  FaUser,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaSpinner,
  FaSave,
  FaIdBadge,
} from "react-icons/fa";
import { uploadToBucket } from "../../Utils/upload";
import styles from "./EditVolunteerModal.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8600/api";

const DEFAULT_MODELS = [
  { value: "Blackmail", label: "Blackmail" },
  { value: "CyberFraud", label: "Cyber Fraud" },
  { value: "AccountFreeze", label: "Account Freeze" },
  { value: "NudeImage", label: "Remove Nude Image" },
  { value: "NudeVideo", label: "Remove Nude Video" },
  { value: "HarmfulContent", label: "Remove Harmful Content / URL" },
];

const formatDateForInput = (val) => {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const parsePermissions = (perms) => {
  if (!perms) return [];
  if (Array.isArray(perms)) return perms;
  if (typeof perms === "string") {
    try {
      const parsed = JSON.parse(perms);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const EditVolunteerModal = ({
  volunteer,
  onClose,
  onSuccess,
  models = DEFAULT_MODELS,
}) => {
  const fileInputRef = useRef(null);

  const initialStatus = volunteer?.is_approved
    ? "approved"
    : volunteer?.is_rejected
      ? "rejected"
      : "pending";

  const [form, setForm] = useState({
    full_name: volunteer?.full_name || "",
    phone: volunteer?.Applicant?.phone || volunteer?.phone || "",
    email: volunteer?.email || "",
    volunteer_id: volunteer?.volunteer_id || "",
    date_of_birth: formatDateForInput(volunteer?.date_of_birth),
    gender: volunteer?.gender || "MALE",
    volunteer_role: volunteer?.volunteer_role || "",
    status: initialStatus,
    state: volunteer?.state || "",
    district: volunteer?.district || "",
    city_town: volunteer?.city_town || "",
    address: volunteer?.address || "",
    remarks: volunteer?.remarks || "",
    permissions: parsePermissions(volunteer?.permissions),
    profile_image: volunteer?.profile_image || "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    volunteer?.profile_image || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if volunteer prop changes
  useEffect(() => {
    if (volunteer) {
      const status = volunteer.is_approved
        ? "approved"
        : volunteer.is_rejected
          ? "rejected"
          : "pending";

      setForm({
        full_name: volunteer.full_name || "",
        phone: volunteer.Applicant?.phone || volunteer.phone || "",
        email: volunteer.email || "",
        volunteer_id: volunteer.volunteer_id || "",
        date_of_birth: formatDateForInput(volunteer.date_of_birth),
        gender: volunteer.gender || "MALE",
        volunteer_role: volunteer.volunteer_role || "",
        status,
        state: volunteer.state || "",
        district: volunteer.district || "",
        city_town: volunteer.city_town || "",
        address: volunteer.address || "",
        remarks: volunteer.remarks || "",
        permissions: parsePermissions(volunteer.permissions),
        profile_image: volunteer.profile_image || "",
      });
      setImagePreview(volunteer.profile_image || "");
      setImageFile(null);
    }
  }, [volunteer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setImageFile(null);
    setImagePreview("");
    setForm((prev) => ({ ...prev, profile_image: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const togglePermission = (modelVal) => {
    setForm((prev) => {
      const current = prev.permissions;
      if (current.includes(modelVal)) {
        return { ...prev, permissions: current.filter((p) => p !== modelVal) };
      } else {
        return { ...prev, permissions: [...current, modelVal] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.full_name.trim()) {
      toast.error("Full Name is required");
      return;
    }

    if (!form.state.trim() || !form.district.trim() || !form.city_town.trim()) {
      toast.error("State, District, and City/Town are required");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Saving volunteer profile...");

    try {
      let finalImageUrl = form.profile_image;

      // Upload new image to storage bucket if selected
      if (imageFile) {
        try {
          finalImageUrl = await uploadToBucket({ file: imageFile });
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
          toast.error("Failed to upload profile photo: " + uploadErr.message, {
            id: toastId,
          });
          setIsSubmitting(false);
          return;
        }
      }

      const token = localStorage.getItem("token") || Cookies.get("token");

      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone ? form.phone.trim() : null,
        email: form.email ? form.email.trim() : null,
        volunteer_id: form.volunteer_id ? form.volunteer_id.trim() : null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender,
        profile_image: finalImageUrl || null,
        state: form.state.trim(),
        district: form.district.trim(),
        city_town: form.city_town.trim(),
        address: form.address ? form.address.trim() : null,
        volunteer_role: form.volunteer_role ? form.volunteer_role.trim() : null,
        remarks: form.remarks ? form.remarks.trim() : null,
        permissions: form.permissions,
        is_approved: form.status === "approved",
        is_rejected: form.status === "rejected",
      };

      const res = await axios.put(
        `${API_URL}/volunteer/${volunteer.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = res.data?.application || {
        ...volunteer,
        ...payload,
        Applicant: {
          ...volunteer?.Applicant,
          phone: payload.phone,
        },
      };

      toast.success("Volunteer profile updated successfully!", { id: toastId });

      if (onSuccess) {
        onSuccess(updated);
      }
      onClose();
    } catch (err) {
      console.error("Failed to update volunteer:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update volunteer profile";
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2>
              <FaIdBadge style={{ color: "#6366f1" }} /> Edit Volunteer Profile
            </h2>
            <p className={styles.headerSubtitle}>
              Update details, permissions, and application status for{" "}
              <strong>{volunteer?.full_name}</strong>
              {volunteer?.volunteer_id ? ` (${volunteer.volunteer_id})` : ""}
            </p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isSubmitting}
            title="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className={styles.body}>
          {/* Profile Photo Section */}
          <div className={styles.profilePhotoSection}>
            <div className={styles.avatarWrapper}>
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <FaUser />
                </div>
              )}
            </div>

            <div className={styles.photoActions}>
              <h4 className={styles.photoActionsTitle}>Profile Picture</h4>
              <p className={styles.photoActionsSub}>
                Upload a clear photo for the volunteer identity card and profile.
              </p>
              <div>
                <button
                  type="button"
                  className={styles.uploadPhotoBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <FaCamera />
                  {imagePreview ? "Change Photo" : "Upload Photo"}
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    className={styles.removePhotoBtn}
                    onClick={handleRemovePhoto}
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FaUser /> Personal Information
            </div>

            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Full Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.grid3}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="volunteer@example.com"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Volunteer & System Details */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FaIdBadge /> Volunteer System Details
            </div>

            <div className={styles.grid3}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Volunteer ID</label>
                <input
                  type="text"
                  name="volunteer_id"
                  value={form.volunteer_id}
                  onChange={handleChange}
                  placeholder="e.g. CAWS-00001"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Volunteer Role</label>
                <input
                  type="text"
                  name="volunteer_role"
                  value={form.volunteer_role}
                  onChange={handleChange}
                  placeholder="e.g. Cyber Safety Volunteer"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Application Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={`${styles.select} ${styles.statusSelect} ${
                    form.status === "approved"
                      ? styles.statusApproved
                      : form.status === "rejected"
                        ? styles.statusRejected
                        : styles.statusPending
                  }`}
                >
                  <option value="pending">⏳ Pending Review</option>
                  <option value="approved">✅ Approved</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FaMapMarkerAlt /> Location Details
            </div>

            <div className={styles.grid3}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  State <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  District <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="District"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  City / Town <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="city_town"
                  value={form.city_town}
                  onChange={handleChange}
                  placeholder="City or Town"
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Full Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street address, landmark, PIN code..."
                className={styles.textarea}
                rows={2}
              />
            </div>
          </div>

          {/* Assigned Permissions / Models */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FaShieldAlt /> Assigned Case Models & Permissions
            </div>
            <p
              style={{
                fontSize: "12.5px",
                color: "#64748b",
                margin: "0 0 4px 0",
              }}
            >
              Select which case categories this volunteer is permitted to handle:
            </p>

            <div className={styles.permissionsGrid}>
              {models.map((m) => {
                const isChecked = form.permissions.includes(m.value);
                return (
                  <label
                    key={m.value}
                    className={`${styles.permissionCard} ${
                      isChecked ? styles.permissionCardActive : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePermission(m.value)}
                      disabled={isSubmitting}
                    />
                    <span className={styles.permissionLabel}>{m.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Remarks */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FaCheckCircle /> Admin Remarks & Notes
            </div>
            <div className={styles.formGroup}>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Internal notes, verification details, or remarks about this volunteer..."
                className={styles.textarea}
                rows={2}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className={styles.spin} /> Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVolunteerModal;
