import modalStyles from "./Modal.module.css";
import { FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import api from "../../Utils/api";
import toast from "react-hot-toast";

export default function AddClient({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    email: "",
    billing_method: "PREPAID",
    client_type: "USER",
    parent_client_id: "",
    state: "",
    district: "",
    police_station_name: "",
    attachment: "",
    reference_person_name: "",
    reference_person_number: "",
    insurance_id: "",           // ← Now using insurance_id instead of name
    categories: [],
  });

  const [errors, setErrors] = useState({});
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [loadingInsurance, setLoadingInsurance] = useState(false);

  // ================= FETCH INSURANCE COMPANIES =================
  const fetchInsuranceCompanies = async () => {
    try {
      setLoadingInsurance(true);
      const res = await api.get("/insurance"); 
      // Adjust if your API returns data in res.data.data
      setInsuranceCompanies(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch insurance companies:", err);
      toast.error("Failed to load insurance companies. Please try again.");
    } finally {
      setLoadingInsurance(false);
    }
  };

  // Fetch insurance companies on component mount
  useEffect(() => {
    fetchInsuranceCompanies();
  }, []);

  const handleChange = (e) => {
    const { name, value, options } = e.target;

    if (name === "categories") {
      const selectedCategories = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setForm((prev) => ({ ...prev, categories: selectedCategories }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat !== categoryToRemove),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.phone.trim()) newErrors.phone = "Phone is required.";
    if (!form.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }
    if (!form.email.trim()) newErrors.email = "Email is required.";
    if (!form.billing_method) newErrors.billing_method = "Billing method is required.";

    // Insurance validation
    if (form.client_type === "INSURANCE") {
      if (!form.insurance_id) {
        newErrors.insurance_id = "Please select an insurance company.";
      }
    }

    // Police validation
    if (form.client_type === "POLICE") {
      if (!form.state.trim()) newErrors.state = "State is required for Police.";
      if (!form.district.trim()) newErrors.district = "District is required for Police.";
      if (!form.police_station_name.trim())
        newErrors.police_station_name = "Police station name is required for Police.";
      if (!form.attachment.trim())
        newErrors.attachment = "Attachment is required for Police.";
    }

    // Subuser validation
    if (form.client_type === "SUBUSER") {
      if (!form.parent_client_id.trim())
        newErrors.parent_client_id = "Parent Client ID is required for Subuser.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = { ...form };

      // Remove insurance_id if client is not INSURANCE
      if (form.client_type !== "INSURANCE") {
        delete payload.insurance_id;
      }

      const response = await api.post("/clients-without-otp", payload);

      if (response.status === 201) {
        toast.success(response?.data?.message || "Client added successfully!");
        onClose();
        onAdd && onAdd(payload);
      }
    } catch (error) {
      console.error("Error submitting client:", error);
      const errMsg =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong while adding client.";
      toast.error(errMsg);
    }
  };

  // Reset conditional fields when client_type changes
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      parent_client_id: "",
      state: "",
      district: "",
      police_station_name: "",
      attachment: "",
      insurance_id: "",        // Reset insurance selection
      categories: prev.categories,
    }));
    setErrors({});
  }, [form.client_type]);

  const isInsurance = form.client_type === "INSURANCE";
  const showPoliceFields = form.client_type === "POLICE";
  const isSubuser = form.client_type === "SUBUSER";

  const validCategories = [
    "CriminalBackground",
    "EmployeeBackground",
    "CompanyBackground",
    "RationCard",
    "DigitalBackground",
    "Bank",
  ];

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal}>
        <button className={modalStyles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className={modalStyles.modalTitle}>Add New Client</h2>

        <div className={modalStyles.scrollContent}>
          <form className={modalStyles.form} onSubmit={handleSubmit}>
            {/* Basic Information */}
            <label>
              Name <span style={{ color: "red" }}>*</span>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
              />
              {errors.name && <span className={modalStyles.error}>{errors.name}</span>}
            </label>

            <label>
              Phone <span style={{ color: "red" }}>*</span>
              <input
                name="phone"
                type="text"
                value={form.phone}
                onChange={handleChange}
                maxLength={10}
                placeholder="Enter 10-digit phone number"
              />
              {errors.phone && <span className={modalStyles.error}>{errors.phone}</span>}
            </label>

            <label>
              Password <span style={{ color: "red" }}>*</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password (min 6 characters)"
              />
              {errors.password && <span className={modalStyles.error}>{errors.password}</span>}
            </label>

            <label>
              Email <span style={{ color: "red" }}>*</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
              {errors.email && <span className={modalStyles.error}>{errors.email}</span>}
            </label>

            <label>
              Billing Method
              <select
                name="billing_method"
                value={form.billing_method}
                onChange={handleChange}
              >
                <option value="PREPAID">Prepaid</option>
                <option value="POSTPAID">Postpaid</option>
              </select>
              {errors.billing_method && (
                <span className={modalStyles.error}>{errors.billing_method}</span>
              )}
            </label>

            <label>
              Client Type
              <select
                name="client_type"
                value={form.client_type}
                onChange={handleChange}
              >
                <option value="USER">User</option>
                <option value="POLICE">Police</option>
                <option value="SUBUSER">Subuser</option>
                <option value="INSURANCE">Insurance</option>
              </select>
            </label>

            {/* Insurance Company Dropdown - Only for INSURANCE */}
            {isInsurance && (
              <label>
                <p>

                Insurance Company <span style={{ color: "red" }}>*</span>
                </p>
                <select
                  name="insurance_id"
                  value={form.insurance_id}
                  onChange={handleChange}
                  disabled={loadingInsurance}
                >
                  <option value="">Select Insurance Company</option>
                  {insuranceCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.insurance_company_name}
                    </option>
                  ))}
                </select>
                {loadingInsurance && <small style={{ color: "#6366f1" }}>Loading companies...</small>}
                {errors.insurance_id && (
                  <span className={modalStyles.error}>{errors.insurance_id}</span>
                )}
              </label>
            )}

            {/* Subuser Field */}
            {isSubuser && (
              <label>
                Parent Client ID <span style={{ color: "red" }}>*</span>
                <input
                  name="parent_client_id"
                  type="text"
                  value={form.parent_client_id}
                  onChange={handleChange}
                  placeholder="Enter parent client ID"
                />
                {errors.parent_client_id && (
                  <span className={modalStyles.error}>{errors.parent_client_id}</span>
                )}
              </label>
            )}

            {/* Police Fields */}
            {showPoliceFields && (
              <>
                <label>
                  State <span style={{ color: "red" }}>*</span>
                  <input
                    name="state"
                    type="text"
                    value={form.state}
                    onChange={handleChange}
                  />
                  {errors.state && <span className={modalStyles.error}>{errors.state}</span>}
                </label>

                <label>
                  District <span style={{ color: "red" }}>*</span>
                  <input
                    name="district"
                    type="text"
                    value={form.district}
                    onChange={handleChange}
                  />
                  {errors.district && <span className={modalStyles.error}>{errors.district}</span>}
                </label>

                <label>
                  Police Station Name <span style={{ color: "red" }}>*</span>
                  <input
                    name="police_station_name"
                    type="text"
                    value={form.police_station_name}
                    onChange={handleChange}
                  />
                  {errors.police_station_name && (
                    <span className={modalStyles.error}>{errors.police_station_name}</span>
                  )}
                </label>

                <label>
                  Attachment
                  <input
                    name="attachment"
                    type="text"
                    value={form.attachment}
                    onChange={handleChange}
                    placeholder="Paste URL or leave blank"
                  />
                  {errors.attachment && (
                    <span className={modalStyles.error}>{errors.attachment}</span>
                  )}
                </label>
              </>
            )}

            {/* Reference Person */}
            <label>
              Reference Person Name
              <input
                name="reference_person_name"
                type="text"
                value={form.reference_person_name}
                onChange={handleChange}
              />
            </label>

            <label>
              Reference Person Number
              <input
                name="reference_person_number"
                type="text"
                value={form.reference_person_number}
                onChange={handleChange}
              />
            </label>

            {/* Categories */}
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
                Hold Ctrl (Windows) or Cmd (Mac) to select multiple
              </span>

              <div className={modalStyles.categoryTags}>
                {form.categories.length > 0 ? (
                  form.categories.map((category) => (
                    <div key={category} className={modalStyles.categoryTag}>
                      {category}
                      <button
                        type="button"
                        className={modalStyles.removeCategoryBtn}
                        onClick={() => handleRemoveCategory(category)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))
                ) : (
                  <span className={modalStyles.noCategories}>No categories selected</span>
                )}
              </div>
            </label>

            {/* Action Buttons */}
            <div className={modalStyles.actions}>
              <button type="button" onClick={onClose} className={modalStyles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" className={modalStyles.primaryBtn}>
                Add Client
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}