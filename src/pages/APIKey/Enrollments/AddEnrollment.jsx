// src/pages/enrollments/enrollments/AddEnrollment.jsx
import modalStyles from "./Modal.module.css"; // Reuse your existing modal styles
import { FaTimes } from "react-icons/fa";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/Utils/api";

export default function AddEnrollment({ onClose, onSuccess, clients, courses }) {
  const [form, setForm] = useState({
    client_id: "",
    course_id: "",
    status: "ENROLLED",
    payment: 0,
    transaction_id: "",
    enrollment_for: "COURSE",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client_id || !form.course_id) {
      toast.error("Student and Course are required");
      return;
    }

    toast.loading("Creating enrollment...");
    try {
      await api.post("/create-enrollment", {
        ...form,
        payment: parseFloat(form.payment || 0),
      });
      toast.dismiss();
      toast.success("Enrollment created!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Failed to create enrollment");
    }
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal}>
        <button className={modalStyles.closeBtn} onClick={onClose}><FaTimes /></button>
        <h2 className={modalStyles.modalTitle}>Add New Enrollment</h2>
        <div className={modalStyles.scrollContent}>
          <form className={modalStyles.form} onSubmit={handleSubmit}>
            <label>
              Student <span style={{ color: "red" }}>*</span>
              <select name="client_id" value={form.client_id} onChange={handleChange} required>
                <option value="">Select Student</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} {c.phone && `(${c.phone})`}</option>
                ))}
              </select>
            </label>

            <label>
              Course <span style={{ color: "red" }}>*</span>
              <select name="course_id" value={form.course_id} onChange={handleChange} required>
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </label>

            <label>
              Type
              <select name="enrollment_for" value={form.enrollment_for} onChange={handleChange}>
                <option value="COURSE">Course</option>
                <option value="LIVE_SESSION">Live Session</option>
              </select>
            </label>

            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="ENROLLED">Enrolled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>

            <label>
              Payment (₹)
              <input type="number" name="payment" value={form.payment} onChange={handleChange} min="0" step="0.01" />
            </label>

            <label>
              Transaction ID
              <input name="transaction_id" value={form.transaction_id} onChange={handleChange} />
            </label>

            <div className={modalStyles.actions}>
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit" className={modalStyles.primaryBtn}>Create</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}