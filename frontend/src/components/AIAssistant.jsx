import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./AIAssistant.css";
import { FaRobot, FaPaperPlane, FaRegFilePdf, FaVolumeUp, FaTimes } from "react-icons/fa";

const API = "http://localhost:4000/ai";

export default function AIAssistant() {
  const location = useLocation();

  // SOLO mostrar en /documentos
  if (location.pathname !== "/documentos") {
    return null;
  }

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const sendMessage = async () => {
    if (!prompt.trim()) return;

    const userMessage = { role: "user", text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API}/chat`,
        { prompt },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const aiMessage = { role: "ai", text: res.data.respuesta };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (err) {
      console.error("Error IA:", err);
    }

    setLoading(false);
  };

  const handlePDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessages((prev) => [...prev, { role: "user", text: "📄 Analizando PDF..." }]);
    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await axios.post(`${API}/pdf`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessages((prev) => [...prev, { role: "ai", text: res.data.resumen }]);

    } catch (error) {
      console.error("Error PDF:", error);
    }

    setLoading(false);
  };

  const speak = async (text) => {
    try {
      const res = await axios.post(
        `${API}/tts`,
        { text },
        {
          responseType: "arraybuffer",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const audioBlob = new Blob([res.data], { type: "audio/mp3" });
      const url = URL.createObjectURL(audioBlob);
      new Audio(url).play();

    } catch (err) {
      console.error("Error TTS:", err);
    }
  };

  return (
    <>
      {/* Botón flotante SOLO visible en /documentos */}
      <button className="ai-floating-btn" onClick={() => setOpen(true)}>
        <FaRobot />
      </button>

      {open && (
        <div className="ai-panel">
          <div className="ai-header">
            <h3>Asistente IA • PracticumIA</h3>
            <FaTimes className="close-btn" onClick={() => setOpen(false)} />
          </div>

          <div className="ai-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                {m.text}
                {m.role === "ai" && (
                  <FaVolumeUp className="tts-btn" onClick={() => speak(m.text)} />
                )}
              </div>
            ))}

            {loading && <div className="msg ai">⏳ Pensando...</div>}
          </div>

          <div className="ai-footer">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Escribe tu mensaje…"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <FaRegFilePdf
              className="pdf-btn"
              onClick={() => fileInputRef.current.click()}
            />

            <FaPaperPlane className="send-btn" onClick={sendMessage} />

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="application/pdf"
              onChange={handlePDF}
            />
          </div>
        </div>
      )}
    </>
  );
}
