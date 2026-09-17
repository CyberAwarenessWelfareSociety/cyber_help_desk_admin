import React, { useState } from "react";
import AadharModal from "./BackgroundCheckModal";
import SimpleModal from "./SimpleModal";
import styles from "./BackgroundCheck.module.css";
import BackgroundCheckModal from "./BackgroundCheckModal";

const apis = [
  { id: 1, name: "Individual Background Check" },
  { id: 3, name: "EST DETAILS BY NAME" },
  { id: 4, name: "EST DETAILS BY CODE" },
  { id: 5, name: "UAN LATEST V1" },
  { id: 6, name: "UAN HISTORY V1" },
  { id: 7, name: "UAN LATEST V2" },
  { id: 8, name: "UAN HISTORY V2" },
  { id: 9, name: "UAN LATEST V3" },
  { id: 10, name: "UAN HISTORY V3" },
  { id: 12, name: "Company Crime check" },
  { id: 13, name: "Mobile to multiple and FB photo" },
];

const BackgroundCheck = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [modalText, setModalText] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSearch = (apiName) => {
    setModalText(apiName);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <h1>Background Check</h1>
      <div className={styles.grid}>
        {apis.map((api) => (
          <BackgroundCheckModal
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

export default BackgroundCheck;
