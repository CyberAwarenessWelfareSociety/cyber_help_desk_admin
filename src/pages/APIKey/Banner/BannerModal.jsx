import React, { useState, useRef, useEffect } from 'react';
import styles from './BannerModal.module.css';
import toast from 'react-hot-toast';

const BannerModal = ({ isOpen, onClose, onSubmit, type = 'add', loading, existingImage }) => {
  const [image, setImage] = useState(null);
  const [displayOrder, setDisplayOrder] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Set initial display order on open if updating
      if (type === 'update' && existingImage?.display_order) {
        setDisplayOrder(existingImage.display_order);
      } else {
        setDisplayOrder('');
      }
      setImage(null); // Reset uploaded image
    }
  }, [isOpen, type, existingImage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setImage(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleClick = () => {
    inputRef.current.click();
  };

  const handleSubmit = () => {
    if (!image) {
      toast.error("Please select an image");
      return;
    }

    onSubmit({ image, display_order: parseInt(displayOrder) || null });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{type === 'add' ? 'Add Banner' : 'Update Banner'}</h2>

        <div
          className={styles.dropZone}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {image ? (
            <p>{image.name}</p>
          ) : existingImage?.link ? (
            <img src={existingImage.link} alt="Existing" className={styles.previewImage} />
          ) : (
            <p>Click or drag and drop an image here</p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.hiddenInput}
          />
        </div>

        {type === 'update' && (
          <input
            type='number'
            placeholder='Display Order'
            className={styles.displayOrder}
            min='1'
            max='100'
            required
            value={displayOrder}
            onChange={e => setDisplayOrder(e.target.value)}
          />
        )}

        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className={styles.uploadButton} onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <div className={styles.loader}></div>
            ) : (
              type === 'add' ? 'Upload' : 'Update'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerModal;