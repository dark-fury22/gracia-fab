import { useState, useRef, useCallback, useEffect } from "react";
import "./VirtualTryOn.css";
import PhotoUpload from "./PhotoUpload";

const LIPSTICK_SHADES = [
  { id: "nude", name: "Nude Beige", hex: "#C4956A", rgb: [196, 149, 106] },
  { id: "pink", name: "Bubblegum Pink", hex: "#E8849A", rgb: [232, 132, 154] },
  { id: "red", name: "Classic Red", hex: "#C0392B", rgb: [192, 57, 43] },
  { id: "berry", name: "Berry Punch", hex: "#8E3A59", rgb: [142, 58, 89] },
  { id: "coral", name: "Coral Glow", hex: "#FF6B6B", rgb: [255, 107, 107] },
  { id: "plum", name: "Deep Plum", hex: "#6B2D5E", rgb: [107, 45, 94] },
  { id: "mauve", name: "Dusty Mauve", hex: "#AD7F8A", rgb: [173, 127, 138] },
  { id: "brown", name: "Rich Brown", hex: "#7B3F1E", rgb: [123, 63, 30] },
];

const WIG_STYLES = [
  {
    id: "body-wave",
    name: "Body Wave",
    description: "Long flowing waves",
    image:
      "https://images.unsplash.com/photo-1522337913-f31d2e5ecca6?w=300&h=400&fit=crop",
  },
  {
    id: "bob",
    name: "Sleek Bob",
    description: "Clean jaw-length bob",
    image:
      "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=300&h=400&fit=crop",
  },
  {
    id: "afro",
    name: "Natural Afro",
    description: "Bold kinky afro",
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=400&fit=crop",
  },
  {
    id: "curly",
    name: "Deep Curls",
    description: "Luscious deep curls",
    image:
      "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=300&h=400&fit=crop",
  },
];

// ── Lipstick Painter Component ────────────────────────────
function LipstickTryOn() {
  const canvasRef = useRef(null);
  const baseImageRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [shade, setShade] = useState(LIPSTICK_SHADES[2]); // Red default
  const [opacity, setOpacity] = useState(0.65);
  const [brushSize, setBrushSize] = useState(12);
  const [painting, setPainting] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const fileRef = useRef(null);

  // Load image onto canvas
  const loadImage = useCallback((url) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;

    img.onload = () => {
      // Fit image into canvas
      const maxW = Math.min(img.width, 500);
      const maxH = Math.min(img.height, 600);
      const scale = Math.min(maxW / img.width, maxH / img.height);

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      baseImageRef.current = url;
      setHasStrokes(false);
    };
  }, []);

  // Paint a stroke on the canvas
  const paint = useCallback(
    (e) => {
      if (!painting || !photo) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const clientX = e.touches?.[0]?.clientX ?? e.clientX;
      const clientY = e.touches?.[0]?.clientY ?? e.clientY;

      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      const [r, g, b] = shade.rgb;

      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = opacity * 0.15;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
      ctx.fill();

      // Reset
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      setHasStrokes(true);
    },
    [painting, photo, shade, opacity, brushSize],
  );

  // Undo — redraw base image
  const handleUndo = () => {
    if (!baseImageRef.current) return;
    loadImage(baseImageRef.current);
  };

  // Download result
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "gracia-fab-tryon.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="tryon-section">
      <div className="tryon-instructions">
        <h3>💄 Lipstick Try-On</h3>
        <p>
          Upload your selfie, pick a shade, then{" "}
          <strong>paint on your lips</strong> by tapping or dragging.
        </p>
      </div>

      {!photo ? (
        <div className="tryon-upload">
          <span>💄</span>
          <p>Upload a selfie to try on lipstick shades</p>
          <PhotoUpload
            label="Add Your Photo"
            onPhotoSelected={(url) => {
              setPhoto(url);
              setTimeout(() => loadImage(url), 100);
            }}
          />
        </div>
      ) : (
        <div className="tryon-workspace">
          {/* Controls */}
          <div className="tryon-controls">
            {/* Shade picker */}
            <div className="tryon-control-group">
              <label>Shade</label>
              <div className="shade-grid">
                {LIPSTICK_SHADES.map((s) => (
                  <button
                    key={s.id}
                    className={`shade-btn ${s.id === shade.id ? "active" : ""}`}
                    style={{ background: s.hex }}
                    onClick={() => setShade(s)}
                    title={s.name}
                  />
                ))}
              </div>
              <span className="shade-name">{shade.name}</span>
            </div>

            {/* Opacity */}
            <div className="tryon-control-group">
              <label>Intensity: {Math.round(opacity * 100)}%</label>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="tryon-range"
              />
            </div>

            {/* Brush size */}
            <div className="tryon-control-group">
              <label>Brush: {brushSize}px</label>
              <input
                type="range"
                min="6"
                max="28"
                step="2"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="tryon-range"
              />
            </div>

            {/* Actions */}
            <div className="tryon-actions">
              {hasStrokes && (
                <button className="tryon-btn-undo" onClick={handleUndo}>
                  ↩ Undo All
                </button>
              )}
              <button
                className="tryon-btn-new"
                onClick={() => {
                  setPhoto(null);
                  setHasStrokes(false);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                📸 New Photo
              </button>
              <button className="tryon-btn-download" onClick={handleDownload}>
                ⬇ Save
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="tryon-canvas-wrap">
            <canvas
              ref={canvasRef}
              className="tryon-canvas"
              onMouseDown={() => setPainting(true)}
              onMouseUp={() => setPainting(false)}
              onMouseLeave={() => setPainting(false)}
              onMouseMove={paint}
              onTouchStart={(e) => {
                e.preventDefault();
                setPainting(true);
              }}
              onTouchEnd={() => setPainting(false)}
              onTouchMove={(e) => {
                e.preventDefault();
                paint(e);
              }}
            />
            <p className="tryon-canvas-hint">
              {painting
                ? "🎨 Painting..."
                : "👆 Tap and drag to apply lipstick"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Wig Preview Component ─────────────────────────────────
function WigTryOn() {
  const [photo, setPhoto] = useState(null);
  const [wig, setWig] = useState(null);
  const [wigY, setWigY] = useState(0);
  const [wigSize, setWigSize] = useState(100);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const containerRef = useRef(null);
  const fileRef = useRef(null);

  const handleDragStart = (e) => {
    e.preventDefault();
    setDragging(true);
    const clientY = e.touches?.[0]?.clientY ?? e.clientY;
    setDragStart(clientY - wigY);
  };

  const handleDragMove = useCallback(
    (e) => {
      if (!dragging) return;
      const clientY = e.touches?.[0]?.clientY ?? e.clientY;
      setWigY(clientY - dragStart);
    },
    [dragging, dragStart],
  );

  const handleDragEnd = () => setDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleDragMove, { passive: false });
    window.addEventListener("touchend", handleDragEnd);
    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [handleDragMove]);

  return (
    <div className="tryon-section">
      <div className="tryon-instructions">
        <h3>👑 Wig Try-On</h3>
        <p>
          Upload your photo, pick a wig style, then <strong>drag it</strong> to
          position it on your head.
        </p>
      </div>

      {!photo ? (
        <div className="tryon-upload">
          <span>👑</span>
          <p>Upload a selfie to try on wig styles</p>
          <PhotoUpload
            label="Add Your Photo"
            onPhotoSelected={(url) => {
              setPhoto(url);
              setWigY(-60);
            }}
          />
        </div>
      ) : (
        <div className="tryon-workspace">
          {/* Wig selector */}
          <div className="tryon-controls">
            <div className="tryon-control-group">
              <label>Choose Wig Style</label>
              <div className="wig-grid">
                {WIG_STYLES.map((w) => (
                  <button
                    key={w.id}
                    className={`wig-btn ${wig?.id === w.id ? "active" : ""}`}
                    onClick={() => setWig(w)}
                  >
                    <img src={w.image} alt={w.name} />
                    <span>{w.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {wig && (
              <>
                <div className="tryon-control-group">
                  <label>Size: {wigSize}%</label>
                  <input
                    type="range"
                    min="60"
                    max="160"
                    step="5"
                    value={wigSize}
                    onChange={(e) => setWigSize(parseInt(e.target.value))}
                    className="tryon-range"
                  />
                </div>
                <p className="wig-drag-hint">
                  Drag the wig image to position it on your head ↕
                </p>
              </>
            )}

            <div className="tryon-actions">
              <button
                className="tryon-btn-new"
                onClick={() => {
                  setPhoto(null);
                  setWig(null);
                  setWigY(0);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                📸 New Photo
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="wig-preview-wrap" ref={containerRef}>
            <img src={photo} alt="Your photo" className="wig-base-photo" />
            {wig && (
              <img
                src={wig.image}
                alt={wig.name}
                className="wig-overlay"
                style={{
                  top: `calc(0px + ${wigY}px)`,
                  width: `${wigSize}%`,
                  cursor: dragging ? "grabbing" : "grab",
                }}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                draggable={false}
              />
            )}
            {!wig && (
              <div className="wig-choose-hint">
                ← Pick a wig style to preview
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Virtual Try-On Page ──────────────────────────────
function VirtualTryOn() {
  const [activeTab, setActiveTab] = useState("lipstick");

  return (
    <div className="virtual-tryon">
      <div className="tryon-header">
        <h1>💄 Virtual Try-On</h1>
        <p>See how products look on YOU before you buy.</p>
      </div>

      {/* Tabs */}
      <div className="tryon-tabs">
        <button
          className={`tryon-tab ${activeTab === "lipstick" ? "active" : ""}`}
          onClick={() => setActiveTab("lipstick")}
        >
          💄 Lipstick
        </button>
        <button
          className={`tryon-tab ${activeTab === "wig" ? "active" : ""}`}
          onClick={() => setActiveTab("wig")}
        >
          👑 Wigs
        </button>
      </div>

      {activeTab === "lipstick" && <LipstickTryOn />}
      {activeTab === "wig" && <WigTryOn />}
    </div>
  );
}

export default VirtualTryOn;
