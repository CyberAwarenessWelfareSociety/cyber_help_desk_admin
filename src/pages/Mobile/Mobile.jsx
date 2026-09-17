import React, { useState } from "react";
import AadharModal from "./MobileModal";
import SimpleModal from "./SimpleModal";
import styles from "./Mobile.module.css";
import MobileModal from "./MobileModal";

const apis = [
  { id: 1, name: "MOBILE TO GST" },
  { id: 2, name: "UAN" },
  { id: 3, name: "PAN" },
  { id: 4, name: "SOCIAL ACCOUNT" },
  { id: 5, name: "VPA BASIC" },
  { id: 6, name: "BANK & BRANCH" },
  { id: 7, name: "ACCOUNT" },
  { id: 8, name: "LPG" },
];

const Mobile = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [modalText, setModalText] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSearch = (apiName) => {
    setModalText(apiName);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <h1>Mobile</h1>
      <div className={styles.grid}>
        {apis.map((api) => (
          <MobileModal
            key={api.id}
            api={api}
            isSelected={selectedId === api.id}
            onClick={() => setSelectedId(api.id)}
            onSearch={() => handleSearch(api.name)}
          />
        ))}
      </div>

      {showModal && (
        <SimpleModal text={modalText} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Mobile;
