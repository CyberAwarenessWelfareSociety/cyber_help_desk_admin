import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/Utils/api";
import styles from "./AppVersion.module.css";

export default function AddAppVersion({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    platform: "IOS",
    version: "",
    build_number: "",
    force_update: false,
    update_message: "",
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
      await api.post("/app-version", form);

      toast.success("App version created");

      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to create version");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Add App Version</h3>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Platform
            <select
              name="platform"
              value={form.platform}
              onChange={handleChange}
            >
              <option value="IOS">iOS</option>
              <option value="ANDROID">Android</option>
            </select>
          </label>

          <label>
            Version
            <input
              name="version"
              value={form.version}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Build Number
            <input
              type="number"
              name="build_number"
              value={form.build_number}
              onChange={handleChange}
              required
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
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}