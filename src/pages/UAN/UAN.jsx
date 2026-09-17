import React, { useState } from "react";
import AadharModal from "./UANModal";
import SimpleModal from "./SimpleModal";
import styles from "./UAN.module.css";
import DigoxCheckModal from "./UANModal";

const apis = [
  { id: 1, name: "UAN to Aadhaar" },
  { id: 2, name: "UAN LATEST V1" },
  { id: 3, name: "UAN HISTORY V1" },
  { id: 4, name: "UAN LATEST V2" },
  { id: 5, name: "UAN HISTORY V2" },
  { id: 6, name: "UAN LATEST V3" },
  { id: 7, name: "UAN HISTORY V3" },
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
      <h1>UAN Check</h1>
      <div className={styles.grid}>
        {apis.map((api) => (
          <DigoxCheckModal
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
