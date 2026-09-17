import React, { useState, useRef, useEffect } from 'react';
import styles from './GalleryModal.module.css';
import toast from 'react-hot-toast';

const GalleryModal = ({ isOpen, onClose, onSubmit, type = 'add', loading, existingItem }) => {
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [header, setHeader] = useState('');
  const [description, setDescription] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [updatedAt, setUpdatedAt] = useState(''); // New state for updatedAt
  const inputRef = useRef(null);

  console.log('createdAt:', createdAt); // For debugging
  console.log('updatedAt:', updatedAt); // For debugging

  useEffect(() => {
    if (isOpen && type === 'update' && existingItem) {
      setHeader(existingItem.header || '');
      setDescription(existingItem.description || '');
      setExistingImages(existingItem.photo || []);
      setNewImages([]);
      setCreatedAt(existingItem.createdAt ? new Date(existingItem.createdAt).toISOString().split('T')[0] : '');
      // Set updatedAt to current date for update mode, but it won't be displayed
      setUpdatedAt(new Date().toISOString().split('T')[0]);
    } else {
      setHeader('');
      setDescription('');
      setNewImages([]);
      setExistingImages([]);
      setCreatedAt('');
      setUpdatedAt(''); // Reset updatedAt for add mode
    }
  }, [isOpen, type, existingItem]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setNewImages((prev) => [...prev, ...files]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length) {
      setNewImages((prev) => [...prev, ...files]);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemoveImage = (index, isNewImage) => {
    if (isNewImage) {
      setNewImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    if (!header) {
      toast.error('Please provide a header');
      return;
    }
    if (type === 'add' && newImages.length === 0 && existingImages.length === 0) {
      toast.error('Please select at least one image');
      return;
    }
    if (!createdAt) {
      toast.error('Please select a creation date');
      return;
    }
    // Ensure createdAt is in YYYY-MM-DD format
    const formattedCreatedAt = createdAt.split('T')[0];
    // Prepare payload
    const payload = {
      images: newImages,
      header,
      description,
      existingImages,
      createdAt: formattedCreatedAt,
    };
    // Include updatedAt only for update mode
    if (type === 'update') {
      payload.updatedAt = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD
    }
    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{type === 'add' ? 'Add Gallery Item' : 'Update Gallery Item'}</h2>

        <input
          type="text"
          placeholder="Header"
          value={header}
          onChange={(e) => setHeader(e.target.value)}
          className={styles.input}
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
        />

        <input
          type="date"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
          className={styles.input}
          max={new Date().toISOString().split('T')[0]}
          required
        />

        <div
          className={styles.galleryDropZone}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          >
          {newImages.length === 0 && existingImages.length === 0 ? (
            <p>Click or drag and drop images here</p>
          ) : (
            <div className={styles.imagePreviewContainer}>
              {existingImages.map((url, index) => (
                <div key={`existing-${index}`} className={styles.imageWrapper}>
                  <img src={url} alt="Existing" className={styles.previewImage} />
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveImage(index, false)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {newImages.map((file, index) => (
                <div key={`new-${index}`} className={styles.imageWrapper}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className={styles.previewImage}
                  />
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveImage(index, true)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className={styles.hiddenInput}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className={styles.uploadButton} onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <div className={styles.loader}></div>
            ) : type === 'add' ? 'Add' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;