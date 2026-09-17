import modalStyles from "./Modal.module.css";
import { FaTimes } from "react-icons/fa";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../Utils/api";

export default function AccessControlModal({ client, onClose, handleRefresh }) {
  console.log("AccessControlModal component rendered with client:", client);

  const [form, setForm] = useState({
    
    aadhar_access:
      client.aadhar_access !== undefined ? client.aadhar_access : false,
    pan_access: client.pan_access !== undefined ? client.pan_access : false,
    mobile_access:
      client.mobile_access !== undefined ? client.mobile_access : true,
    vehicle_access:
      client.vehicle_access !== undefined ? client.vehicle_access : true,
    missing_vehicle_access:
      client.missing_vehicle_access !== undefined
        ? client.missing_vehicle_access
        : false,
    unclaimed_vehicle_access:
      client.unclaimed_vehicle_access !== undefined
        ? client.unclaimed_vehicle_access
        : false,
    accident_report_access:
      client.accident_report_access !== undefined
        ? client.accident_report_access
        : false,

    // New field
    bulk_check_access:
      client.bulk_check_access !== undefined ? client.bulk_check_access : false,
isteacher:
  client.isteacher !== undefined ? client.isteacher : false,
    categories: client.categories || [],
  });

  const [errors, setErrors] = useState({});

  const validCategories = [
    "CriminalBackground",
    "EmployeeBackground",
    "CompanyBackground",
    "RationCard",
    "DigitalBackground",
    "Bank",
  ];

  const handleChange = (e) => {
    const { name, type, checked, options } = e.target;

    if (name === "categories") {
      const selectedCategories = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setForm((prev) => ({ ...prev, categories: selectedCategories }));
      setErrors((prev) => ({ ...prev, categories: "" }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.filter(
        (category) => category !== categoryToRemove,
      ),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.categories.every((cat) => validCategories.includes(cat))) {
      newErrors.categories = `Categories must be one of: ${validCategories.join(", ")}`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!client || !client.id) {
      toast.error("Client data is missing.");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    try {
      toast.loading("Updating access settings...");

      const updatedData = {
        aadhar_access: form.aadhar_access,
        pan_access: form.pan_access,
        mobile_access: form.mobile_access,
        vehicle_access: form.vehicle_access,
        missing_vehicle_access: form.missing_vehicle_access,
        unclaimed_vehicle_access: form.unclaimed_vehicle_access,
        accident_report_access: form.accident_report_access,
        // If turning bulk check OFF, clear access + end date.
        // If turning ON, grant API below sets access + ends_at (30 days).
        bulk_check_access: form.bulk_check_access ? form.bulk_check_access : false,
        ...(form.bulk_check_access
          ? {}
          : { bulk_check_subscription_ends_at: null }),
        isteacher: form.isteacher,
        categories: form.categories,
      };

      const token = localStorage.getItem("token");
      const res = await api.put(`/update-client/${client.id}`, updatedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Enabling bulk check without ends_at is treated as expired on the app.
      // Always grant a 30-day subscription when the toggle is on.
      if (form.bulk_check_access) {
        try {
          await api.post(
            "/police/admin/grant-bulk-check-access",
            {
              client_id: client.id,
              duration_days: 30,
              purchase_amount: 199,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );
        } catch (grantErr) {
          console.error("Grant bulk check after access update failed:", grantErr);
          toast.dismiss();
          toast.error(
            grantErr.response?.data?.message ||
              "Access saved, but bulk-check subscription end date failed. Use Grant Access.",
          );
          handleRefresh();
          onClose();
          return;
        }
      }

      toast.dismiss();
      toast.success("Access settings updated successfully!");

      if (form.bulk_check_access) {
        toast.success("Bulk Check subscription granted for 30 days!", {
          icon: "🔑",
        });
      }

      handleRefresh();
      onClose();
    } catch (error) {
      console.error(
        "Error updating access settings:",
        error.response?.data || error.message,
      );
      toast.dismiss();
      toast.error(
        error.response?.data?.message || "Failed to update access settings.",
      );
    }
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal}>
        <button className={modalStyles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className={modalStyles.modalTitle}>Manage Access and Categories</h2>

        <div className={modalStyles.scrollContent}>
          <form className={modalStyles.form} onSubmit={handleSubmit}>
            {/* Existing toggles */}
            <label>
              Aadhar Access
              <label className={modalStyles.toggleWrapper}>
                <input
                  type="checkbox"
                  name="aadhar_access"
                  checked={form.aadhar_access}
                  onChange={handleChange}
                  className={modalStyles.toggleInput}
                />
                <div className={modalStyles.toggleSlider}>
                  <div className={modalStyles.toggleKnob}></div>
                </div>
              </label>
            </label>

            <label>
              PAN Access
              <label className={modalStyles.toggleWrapper}>
                <input
                  type="checkbox"
                  name="pan_access"
                  checked={form.pan_access}
                  onChange={handleChange}
                  className={modalStyles.toggleInput}
                />
                <div className={modalStyles.toggleSlider}>
                  <div className={modalStyles.toggleKnob}></div>
                </div>
              </label>
            </label>

            <label>
              Mobile Access
              <label className={modalStyles.toggleWrapper}>
                <input
                  type="checkbox"
                  name="mobile_access"
                  checked={form.mobile_access}
                  onChange={handleChange}
                  className={modalStyles.toggleInput}
                />
                <div className={modalStyles.toggleSlider}>
                  <div className={modalStyles.toggleKnob}></div>
                </div>
              </label>
            </label>

            <label>
              Vehicle Access
              <label className={modalStyles.toggleWrapper}>
                <input
                  type="checkbox"
                  name="vehicle_access"
                  checked={form.vehicle_access}
                  onChange={handleChange}
                  className={modalStyles.toggleInput}
                />
                <div className={modalStyles.toggleSlider}>
                  <div className={modalStyles.toggleKnob}></div>
                </div>
              </label>
            </label>

            <label>
              Missing Vehicle Access
              <label className={modalStyles.toggleWrapper}>
                <input
                  type="checkbox"
                  name="missing_vehicle_access"
                  checked={form.missing_vehicle_access}
                  onChange={handleChange}
                  className={modalStyles.toggleInput}
                />
                <div className={modalStyles.toggleSlider}>
                  <div className={modalStyles.toggleKnob}></div>
                </div>
              </label>
            </label>

            <label>
              Unclaimed Vehicle Access
              <label className={modalStyles.toggleWrapper}>
                <input
                  type="checkbox"
                  name="unclaimed_vehicle_access"
                  checked={form.unclaimed_vehicle_access}
                  onChange={handleChange}
                  className={modalStyles.toggleInput}
                />
                <div className={modalStyles.toggleSlider}>
                  <div className={modalStyles.toggleKnob}></div>
                </div>
              </label>
            </label>

            <label>
              Accident Report Access
              <label className={modalStyles.toggleWrapper}>
                <input
                  type="checkbox"
                  name="accident_report_access"
                  checked={form.accident_report_access}
                  onChange={handleChange}
                  className={modalStyles.toggleInput}
                />
                <div className={modalStyles.toggleSlider}>
                  <div className={modalStyles.toggleKnob}></div>
                </div>
              </label>
            </label>

            {/* ==================== NEW: Bulk Check Access ==================== */}
            <label>
              Bulk Check Access (Leakosint)
              <label className={modalStyles.toggleWrapper}>
                <input
                  type="checkbox"
                  name="bulk_check_access"
                  checked={form.bulk_check_access}
                  onChange={handleChange}
                  className={modalStyles.toggleInput}
                />
                <div className={modalStyles.toggleSlider}>
                  <div className={modalStyles.toggleKnob}></div>
                </div>
              </label>
              <span className={modalStyles.helperText}>
                Enable this and go to Api key and access grant Leakosint API
                access
              </span>
            </label>
            <label>
  Teacher Access
  <label className={modalStyles.toggleWrapper}>
    <input
      type="checkbox"
      name="isteacher"
      checked={form.isteacher}
      onChange={handleChange}
      className={modalStyles.toggleInput}
    />
    <div className={modalStyles.toggleSlider}>
      <div className={modalStyles.toggleKnob}></div>
    </div>
  </label>

  <span className={modalStyles.helperText}>
    Enable this to allow the user to create and control Live Tests.
  </span>
</label>
            {/* ================================================================ */}

            {/* Categories Section */}
            <label className={modalStyles.fullWidthLabel}>
              Categories
              <select
                name="categories"
                multiple
                value={form.categories}
                onChange={handleChange}
                className={modalStyles.fullWidthInput}
              >
                {validCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <span className={modalStyles.helperText}>
                Hold Ctrl (Windows) or Cmd (Mac) to select multiple categories
              </span>
              {errors.categories && (
                <span className={modalStyles.error}>{errors.categories}</span>
              )}
              <div className={modalStyles.categoryTags}>
                {form.categories.length > 0 ? (
                  form.categories.map((category) => (
                    <div key={category} className={modalStyles.categoryTag}>
                      {category}
                      <button
                        type="button"
                        className={modalStyles.removeCategoryBtn}
                        onClick={() => handleRemoveCategory(category)}
                        aria-label={`Remove ${category}`}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))
                ) : (
                  <span className={modalStyles.noCategories}>
                    No categories selected
                  </span>
                )}
              </div>
            </label>

            <div className={modalStyles.actions}>
              <button type="button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={modalStyles.primaryBtn}>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
