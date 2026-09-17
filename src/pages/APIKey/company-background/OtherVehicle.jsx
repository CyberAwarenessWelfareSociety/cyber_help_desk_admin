import React, { useState } from "react";
import SimpleModal from "./SimpleModal";
import styles from "./OtherVehicle.module.css";
import OtherVehicleModal from "./OtherVehicleModal";

const apis = [
  { id: 1, name: "MCA by CIN" },
  { id: 2, name: "MCA by CIN (Directors)" },
  { id: 3, name: "MCA by DIN" },
  { id: 4, name: "Udid DocReport" },
];

const MCAServices = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalApi, setModalApi] = useState(null);

  const handleSearch = (api) => {
    setModalApi(api);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <h1>MCA Services</h1>
      <div className={styles.grid}>
        {apis.map((api) => (
          <OtherVehicleModal
            key={api.id}
            api={api}
            isSelected={selectedId === api.id}
            onClick={() => setSelectedId(api.id)}
            onSearch={() => handleSearch(api)}
          />
        ))}
      </div>

      {showModal && (
        <SimpleModal
          apiName={modalApi.name}
          apiId={modalApi.id}
          onClose={() => {
            setShowModal(false);
            setModalApi(null);
          }}
        />
      )}
    </div>
  );
};

export default MCAServices;
