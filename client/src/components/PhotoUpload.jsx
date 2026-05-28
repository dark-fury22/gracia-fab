import { useRef, useState } from "react";
import "./PhotoUpload.css";

function PhotoUpload({ onPhotoSelected, label = "Upload Photo" }) {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    const url = URL.createObjectURL(file);
    onPhotoSelected(url, file);
    setShowOptions(false);
    // Reset inputs so same file can be selected again
    e.target.value = "";
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        className="photo-upload-trigger"
        onClick={() => setShowOptions(true)}
      >
        📸 {label}
      </button>

      {/* Bottom sheet options */}
      {showOptions && (
        <div
          className="photo-options-overlay"
          onClick={() => setShowOptions(false)}
        >
          <div
            className="photo-options-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="photo-options-handle" />
            <h3 className="photo-options-title">Add Photo</h3>

            {/* Take a new photo */}
            <button
              className="photo-option-btn"
              onClick={() => cameraInputRef.current?.click()}
            >
              <span className="photo-option-icon">📷</span>
              <div className="photo-option-text">
                <strong>Take Photo</strong>
                <p>Use your camera right now</p>
              </div>
              <span className="photo-option-arrow">›</span>
            </button>

            {/* Choose from gallery */}
            <button
              className="photo-option-btn"
              onClick={() => galleryInputRef.current?.click()}
            >
              <span className="photo-option-icon">🖼️</span>
              <div className="photo-option-text">
                <strong>Choose from Library</strong>
                <p>Pick a photo you already have</p>
              </div>
              <span className="photo-option-arrow">›</span>
            </button>

            <button
              className="photo-option-cancel"
              onClick={() => setShowOptions(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hidden inputs */}

      {/* Camera input — opens camera directly */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFile}
      />

      {/* Gallery input — opens photo library */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </>
  );
}

export default PhotoUpload;
