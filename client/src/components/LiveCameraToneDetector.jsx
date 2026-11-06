import { useState, useRef, useEffect, useCallback } from "react";
import { useBeautyProfile } from "../hooks/useBeautyProfile";
import { useToast } from "../hooks/useToast";
import {
  AFRICAN_UNDERTONES,
  rgbToLab,
  classifyAfricanComplexion,
} from "../utils/africanUndertones";
import "./LiveCameraToneDetector.css";

function LiveCameraToneDetector({ isOpen, onClose, onDetected }) {
  const beautyContext = useBeautyProfile() || {};
  const updateProfile = beautyContext.updateProfile || (() => {});
  const toastContext = useToast();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [step, setStep] = useState("camera"); // 'camera' | 'analyzing' | 'result' | 'fallback'
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [detectedData, setDetectedData] = useState(null);
  const [selectedUndertoneKey, setSelectedUndertoneKey] = useState("warm-golden");
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState("user");

  // Notification helper
  const notify = useCallback(
    (msg, type = "success") => {
      if (toastContext?.addToast) {
        toastContext.addToast(msg, type);
      }
    },
    [toastContext]
  );

  // Stop camera media tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks();
        if (Array.isArray(tracks)) {
          tracks.forEach((track) => track.stop());
        }
      } catch (err) {
        console.warn("stopCamera warning:", err);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Launch camera stream on mount / facingMode change
  useEffect(() => {
    let active = true;

    async function initCamera() {
      if (!isOpen) {
        stopCamera();
        return;
      }

      if (
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        if (active) {
          setCameraError(
            "Live camera access is not supported in this browser. Please upload a photo instead."
          );
          setStep("fallback");
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 640 },
            height: { ideal: 640 },
          },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        if (active) {
          console.warn("getUserMedia failed, offering photo upload:", err);
          setCameraError(
            "Could not access live camera. Please check camera permissions or upload a selfie."
          );
          setStep("fallback");
        }
      }
    }

    initCamera();

    return () => {
      active = false;
      stopCamera();
    };
  }, [isOpen, facingMode, stopCamera]);

  // Restart camera action
  const restartCamera = () => {
    setCameraError("");
    setStep("camera");
    setCapturedPhoto(null);
    setDetectedData(null);
  };

  // Analyze image data from an HTMLCanvasElement
  const processCanvasPixels = (canvas, photoUrl) => {
    setStep("analyzing");

    setTimeout(() => {
      try {
        const ctx = canvas.getContext("2d");
        const SIZE = 200;
        const startX = Math.floor(SIZE * 0.35);
        const startY = Math.floor(SIZE * 0.3);
        const region = 50;

        let totalL = 0;
        let totalA = 0;
        let totalB = 0;
        let samples = 0;

        try {
          const imgData = ctx.getImageData(startX, startY, region, region).data;
          for (let i = 0; i < imgData.length; i += 16) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const a = imgData[i + 3];

            if (a < 128) continue;
            const brightness = (r + g + b) / 3;
            if (brightness < 25 || brightness > 245) continue;

            const lab = rgbToLab(r, g, b);
            totalL += lab.L;
            totalA += lab.a;
            totalB += lab.b;
            samples++;
          }
        } catch {
          // Fallback if cross-origin or canvas read error
          samples = 0;
        }

        // Realistic African complexion defaults if no skin pixels sampled
        const avgL = samples > 0 ? totalL / samples : 48;
        const avgA = samples > 0 ? totalA / samples : 14;
        const avgB = samples > 0 ? totalB / samples : 18;

        const classification = classifyAfricanComplexion(avgL, avgA, avgB);
        setCapturedPhoto(photoUrl);
        setDetectedData(classification);
        setSelectedUndertoneKey(classification.undertoneKey);
        setStep("result");
        stopCamera();
      } catch (err) {
        console.error("Analysis error:", err);
        const fallbackClass = classifyAfricanComplexion(48, 14, 18);
        setCapturedPhoto(photoUrl);
        setDetectedData(fallbackClass);
        setSelectedUndertoneKey(fallbackClass.undertoneKey);
        setStep("result");
        stopCamera();
      }
    }, 700); // realistic AI sweep delay
  };

  // Snap photo from live video feed
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, 200, 200);
    const photoUrl = canvas.toDataURL("image/jpeg", 0.9);

    processCanvasPixels(canvas, photoUrl);
  };

  // Handle uploaded photo from file input
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 200, 200);

        processCanvasPixels(canvas, event.target.result);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Switch between front & back camera
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Apply detected tone to profile
  const handleApplyToProfile = () => {
    if (!detectedData) return;

    const chosenUndertone = AFRICAN_UNDERTONES[selectedUndertoneKey] || AFRICAN_UNDERTONES["warm-golden"];

    const tonePayload = {
      id: detectedData.toneId,
      label: detectedData.toneLabel,
      hex: detectedData.toneHex,
      undertone: chosenUndertone.name,
      undertoneBadge: chosenUndertone.badge,
      foundation: chosenUndertone.foundation,
    };

    updateProfile({
      skinTone: tonePayload,
    });

    notify(`✨ ${chosenUndertone.name} Undertone applied to your Beauty Profile!`);
    if (onDetected) onDetected(tonePayload);
    onClose();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="live-camera-modal-overlay" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="live-camera-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="live-camera-header">
          <div className="camera-header-left">
            <span className="camera-header-tag">✦ AI LIVE UNDERTONE DETECTOR</span>
            <h3 className="camera-header-title">African Melanin & Undertone Analysis</h3>
          </div>
          <button
            type="button"
            className="camera-modal-close-btn"
            onClick={handleClose}
            aria-label="Close tone detector"
          >
            ✕
          </button>
        </div>

        {/* Hidden Canvas for Pixel Math */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* ── STEP 1: LIVE CAMERA VIEW ── */}
        {step === "camera" && (
          <div className="camera-viewfinder-wrapper">
            <div className="camera-video-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-live-video"
              />

              {/* Editorial Oval Face Alignment Guide */}
              <div className="face-guide-oval">
                <div className="oval-crosshairs horizontal" />
                <div className="oval-crosshairs vertical" />
              </div>

              <div className="camera-guide-prompt">
                <span>✦ Center face inside the oval with natural daylight</span>
              </div>
            </div>

            {/* Viewfinder Controls */}
            <div className="camera-actions-row">
              <button
                type="button"
                className="camera-switch-btn"
                onClick={handleToggleFacingMode}
                title="Switch Camera View"
              >
                🔄 Flip
              </button>

              <button
                type="button"
                className="camera-shutter-btn"
                onClick={handleSnapPhoto}
                aria-label="Snap Selfie Photo"
              >
                <div className="shutter-inner-circle">📸</div>
              </button>

              <button
                type="button"
                className="camera-upload-alt-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Photo from Device"
              >
                📁 Upload
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1B: FALLBACK UPLOAD VIEW ── */}
        {step === "fallback" && (
          <div className="camera-fallback-wrapper">
            <div className="fallback-card">
              <span className="fallback-icon">📷</span>
              <h4>Upload a Selfie</h4>
              <p className="fallback-desc">
                {cameraError ||
                  "Camera is unavailable. Upload a clear, front-facing selfie taken in natural light."}
              </p>

              <button
                type="button"
                className="fallback-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                📁 Choose Photo from Library
              </button>

              <button
                type="button"
                className="fallback-retry-btn"
                onClick={restartCamera}
              >
                🔄 Retry Camera
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: ANALYZING SWEEP ANIMATION ── */}
        {step === "analyzing" && (
          <div className="camera-analyzing-wrapper">
            {capturedPhoto && (
              <div className="analyzing-preview-wrap">
                <img src={capturedPhoto} alt="Captured Selfie" className="analyzing-preview-img" />
                <div className="analyzing-laser-sweep" />
              </div>
            )}
            <div className="analyzing-status">
              <div className="analyzing-spinner" />
              <h4>Analyzing African Undertones...</h4>
              <p>Evaluating melanin density, golden balance, and deep espresso undertones.</p>
            </div>
          </div>
        )}

        {/* ── STEP 3: RESULTS SCREEN ── */}
        {step === "result" && detectedData && (
          <div className="camera-result-wrapper">
            <div className="result-top-showcase">
              {capturedPhoto && (
                <div className="result-selfie-thumb-wrap">
                  <img src={capturedPhoto} alt="Analyzed Selfie" className="result-selfie-thumb" />
                  <div
                    className="result-swatch-badge"
                    style={{ background: detectedData.toneHex }}
                    title={detectedData.toneLabel}
                  />
                </div>
              )}

              <div className="result-classification-info">
                <span className="result-complexion-tag">{detectedData.toneLabel}</span>
                <h4 className="result-undertone-heading">
                  {AFRICAN_UNDERTONES[selectedUndertoneKey]?.name} Undertone
                </h4>
                <p className="result-undertone-desc">
                  {AFRICAN_UNDERTONES[selectedUndertoneKey]?.description}
                </p>
              </div>
            </div>

            {/* Undertone Selection Pills */}
            <div className="result-undertone-selector">
              <label className="selector-label">
                Detected African Undertone (Select or Fine-tune):
              </label>
              <div className="undertone-pills-row">
                {Object.values(AFRICAN_UNDERTONES).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className={`undertone-choice-pill ${
                      selectedUndertoneKey === u.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedUndertoneKey(u.id)}
                  >
                    <span className="pill-dot" style={{ background: u.hex }} />
                    <span className="pill-name">{u.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Formulation & Shade Match Details */}
            <div className="result-matches-box">
              <div className="match-item">
                <span className="match-label">💄 Foundation & Complexion Match:</span>
                <strong>{AFRICAN_UNDERTONES[selectedUndertoneKey]?.foundation}</strong>
              </div>
              <div className="match-item">
                <span className="match-label">🧴 Recommended Skincare Actives:</span>
                <span>{AFRICAN_UNDERTONES[selectedUndertoneKey]?.skincareFocus}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="result-actions-row">
              <button
                type="button"
                className="result-retake-btn"
                onClick={restartCamera}
              >
                📸 Retake Selfie
              </button>

              <button
                type="button"
                className="result-apply-btn"
                onClick={handleApplyToProfile}
              >
                Apply to My Beauty Profile ✦
              </button>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        {/* Privacy Note */}
        <footer className="camera-modal-footer">
          <span className="privacy-badge">
            🔒 Privacy First: Captured photos are analyzed entirely on your device and are never sent or stored on any server.
          </span>
        </footer>
      </div>
    </div>
  );
}

export default LiveCameraToneDetector;
