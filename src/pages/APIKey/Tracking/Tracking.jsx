import React, { useState } from "react";
import VehicleModal from "./TrackingModal";
import SimpleModal from "./SimpleModal";
import styles from "./Tracking.module.css";

const vehicleApis = [
  { id: 1, name: "RC by Vehicle Number", field: "vehiclenumber", placeholder: "Enter Vehicle Number" },
  { id: 2, name: "RC by Chassis Number", field: "chasisnumber", placeholder: "Enter Chassis Number" },
  { id: 3, name: "RC by Engine Number", field: "enginenumber", placeholder: "Enter Engine Number" },
  { id: 4, name: "Fastag Tracking", field: "vehiclenumber", placeholder: "Enter Vehicle Number" },
  { id: 5, name: "DL Basic Details", fields: [
    { name: "dlnumber", placeholder: "Enter DL Number" },
    { name: "dob", placeholder: "Enter DOB (YYYY-MM-DD)", type: "date" }
  ]},
  { id: 6, name: "Vehicle to Number", field: "vehicleNumber", placeholder: "Enter Vehicle Number" },
  { id: 7, name: "Vehicle to Number Premium", field: "vehicleNumber", placeholder: "Enter Vehicle Number" },
  { id: 8, name: "rcAdvanced_d1", field: "rcAdvanced_d1", placeholder: "rcAdvanced d1" },
];

const Tracking = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [modalText, setModalText] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSearch = (apiName) => {
    setModalText(apiName);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <h1>Vehicle Information</h1>
      <div className={styles.grid}>
        {vehicleApis.map((api) => (
          <VehicleModal
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

export default Tracking;