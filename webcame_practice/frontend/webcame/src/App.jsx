import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [photo, setPhoto] = useState(null);
  const [fileName, setFileName] = useState("");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [background, setBackground] = useState("#ffffff");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const photoUrlRef = useRef(null);

  function handlePhotoUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (photoUrlRef.current) {
      URL.revokeObjectURL(photoUrlRef.current);
    }

    const imageURL = URL.createObjectURL(file);

    photoUrlRef.current = imageURL;
    imageRef.current = null;

    setPhoto(imageURL);
    setFileName(file.name);
    resetAdjustments();
  }

  function resetAdjustments() {
    setZoom(1);
    setRotation(0);
    setBackground("#ffffff");
    setBrightness(100);
    setContrast(100);
  }

  function removePhoto() {
    if (photoUrlRef.current) {
      URL.revokeObjectURL(photoUrlRef.current);
    }

    photoUrlRef.current = null;
    imageRef.current = null;

    setPhoto(null);
    setFileName("");
  }

  // Load the selected image into JavaScript
  useEffect(() => {
    if (!photo) {
      imageRef.current = null;
      return;
    }

    const image = new Image();

    image.onload = () => {
      imageRef.current = image;
      drawPhoto();
    };

    image.onerror = () => {
      alert("Unable to load this image.");
    };

    image.src = photo;

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [photo]);

  // Draw the edited photo whenever an editing setting changes
  useEffect(() => {
    drawPhoto();
  }, [photo, zoom, rotation, background, brightness, contrast]);

  function drawPhoto() {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Paint the selected background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    if (!image || !image.complete || !image.naturalWidth) {
      return;
    }

    // Center the image and apply editing settings
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    // Scale the image to fill the passport-shaped canvas

    const isSideways = Math.abs(rotation % 180) === 90;

    // Account for the canvas dimensions changing when the photo rotates
    const availableWidth = isSideways ? height : width;
    const availableHeight = isSideways ? width : height;

    const scale =
      Math.max(
        availableWidth / image.naturalWidth,
        availableHeight / image.naturalHeight,
      ) * zoom;

    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;

    ctx.drawImage(
      image,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight,
    );

    ctx.restore();
    ctx.filter = "none";
  }

  function rotateLeft() {
    setRotation((current) => current - 90);
  }

  function rotateRight() {
    setRotation((current) => current + 90);
  }

  function downloadPhoto(format) {
    const canvas = canvasRef.current;

    if (!photo || !canvas) {
      alert("Please upload a photo first.");
      return;
    }

    const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
    const extension = format === "jpg" ? "jpg" : "png";

    // JPEG does not support transparency, so use a white background.
    const downloadCanvas = document.createElement("canvas");
    downloadCanvas.width = canvas.width;
    downloadCanvas.height = canvas.height;

    const ctx = downloadCanvas.getContext("2d");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    const imageURL = downloadCanvas.toDataURL(mimeType, 0.95);

    const link = document.createElement("a");
    link.href = imageURL;
    link.download = `passport-photo.${extension}`;
    link.click();
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Passport Photo Generator</h1>
        <p>Upload, edit and prepare your photo.</p>
      </header>

      <main className="editor-layout">
        <section className="panel">
          <h2>1. Upload Photo</h2>

          <label htmlFor="photo-upload" className="primary-button">
            Choose Photo
          </label>

          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
          />

          {fileName && (
            <div className="file-info">
              <p>{fileName}</p>
              <button className="danger-button" onClick={removePhoto}>
                Remove Photo
              </button>
            </div>
          )}

          <hr />

          <h2>2. Edit Photo</h2>

          <label className="control-label">Zoom: {zoom.toFixed(1)}x</label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />

          <div className="button-row">
            <button onClick={rotateLeft}>Rotate Left</button>
            <button onClick={rotateRight}>Rotate Right</button>
          </div>

          <label className="control-label">Background Color</label>
          <div className="color-options">
            {[
              { name: "White", value: "#ffffff" },
              { name: "Light Blue", value: "#dceeff" },
              { name: "Light Gray", value: "#eeeeee" },
            ].map((color) => (
              <button
                key={color.value}
                className={
                  background === color.value
                    ? "color-button selected"
                    : "color-button"
                }
                style={{ backgroundColor: color.value }}
                onClick={() => setBackground(color.value)}
                aria-label={color.name}
                title={color.name}
              />
            ))}
          </div>

          <label className="control-label">Brightness: {brightness}%</label>
          <input
            type="range"
            min="50"
            max="150"
            value={brightness}
            onChange={(event) => setBrightness(Number(event.target.value))}
          />

          <label className="control-label">Contrast: {contrast}%</label>
          <input
            type="range"
            min="50"
            max="150"
            value={contrast}
            onChange={(event) => setContrast(Number(event.target.value))}
          />

          <button className="secondary-button" onClick={resetAdjustments}>
            Reset Adjustments
          </button>
        </section>

        <section className="panel preview-panel">
          <h2>3. Live Preview</h2>
          <p className="hint">Portrait preview · 3:4 aspect ratio</p>

          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              width={600}
              height={800}
              aria-label="Edited passport photo preview"
            />
          </div>

          <div className="download-buttons">
            <button
              className="download-button"
              onClick={() => downloadPhoto("jpg")}
              disabled={!photo}
            >
              Download JPG
            </button>

            <button
              className="download-button"
              onClick={() => downloadPhoto("png")}
              disabled={!photo}
            >
              Download PNG
            </button>
          </div>

          {!photo && (
            <p className="empty-message">Upload a photo to begin editing.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
