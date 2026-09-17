// src/pages/enrollments/enrollments/EditEnrollment.jsx
import modalStyles from "./Modal.module.css";
import { FaTimes } from "react-icons/fa";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/Utils/api";

export default function EditEnrollment({ enrollment, onClose, onSuccess, clients, courses }) {
  const [form, setForm] = useState({
    status: enrollment.status,
    payment: enrollment.payment || 0,
    transaction_id: enrollment.transaction_id || "",
    enrollment_for: enrollment.enrollment_for,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.loading("Updating...");
    try {
      await api.put(`/update-enrollment/${enrollment.id}`, {
        ...form,
        payment: parseFloat(form.payment),
      });
      toast.dismiss();
      toast.success("Updated successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.dismiss();
      toast.error("Update failed");
    }
  };

  const student = clients.find((c) => c.id === enrollment.client_id);
  const course = courses.find((c) => c.id === enrollment.course_id);

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal}>
        <button className={modalStyles.closeBtn} onClick={onClose}><FaTimes /></button>
        <h2 className={modalStyles.modalTitle}>Edit Enrollment</h2>
        <div className={modalStyles.scrollContent}>
          <form className={modalStyles.form} onSubmit={handleSubmit}>
            <label>Student: <strong>{student?.name || "N/A"}</strong></label>
            <label>Course: <strong>{course?.title || "N/A"}</strong></label>

            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="ENROLLED">Enrolled</option>
                <option value="COMPLETED">Completed</option>
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
              Payment (₹)
              <input type="number" name="payment" value={form.payment} onChange={handleChange} step="0.01" min="0" />
            </label>

            <label>
              Transaction ID
              <input name="transaction_id" value={form.transaction_id} onChange={handleChange} />
            </label>

            <div className={modalStyles.actions}>
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit" className={modalStyles.primaryBtn}>Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}