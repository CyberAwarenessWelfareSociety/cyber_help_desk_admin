import React, { useState, useRef, useEffect } from 'react';
import styles from './BannerModal.module.css';
import toast from 'react-hot-toast';

const BannerModal = ({ isOpen, onClose, onSubmit, type = 'add', loading, existingImage }) => {
  const [image, setImage] = useState(null);
  const [displayOrder, setDisplayOrder] = useState('');
  const [placement, setPlacement] = useState('CYBER_HELP_DESK');
  const [targetUrl, setTargetUrl] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Set initial display order on open if updating
      if (type === 'update' && existingImage?.display_order) {
        setDisplayOrder(existingImage.display_order);
      } else {
        setDisplayOrder('');
      }
      setPlacement(existingImage?.placement || 'CYBER_HELP_DESK');
      setTargetUrl(existingImage?.target_url || '');
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
    if (type === 'add' && !image) {
      toast.error("Please select an image");
      return;
    }
    if (targetUrl.trim() && !/^https?:\/\/\S+$/i.test(targetUrl.trim())) {
      toast.error("Redirect URL must start with http:// or https://");
      return;
    }

    onSubmit({
      image,
      display_order: parseInt(displayOrder) || null,
      placement,
      target_url: targetUrl.trim() || null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{type === 'add' ? 'Upload Advertisement' : 'Update Advertisement'}</h2>

        <label className={styles.fieldLabel} htmlFor="advertisement-placement">
          Show advertisement in
        </label>
        <select
          id="advertisement-placement"
          className={styles.selectInput}
          value={placement}
          onChange={(event) => setPlacement(event.target.value)}
        >
          <option value="CYBER_HELP_DESK">Cyber Help Desk Team</option>
          <option value="DISTRICT_SAFETY_FORCE">District Safety Force</option>
          {existingImage?.placement === 'GENERAL' && (
            <option value="GENERAL">General banner (legacy)</option>
          )}
        </select>

        <label className={styles.fieldLabel} htmlFor="advertisement-target-url">
          Redirect URL <span className={styles.optionalText}>(optional)</span>
        </label>
        <input
          id="advertisement-target-url"
          type="url"
          className={styles.selectInput}
          value={targetUrl}
          placeholder="https://example.com"
          onChange={(event) => setTargetUrl(event.target.value)}
        />

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
              type === 'add' ? 'Upload Advertisement' : 'Update'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerModal;
