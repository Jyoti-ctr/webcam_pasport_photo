
import { useEffect, useRef, useState } from "react";

function Webcam() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [message, setMessage] = useState("Camera not started");

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setMessage("Camera is running");
    } catch (error) {
      setMessage(
        error.name === "NotAllowedError"
          ? "Please allow camera permission."
          : "Unable to access the camera."
      );
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setMessage("Camera stopped");
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  return (
    <div>
      <h2>Exam Webcam</h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width="480"
        style={{
          maxWidth: "100%",
          border: "2px solid #444",
          borderRadius: "10px",
        }}
      />

      <p>{message}</p>

      <button onClick={startCamera}>
        Start Camera
      </button>

      <button onClick={stopCamera}>
        Stop Camera
      </button>
    </div>
  );
}

export default Webcam;
