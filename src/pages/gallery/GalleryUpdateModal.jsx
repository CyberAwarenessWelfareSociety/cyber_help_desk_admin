// import React, { useState, useRef, useEffect } from 'react';
// import styles from './BannerModal.module.css';

// const BannerModal = ({ isOpen, onClose, onSubmit, type = 'add', loading }) => {
//   const [image, setImage] = useState(null);
//   const inputRef = useRef(null);

//   useEffect(() => {
//     if (!isOpen) {
//       setImage(null);
//     }
//   }, [isOpen]);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) setImage(file);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     const file = e.dataTransfer.files[0];
//     if (file) setImage(file);
//   };

//   const handleDragOver = (e) => e.preventDefault();

//   const handleClick = () => {
//     inputRef.current.click();
//   };

//   const handleAddBanner = async (image) => {
//     setLoading(true);

//     try {

//       const formData = new FormData();
//       formData.append('files', image);

//       const uploadRes = await axios.post(
//         'https://qiktrack.com/bucket/upload-multiple/cybercrime',
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           }
//         }
//       );
//       console.log("uploaded on bucket response : ", uploadRes);

//       const imageUrl = uploadRes.data?.files[0]?.url || uploadRes.data?.[0]?.url;
//       console.log("response after uploaded image : ", imageUrl);

//       const payload = {
//         link: imageUrl,
//         display_order: banners.length + 1 || 1,
//       }
//       const saveRes = await api.post('/create-Banner', payload);
//       console.log("Response after saving banner to DB : ", saveRes);

//       toast.success(saveRes.data?.data?.message || "Banner created ");
//       getBanner();
//       setIsModalOpen(false);
//     } catch (err) {
//       console.error("Upload error:", err);
//       toast.error(err.message || "Upload failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className={styles.overlay}>
//       <div className={styles.modal}>
//         <h2>{type === 'add' ? 'Add Banner' : 'Update Banner'}</h2>

//         <div
//           className={styles.dropZone}
//           onClick={handleClick}
//           onDrop={handleDrop}
//           onDragOver={handleDragOver}
//         >
//           {image ? (
//             <p>{image.name}</p>
//           ) : (
//             <p>Click or drag and drop an image here</p>
//           )}
//           <input
//             ref={inputRef}
//             type="file"
//             accept="image/*"
//             onChange={handleImageChange}
//             className={styles.hiddenInput}
//           />
//         </div>

//         <div className={styles.buttonGroup}>
//           <button className={styles.cancelButton} onClick={onClose} disabled={loading}>
//             Cancel
//           </button>

//           <button 
//             className={styles.uploadButton} 
//             onClick={() => onSubmit(image)} 
//             disabled={loading}
//           >
//             {loading ? (
//               <div className={styles.loader}></div>
//             ) : (
//               type === 'add' ? 'Upload' : 'Update'
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BannerModal;


import React, { useState, useRef, useEffect } from 'react';
import styles from './galleryUpdateModal.module.css';

const BannerUpdateModal = ({ isOpen, onClose, onSubmit, type = 'add', loading, existingImage }) => {
  const [image, setImage] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setImage(null);
    }
  }, [isOpen]);

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
          <h1>Hello</h1>
          <input
            type='number'
            placeholder='Display Order'
            className={styles.displayOrder}
            min='1'
            max='100'
            required
            disabled={type === 'add'}
            value={existingImage?.display_order || ''}
            onChange={e => {
              const newOrder = parseInt(e.target.value);
              if (!isNaN(newOrder)) {
                existingImage.display_order = newOrder;
              }
            }}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className={styles.uploadButton} onClick={() => onSubmit(image)} disabled={loading}>
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

export default BannerUpdateModal;
