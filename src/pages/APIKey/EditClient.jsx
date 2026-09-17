import modalStyles from "./Modal.module.css";
import { FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../Utils/api";
import axios from "axios";
const cleanPayload = (data) => {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
  );
};
export default function EditClient({ client, onClose, onSave, handleRefresh }) {
  console.log("EditClient component rendered with client:", client);

  const [form, setForm] = useState({
    name: client.name || "",
    phone: client.phone || "",
    password: "",
    email: client.email || "",
    billing_method: client.billing_method || "PREPAID",
    client_type: client.client_type || "USER",
    parent_client_id: client.parent_client_id || "",
    state: client.state || "",
    district: client.district || "",
    police_station_name: client.police_station_name || "",
    attachment: client.attachment || "",
    reference_person_name: client.reference_person_name || "",
    reference_person_number: client.reference_person_number || "",
    is_active: client.is_active !== undefined ? client.is_active : false,
    categories: client.categories || [],
    pan_access: client.pan_access !== undefined ? client.pan_access : false,
    insurance_id: client.insurance_id || "",   // ← Changed to insurance_id
  });

  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [loadingInsurance, setLoadingInsurance] = useState(false);
  const [newAttachment, setNewAttachment] = useState(null);

  // ================= FETCH INSURANCE COMPANIES =================
  const fetchInsuranceCompanies = async () => {
    try {
      setLoadingInsurance(true);
      const res = await api.get("/insurance");
      setInsuranceCompanies(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch insurance companies:", err);
      toast.error("Failed to load insurance companies.");
    } finally {
      setLoadingInsurance(false);
    }
  };

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
      const booleanFields = ["is_active", "approved", "pan_access"];
      const newValue = booleanFields.includes(name) ? value === "true" : value;
      setForm((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat !== categoryToRemove),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setNewAttachment(file);
  };

  const extractFileName = (url) => {
    return url ? url.split("/").pop() : null;
  };

  const uploadAttachment = async () => {
    const formData = new FormData();
    formData.append("file", newAttachment);

    const res = await axios.post(
      "https://bucket.cyberawareness.ngo/bucket/upload/cybercrime",
      formData
    );
 return res?.data?.file?.url;
  };

  const deleteOldAttachment = async (filename) => {
    if (!filename) return;
    try {
      await axios.delete("https://qiktrack.com/bucket/delete-multiple/cybercrime", {
        data: { filenames: [filename] },
      });
    } catch (err) {
      console.error("Failed to delete old attachment:", err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!client?.id) {
      toast.error("Client data is missing.");
      return;
    }

    // Basic validations
    if (form.client_type === "SUBUSER" && !form.parent_client_id.trim()) {
      toast.error("Parent Client ID is required for Subuser.");
      return;
    }

    if (form.client_type === "INSURANCE" && !form.insurance_id) {
      toast.error("Please select an insurance company.");
      return;
    }

    if (form.client_type === "POLICE") {
      if (!form.state.trim() || !form.district.trim() || !form.police_station_name.trim()) {
        toast.error("State, District, and Police Station Name are required.");
        return;
      }
      if (!form.attachment && !newAttachment) {
        toast.error("Attachment is required for Police client.");
        return;
      }
    }

    try {
      toast.loading("Saving client...");

      let attachmentUrl = form.attachment;

      if (newAttachment) {
        const existingFilename = extractFileName(form.attachment);
        if (existingFilename) {
          await deleteOldAttachment(existingFilename);
        }
        attachmentUrl = await uploadAttachment();
      }

  let updatedData = {
  ...form,
  attachment: attachmentUrl,
};

// Remove insurance_id if not INSURANCE
if (form.client_type !== "INSURANCE") {
  delete updatedData.insurance_id;
}

// ❗ CLEAN DATA HERE
updatedData = cleanPayload(updatedData);
      // Remove insurance_id if not INSURANCE
      if (form.client_type !== "INSURANCE") {
        delete updatedData.insurance_id;
      }

      const res = await api.put(
        `/update-client/${client.id}`,
        updatedData
      );

      toast.dismiss();
      toast.success("Client updated successfully!");
      handleRefresh();
      onClose();
      onSave && onSave(updatedData);
    } catch (error) {
      console.error("Update error:", error);
      toast.dismiss();
      toast.error("Failed to update client.");
    }
  };

  // Reset conditional fields when client_type changes
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      parent_client_id: prev.parent_client_id || "",
      state: "",
      district: "",
      police_station_name: "",
      attachment: prev.attachment || "",
   insurance_id:
      prev.client_type === "INSURANCE"
        ? prev.insurance_id || client.insurance_id || ""
        : "", // only clear if not INSURANCE
    }));
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

        <h2 className={modalStyles.modalTitle}>Edit Client</h2>

        <div className={modalStyles.scrollContent}>
          <form className={modalStyles.form} onSubmit={handleSubmit}>
            <label>
              Name
              <input name="name" type="text" value={form.name} onChange={handleChange} required />
            </label>

            <label>
              Phone
              <input name="phone" type="text" value={form.phone} onChange={handleChange} required />
            </label>

            <label>
              Password (Leave blank to keep current)
              <input name="password" type="password" value={form.password} onChange={handleChange} />
            </label>

            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>

            <label>
              Billing Method
              <select name="billing_method" value={form.billing_method} onChange={handleChange}>
                <option value="PREPAID">Prepaid</option>
                <option value="POSTPAID">Postpaid</option>
              </select>
            </label>

            <label>
              Client Type
              <select name="client_type" value={form.client_type} onChange={handleChange}>
                <option value="USER">User</option>
                <option value="POLICE">Police</option>
                <option value="SUBUSER">Subuser</option>
                <option value="INSURANCE">Insurance</option>
              </select>
            </label>

            {/* INSURANCE DROPDOWN */}
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
                {loadingInsurance && <small>Loading companies...</small>}
              </label>
            )}

            {isSubuser && (
              <label>
                Parent Client ID
                <input
                  name="parent_client_id"
                  type="text"
                  value={form.parent_client_id}
                  onChange={handleChange}
                />
              </label>
            )}

            {showPoliceFields && (
              <>
                <label>
                  State
                  <input name="state" type="text" value={form.state} onChange={handleChange} />
                </label>
                <label>
                  District
                  <input name="district" type="text" value={form.district} onChange={handleChange} />
                </label>
                <label>
                  Police Station Name
                  <input
                    name="police_station_name"
                    type="text"
                    value={form.police_station_name}
                    onChange={handleChange}
                  />
                </label>

                {form.attachment && !newAttachment && (
                  <div>
                    <a
                      href={form.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View existing attachment
                    </a>
                  </div>
                )}

                <label>
                  Upload New Attachment
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </label>
              </>
            )}

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

            <label>
              Is Active
              <select
                name="is_active"
                value={form.is_active ? "true" : "false"}
                onChange={handleChange}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
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