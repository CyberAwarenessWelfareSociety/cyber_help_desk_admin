import styles from "./AppVersion.module.css";
import { FaEdit, FaTrash, FaSync, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/Utils/api";
import EditAppVersion from "./EditAppVersion";
import AddAppVersion from "./AddAppVersion";
import DeleteConfirmModal from "../../Components/FinalDeleteModal/DeleteConfirmModal";

const AppVersion = () => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editVersion, setEditVersion] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchVersions = async () => {
    setLoading(true);

    try {
      const [iosRes, androidRes] = await Promise.all([
        api.get("/app-version/latest?platform=IOS"),
        api.get("/app-version/latest?platform=ANDROID"),
      ]);

      const ios = iosRes.data?.data;
      const android = androidRes.data?.data;

      setVersions([ios, android].filter(Boolean));
    } catch (err) {
      toast.error("Failed to fetch versions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      await api.delete(`/app-version/${deleteItem.id}`);
      toast.success("Version deleted");
      fetchVersions();
      setDeleteItem(null);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        <div className={styles.header}>
          <h2>App Versions</h2>

          <div className={styles.headerActions}>
            <button
              className={styles.addBtn}
              onClick={() => setShowAdd(true)}
            >
              <FaPlus /> Add Version
            </button>

            <button
              className={styles.refreshBtn}
              onClick={fetchVersions}
            >
              <FaSync />
            </button>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Platform</th>
              <th>Version</th>
              <th>Build</th>
              <th>Force Update</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className={styles.loading}>
                  Loading...
                </td>
              </tr>
            ) : (
              versions.map((v) => (
                <tr key={v.id}>
                  <td>{v.platform}</td>
                  <td>{v.version}</td>
                  <td>{v.build_number}</td>
                  <td>{v.force_update ? "Yes" : "No"}</td>
                  <td>{v.update_message}</td>

                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.edit}
                        onClick={() => setEditVersion(v)}
                      >
                        <FaEdit />
                      </button>

                      <button
                        className={styles.delete}
                        onClick={() => setDeleteItem(v)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {showAdd && (
          <AddAppVersion
            onClose={() => setShowAdd(false)}
            onSuccess={fetchVersions}
          />
        )}

        {editVersion && (
          <EditAppVersion
            version={editVersion}
            onClose={() => setEditVersion(null)}
            onSuccess={fetchVersions}
          />
        )}

        <DeleteConfirmModal
          isOpen={!!deleteItem}
          itemName="app version"
          itemTitle={deleteItem?.platform}
          onClose={() => setDeleteItem(null)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default AppVersion;