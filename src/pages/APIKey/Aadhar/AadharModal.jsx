

import React from "react";
import styles from "./Aadhar.module.css";
import { ROLES } from "@/constants/Role";

const AadharModal = ({ api, onClick, disabled }) => {
  const role = JSON.parse(localStorage.getItem("user")).client_type;
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.apiName}>API Name</span>
      </div>
      <p className={styles.apiTitle}>{api.name}</p>
      <div className={styles.cardFooter}>
        <button
          className={styles.accessBtn}
          onClick={onClick}
          disabled={disabled }
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default AadharModal;
