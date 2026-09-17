import React, { useContext, useState } from "react";
import api from "../../Utils/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import styles from "./LogoutModal.module.css";
import { UserContext } from "../../Context/contextAPI";

const LogoutModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {logout} = useContext(UserContext);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const response = await api.post("/logout");
      console.log("response after logout : ", response);

      logout();
      // toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
         
      console.error(err.response?.data?.message || "Logout failed");
    } finally {
        logout();
      toast.success("Logged out successfully");
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>Confirm Logout</h3>
        <p className={styles.message}>Are you sure you want to log out?</p>

        <div className={styles.actions}>
          <button
            onClick={handleLogout}
            disabled={loading}
            className={`${styles.btn} ${styles.btnYes}`}
          >
            {loading ? "Logging out..." : "Yes"}
          </button>
          <button onClick={onClose} className={`${styles.btn} ${styles.btnNo}`}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
