import Cropper from "react-easy-crop";
import { useState, useCallback } from "react";

export default function ImageCropper({ file, onCropDone }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: 300 }}>
      <Cropper
        image={URL.createObjectURL(file)}
        crop={crop}
        zoom={zoom}
        aspect={16 / 9} // 👈 IMPORTANT
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
      />

      <button onClick={() => onCropDone(croppedAreaPixels)}>
        Crop Image
      </button>
    </div>
  );
}