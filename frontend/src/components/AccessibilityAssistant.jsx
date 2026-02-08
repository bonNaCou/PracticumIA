import { useState, useRef } from "react";
import "./AccessibilityAssistant.css";
import {
  FaUniversalAccess,
  FaTimes,
  FaSearchPlus,
  FaSearchMinus,
  FaFont,
  FaAdjust,
  FaEye,
  FaVolumeUp,
  FaStop
} from "react-icons/fa";

export default function AccessibilityAssistant() {
  const [open, setOpen] = useState(false);

  // 🔊 Estado lectura
  const [reading, setReading] = useState(false);
  const utteranceRef = useRef(null);

  // ===============================
  // ZOOM
  // ===============================
  const zoomIn = () => {
    document.body.style.zoom = `${
      (parseFloat(document.body.style.zoom) || 1) + 0.1
    }`;
  };

  const zoomOut = () => {
    const newZoom = (parseFloat(document.body.style.zoom) || 1) - 0.1;
    document.body.style.zoom = `${Math.max(newZoom, 0.5)}`;
  };

  // ===============================
  // FONT SIZE
  // ===============================
  const increaseFont = () => {
    const root = document.querySelector("html");
    root.style.fontSize = `${
      parseFloat(getComputedStyle(root).fontSize) + 1
    }px`;
  };

  const decreaseFont = () => {
    const root = document.querySelector("html");
    root.style.fontSize = `${
      parseFloat(getComputedStyle(root).fontSize) - 1
    }px`;
  };

  // ===============================
  // HIGH CONTRAST
  // ===============================
  const toggleContrast = () => {
    document.body.classList.toggle("high-contrast");
  };

  // ===============================
  // DYSLEXIA MODE
  // ===============================
  const toggleDyslexia = () => {
    document.body.classList.toggle("dyslexia-font");
  };

  // ===============================
  // TEXT TO SPEECH - LEER PÁGINA
  // ===============================
  const readPage = () => {
    // Cancelar cualquier lectura previa
    window.speechSynthesis.cancel();

    const text = document.body.innerText;
    const msg = new SpeechSynthesisUtterance(text);

    msg.lang = "es-ES";
    msg.rate = 1;
    msg.pitch = 1;
    msg.volume = 1;

    msg.onend = () => setReading(false);

    utteranceRef.current = msg;
    setReading(true);
    window.speechSynthesis.speak(msg);
  };

  // ===============================
  // PARAR LECTURA
  // ===============================
  const stopReading = () => {
    window.speechSynthesis.cancel();
    setReading(false);
  };

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <button
        className="access-floating-btn"
        onClick={() => setOpen(true)}
        aria-label="Abrir accesibilidad"
      >
        <FaUniversalAccess />
      </button>

      {open && (
        <div className="access-panel" role="dialog" aria-label="Panel de accesibilidad">
          <div className="access-header">
            <h3>Accesibilidad</h3>
            <FaTimes
              className="close-btn"
              onClick={() => setOpen(false)}
              aria-label="Cerrar accesibilidad"
            />
          </div>

          <div className="access-options">
            <button onClick={zoomIn}>
              <FaSearchPlus /> Zoom +
            </button>

            <button onClick={zoomOut}>
              <FaSearchMinus /> Zoom −
            </button>

            <button onClick={increaseFont}>
              <FaFont /> Aumentar letra
            </button>

            <button onClick={decreaseFont}>
              <FaFont /> Reducir letra
            </button>

            <button onClick={toggleContrast}>
              <FaAdjust /> Alto contraste
            </button>

            <button onClick={toggleDyslexia}>
              <FaEye /> Modo dislexia
            </button>

            <button onClick={readPage}>
              <FaVolumeUp /> Leer página
            </button>

            {reading && (
              <button className="stop-reading-btn" onClick={stopReading}>
                <FaStop /> Parar lectura
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}