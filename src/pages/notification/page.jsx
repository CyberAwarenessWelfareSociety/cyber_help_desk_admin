import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import api from "@/Utils/api";
import styles from "./SendNotification.module.css";

export default function NotificationManager() {
  const [activeTab, setActiveTab] = useState("list");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [type, setType] = useState("client");
  const [form, setForm] = useState({
    client_id: "",
    role: "POLICE",
    roles: [],
    title: "",
    body: "",
    data: "",
    scheduleType: "once",
    scheduleTime: "",
    time: "",
    days: [],
  });

  const [clients, setClients] = useState([]);
  const [searchClient, setSearchClient] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const suggestionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api.get("/get-client?limit=all").then((res) => setClients(res.data?.data || []));
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (!suggestionRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredClients = useMemo(() => {
    const search = searchClient.toLowerCase().trim();
    return clients.filter((c) =>
      c.name?.toLowerCase().includes(search) ||
      c.phone?.includes(search) ||
      c.email?.toLowerCase().includes(search)
    );
  }, [searchClient, clients]);

  const uploadImages = async () => {
    if (imageFiles.length === 0) return null;
    setUploading(true);
    const formData = new FormData();
    imageFiles.forEach((file) => formData.append("file", file));
    try {
      const res = await axios.post(
        "https://bucket.cyberawareness.ngo/bucket/upload/cybercrime",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res?.data?.file?.url || null;
    } catch (err) {
      toast.error("Image upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setForm({
      client_id: "", role: "POLICE", roles: [], title: "", body: "", data: "",
      scheduleType: "once", scheduleTime: "", time: "", days: []
    });
    setSearchClient("");
    setImageFiles([]);
    setType("client");
    setShowModal(true);
  };

  const openEditModal = (notif) => {
    setIsEditMode(true);
    setEditingId(notif.id);
    setType(notif.target_type || "client");

    setForm({
      client_id: notif.target_value?.client_id || "",
      role: notif.target_value?.role || "POLICE",
      roles: notif.target_value?.roles || [],
      title: notif.title,
      body: notif.body,
      data: JSON.stringify(notif.data || {}),
      scheduleType: notif.type === "ONCE" ? "once" : notif.type.toLowerCase(),
      scheduleTime: notif.schedule_time ? new Date(notif.schedule_time).toISOString().slice(0, 16) : "",
      time: notif.time || "",
      days: notif.days || [],
    });

    const selectedClient = clients.find(c => c.id === notif.target_value?.client_id);
    setSearchClient(selectedClient ? `${selectedClient.name} (${selectedClient.phone})` : "");

    setShowModal(true);
  };

  const handleDaysChange = (day) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  // ================= HANDLE SUBMIT - NO next_run_at =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading(isEditMode ? "Updating..." : "Sending...");

    try {
      const imageUrl = await uploadImages();

      const payload = {
        title: form.title,
        body: form.body,
        data: form.data ? JSON.parse(form.data || "{}") : {},
        image: imageUrl,
      };

      // Scheduling Logic (No next_run_at sent)
      if (form.scheduleType === "once") {
        if (form.scheduleTime) {
          payload.scheduleTime = new Date(form.scheduleTime).toISOString();
        }
      } else {
        payload.type = form.scheduleType.toUpperCase();
        payload.time = form.time;
        if (form.days.length > 0) payload.days = form.days;
        // Removed: payload.next_run_at = ...
      }

      // Target
      if (type === "client") payload.client_id = form.client_id;
      if (type === "role") payload.role = form.role;
      if (type === "broadcast") payload.roles = form.roles;

      const endpoint = isEditMode
        ? `/notifications/${editingId}`
        : type === "client"
        ? "/notifications/send-to-client"
        : type === "role"
        ? "/notifications/send-to-role"
        : "/notifications/broadcast";

      if (isEditMode) {
        await api.put(endpoint, payload);
      } else {
        await api.post(endpoint, payload);
      }

      toast.dismiss(tId);
      toast.success(isEditMode ? "Updated successfully!" : "Notification sent successfully!");

      setShowModal(false);
      fetchNotifications();
    } catch (err) {
      toast.dismiss(tId);
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handlePause = async (id) => {
    await api.patch(`/notifications/${id}/pause`);
    toast.success("Paused");
    fetchNotifications();
  };

  const handleResume = async (id) => {
    await api.patch(`/notifications/${id}/resume`);
    toast.success("Resumed");
    fetchNotifications();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    await api.delete(`/notifications/${id}`);
    toast.success("Deleted");
    fetchNotifications();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Notification Manager</h1>
        <button className={styles.createBtn} onClick={openCreateModal}>
          + Create New Notification
        </button>
      </div>

      <div className={styles.listContainer}>
        {loading ? <p>Loading...</p> : notifications.length === 0 ? (
          <p>No notifications found.</p>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className={styles.notificationCard}>
              <div className={styles.notifInfo}>
                <h3>{notif.title}</h3>
                <p>{notif.body}</p>
                <small>
                  Type: <b>{notif.type}</b> | 
                  Status: <span className={styles[notif.status]}>{notif.status}</span> | 
                  Target: <b>{notif.target_type}</b>
                </small>
                {notif.next_run_at && (
                  <small>Next Run: {new Date(notif.next_run_at).toLocaleString()}</small>
                )}
              </div>

              <div className={styles.actions}>
                <button onClick={() => openEditModal(notif)} className={styles.editBtn}>Edit</button>
                {notif.status === "active" && <button onClick={() => handlePause(notif.id)} className={styles.pauseBtn}>Pause</button>}
                {notif.status === "paused" && <button onClick={() => handleResume(notif.id)} className={styles.resumeBtn}>Resume</button>}
                <button onClick={() => handleDelete(notif.id)} className={styles.deleteBtn}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===================== MODAL ===================== */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>{isEditMode ? "Edit Notification" : "Create New Notification"}</h2>

            <form onSubmit={handleSubmit}>
              {!isEditMode && (
                <div className={styles.subTabs}>
                  {["client", "role", "broadcast"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={type === t ? styles.active : ""}
                      onClick={() => setType(t)}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}

              {type === "client" && (
                <label style={{ position: "relative" }}>
                  Search & Select Client
                  <input
                    ref={inputRef}
                    value={searchClient}
                    onChange={(e) => { setSearchClient(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Type name or phone..."
                    required
                  />
                  {showSuggestions && filteredClients.length > 0 && (
                    <div ref={suggestionRef} className={styles.suggestions}>
                      {filteredClients.slice(0, 10).map((c) => (
                        <div
                          key={c.id}
                          className={styles.suggestionItem}
                          onClick={() => {
                            setForm(p => ({ ...p, client_id: c.id }));
                            setSearchClient(`${c.name} (${c.phone})`);
                            setShowSuggestions(false);
                          }}
                        >
                          <strong>{c.name}</strong> — {c.phone}
                        </div>
                      ))}
                    </div>
                  )}
                </label>
              )}

              {type === "role" && (
                <label>
                  Select Role
                  <select value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="POLICE">POLICE</option>
                    <option value="INSURANCE">INSURANCE</option>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </label>
              )}

              {type === "broadcast" && (
                <div>
                  <p>Select Roles</p>
                  {["USER", "POLICE", "INSURANCE", "ADMIN"].map(r => (
                    <label key={r} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={form.roles.includes(r)}
                        onChange={() => setForm(p => ({
                          ...p,
                          roles: p.roles.includes(r) ? p.roles.filter(x => x !== r) : [...p.roles, r]
                        }))}
                      /> {r}
                    </label>
                  ))}
                </div>
              )}

              <input placeholder="Title" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} required />
              <textarea placeholder="Message Body" value={form.body} onChange={(e) => setForm(p => ({ ...p, body: e.target.value }))} required />

              <label>Image (Optional) <input type="file" onChange={(e) => setImageFiles([...e.target.files])} /></label>

              <select value={form.scheduleType} onChange={(e) => setForm(p => ({ ...p, scheduleType: e.target.value }))}>
                <option value="once">One Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom Days</option>
              </select>

              {form.scheduleType !== "once" && (
                <input type="time" value={form.time} onChange={(e) => setForm(p => ({ ...p, time: e.target.value }))} required />
              )}

              {(form.scheduleType === "weekly" || form.scheduleType === "custom") && (
                <div>
                  <p>Select Days</p>
                  <div className={styles.daysContainer}>
                    {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(day => (
                      <label key={day} className={styles.dayLabel}>
                        <input type="checkbox" checked={form.days.includes(day)} onChange={() => handleDaysChange(day)} />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>
              )}

   

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>Send Notification</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}