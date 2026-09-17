import modalStyles from "../APIKey/Modal.module.css";
import { FaTimes } from "react-icons/fa";
import { useState } from "react";
import api from "../../Utils/api";
import toast from "react-hot-toast";

export default function UpdateOverRidePrice({ item, onClose, onSave }) {



  const [price, setPrice] = useState(item.override_price || "");
  const [loading, setLoading] = useState(false);

  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Validate price input to ensure it's a valid decimal number
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPrice(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Make the API call with just the price
      const response = await api.put(
        `/update-override_price/${item.id}`,
        { override_price: price }
      );

      toast.success("Pricing updated successfully");
      onSave && onSave(response.data);
    } catch (error) {
      console.error("Error updating pricing:", error);
      toast.error(error.response?.data?.message || "Failed to update pricing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal} style={{ maxWidth: "400px" }}>
        <button className={modalStyles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>
        <h2 className={modalStyles.modalTitle}>Edit OverRide Price</h2>
        
        <div className={modalStyles.simpleInfo}>
          <div>Name: {item.Client?.name || 'N/A'}</div>
          {/* <div>Client Type: {item.Client?.client_type || 'N/A'}</div> */}
          <div>API Name: {item.api_name}</div>
        </div>

        <form className={modalStyles.form} onSubmit={handleSubmit}>
          <label>
            Price 
            <input
              type="text"
              value={price}
              onChange={handlePriceChange}
              required
              placeholder="e.g. 4.50"
              className={modalStyles.priceInput}
            />
          </label>

          <div className={modalStyles.actions}>
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={modalStyles.primaryBtn}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}