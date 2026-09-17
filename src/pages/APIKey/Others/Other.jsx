import React, { useState } from "react";
import AadharModal from "./OtherModal";
import SimpleModal from "./SimpleModal";
import styles from "./Other.module.css";
import OtherModal from "./OtherModal";

const apis = [
  { id: 1, name: "Voter verification" },
  { id: 2, name: "Ayushman Card" },
  // { id: 3, name: "UAN to Aadhaar" },
  { id: 4, name: "Prefill" },
];

const Other = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [modalText, setModalText] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSearch = (apiName) => {
    setModalText(apiName);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <h1>Others</h1>
      <div className={styles.grid}>
        {apis.map((api) => (
          <OtherModal
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

export default Other;
