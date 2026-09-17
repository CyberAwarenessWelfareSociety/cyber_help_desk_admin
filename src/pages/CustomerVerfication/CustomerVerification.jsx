import React, { useState } from "react";
import styles from "./Categories.module.css";
import AccessModal from "./AccessModal";
import SearchModal from "./SearchModal";
import { FaSearch } from "react-icons/fa";

const apis = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  name: "PAN to User Name Details",
  price: "₹100/Api",
}));

const CustomerVerification = () => {
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  return (
    <div className={styles.container}>
      {/* <h2 className={styles.title}>Categories</h2> */}
      <h3 className={styles.subtitle}>Customer Verification</h3>
      <div className={styles.grid}>
        {apis.map((api) => (
          <div className={styles.card} key={api.id}>
            <div className={styles.cardHeader}>
              <span className={styles.apiName}>API Name</span>
              <FaSearch
                className={styles.searchIcon}
                onClick={() => setShowSearchModal(true)}
              />
            </div>

            <p className={styles.apiTitle}>{api.name}</p>

            <div className={styles.cardFooter}>
              <span className={styles.price}>{api.price}</span>
              <button
                className={styles.accessBtn}
                onClick={() => setShowAccessModal(true)}
              >
                Access list
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAccessModal && (
        <AccessModal onClose={() => setShowAccessModal(false)} />
      )}
      {showSearchModal && (
        <SearchModal onClose={() => setShowSearchModal(false)} />
      )}
    </div>
  );
};

export default CustomerVerification;
