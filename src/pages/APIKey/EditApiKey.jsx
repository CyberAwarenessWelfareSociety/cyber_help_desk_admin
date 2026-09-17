import modalStyles from "./Modal.module.css";
import { FaTimes } from "react-icons/fa";
import { useState } from "react";

export default function EditApiKey({ row, onClose }) {
  // Map row data to fields for editing
  const [form, setForm] = useState({
    rule: row.rule,
    status: row.status,
    bind: row.bind,
    failed: row.failed.replace('%', '')
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal}>
        <button className={modalStyles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>
        <h2 className={modalStyles.modalTitle}>Edit API Key</h2>
        <form className={modalStyles.form}>
          <label>
            Rule name
            <input
              type="text"
              name="rule"
              value={form.rule}
              onChange={handleChange}
            />
          </label>
          <label>
            Status
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option>Candidate</option>
              <option>Final</option>
            </select>
          </label>
          <label>
            Bindings
            <input
              type="text"
              name="bind"
              value={form.bind}
              onChange={handleChange}
            />
          </label>
          <label>
            Failed Row (%)
            <input
              type="number"
              name="failed"
              min="0"
              max="100"
              value={form.failed}
              onChange={handleChange}
            />
          </label>
          <div className={modalStyles.actions}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className={modalStyles.primaryBtn}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
