import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/Utils/api";
import styles from "./AppVersion.module.css";

export default function EditAppVersion({ version, onClose, onSuccess }) {
  const [form, setForm] = useState({
    version: version.version,
    build_number: version.build_number,
    force_update: version.force_update,
    update_message: version.update_message,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/app-version/${version.id}`, form);

      toast.success("Version updated");

      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Edit {version.platform} Version</h3>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Version
            <input
              name="version"
              value={form.version}
              onChange={handleChange}
            />
          </label>

          <label>
            Build Number
            <input
              name="build_number"
              type="number"
              value={form.build_number}
              onChange={handleChange}
            />
          </label>

          <label>
            Update Message
            <textarea
              name="update_message"
              value={form.update_message}
              onChange={handleChange}
            />
          </label>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="force_update"
              checked={form.force_update}
              onChange={handleChange}
            />
            Force Update
          </label>

          <div className={styles.buttons}>
            <button type="button" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className={styles.primary}>
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}