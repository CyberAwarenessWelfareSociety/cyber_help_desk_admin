import React, { useState } from "react";
import AadharModal from "./RationModal";
import SimpleModal from "./SimpleModal";
import styles from "./Ration.module.css";
import RationModal from "./RationModal";

const apis = [
  { id: 1, name: "Ration Basic" },
  { id: 2, name: "up Ration Full" },
  { id: 3, name: "Ration PDF" },
];

const Ration = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [modalText, setModalText] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSearch = (apiName) => {
    setModalText(apiName);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <h1>Ration Card</h1>
      <div className={styles.grid}>
        {apis.map((api) => (
          <RationModal
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

export default Ration;
