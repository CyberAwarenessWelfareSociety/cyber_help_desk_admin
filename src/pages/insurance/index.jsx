import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Insurance.module.css";

const API = (import.meta.env.VITE_API_URL || "http://localhost:8600/api") + "/insurance";

export default function InsuranceCRUD() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ insurance_company_name: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setList(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch insurance companies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.insurance_company_name.trim()) return;

    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, form);
      } else {
        await axios.post(API, form);
      }

      setForm({ insurance_company_name: "" });
      setEditId(null);
      fetchData();
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this insurance company?")) return;

    try {
      await axios.delete(`${API}/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const handleEdit = (item) => {
    setForm({ insurance_company_name: item.insurance_company_name });
    setEditId(item.id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Beautiful Header */}
        <div className={styles.header}>
          <h2>🛡️ Insurance Companies</h2>
          <p>Manage your insurance providers</p>
        </div>

        {/* Form Section */}
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              placeholder="Enter insurance company name..."
              value={form.insurance_company_name}
              onChange={(e) =>
                setForm({ insurance_company_name: e.target.value })
              }
            />
            <button type="submit">
              {editId ? "Update Company" : "Add Company"}
            </button>
          </form>
        </div>

        {/* List Section */}
        <div className={styles.listContainer}>
          <div className={styles.listHeader}>
            <h3>All Insurance Companies</h3>
            <span className={styles.count}>{list.length} total</span>
          </div>

          {list.length === 0 && !loading ? (
            <div className={styles.empty}>
              <p>No insurance companies added yet.</p>
              <p>Add one using the form above 👆</p>
            </div>
          ) : (
            <div className={styles.list}>
              {list.map((item) => (
                <div key={item.id} className={styles.item}>
                  <span>{item.insurance_company_name}</span>

                  <div className={styles.actions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEdit(item)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(item.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}