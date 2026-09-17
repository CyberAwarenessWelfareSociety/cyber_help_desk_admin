import modalStyles from "./Modal.module.css";
import { FaTimes } from "react-icons/fa";

export default function AddApiKey({ onClose }) {
  // You can use useState etc here for form fields as needed
  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal}>
        <button className={modalStyles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>
        <h2 className={modalStyles.modalTitle}>Add API Key</h2>
        <form className={modalStyles.form}>
          <label>
            Rule name
            <input type="text" placeholder="Enter rule name" />
          </label>
          <label>
            Status
            <select>
              <option>Candidate</option>
              <option>Final</option>
            </select>
          </label>
          <label>
            Bindings
            <input type="text" placeholder="Enter binding" />
          </label>
          <label>
            Failed Row (%)
            <input type="number" min="0" max="100" />
          </label>
          <div className={modalStyles.actions}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className={modalStyles.primaryBtn}>Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}
