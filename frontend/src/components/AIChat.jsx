import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./AIChat.css";
import { empresasDAW } from "../data/empresas";

// VOCES PERSONALIZADAS (estilo iPhone)
const VOICES = [
  // Voces originales
  { id: "synthia", label: "Synthia", style: "Suave • Profesional", color: "#6a4afb" },
  { id: "shayla", label: "Shayla", style: "Joven • Energética", color: "#ff66c4" },
  { id: "adira", label: "Adira", style: "Profunda • Elegante", color: "#4cc9f0" },
  { id: "sherrynova", label: "SherryNova", style: "Cálida • Personal", color: "#ff9e00" },
  { id: "xerimaz", label: "XeriMaz", style: "Inteligente • Neutra", color: "#7f5af0" },
  { id: "gamerkween", label: "GamerKween", style: "Streamer • Dinámica", color: "#14f195" },
  { id: "lavinagreta", label: "LaVinagreta", style: "Picante • Atrevida", color: "#f72585" },

  // 🔥 NUEVAS VOCES — CASTELLANO ESPAÑOL
  { id: "esp_femenina1", label: "Inés (ES)", style: "Clara • Natural", color: "#ff8fab" },
  { id: "esp_femenina2", label: "Sonia (ES)", style: "Neutral • Elegante", color: "#ffb3c6" },
  { id: "esp_masculina1", label: "Carlos (ES)", style: "Masculina • Firme", color: "#a2d2ff" },
  { id: "esp_masculina2", label: "Iván (ES)", style: "Grave • Natural", color: "#90caf9" },

  // 🔥 VOCES MASCULINAS INTERNACIONALES
  { id: "chikwadovoice", label: "ChikwadoVoice", style: "Profunda • Africana", color: "#6f4e37" },
  { id: "odogwubass", label: "OdogwuBass", style: "Grave • Dominante", color: "#4b3832" },

  // 🔥 VOCES NARRADORES
  { id: "narrator", label: "Narrador", style: "Épico • Documental", color: "#ffaa00" },
  { id: "storyteller", label: "Cuentacuentos", style: "Mágico • Suave", color: "#ffc400" },
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("synthia");
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);

  // Variables internas SOLO para autovoice
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");

  const audioRef = useRef(null);
  const token = localStorage.getItem("token");

  // 🧠 Cambio automático de voz según empresa (NO muestra nada en pantalla)
  useEffect(() => {
    if (!empresaSeleccionada) return;

    const empresa = empresaSeleccionada.toLowerCase();

    if (empresa.includes("indra") || empresa.includes("telefónica")) {
      setSelectedVoice("synthia");
      return;
    }

    if (empresa.includes("altia") || empresa.includes("r cable")) {
      setSelectedVoice("xerimaz");
      return;
    }

    if (empresa.includes("startup") || empresa.includes("abanca")) {
      setSelectedVoice("shayla");
      return;
    }

    if (empresa.includes("ayuntamiento")) {
      setSelectedVoice("adira");
      return;
    }
  }, [empresaSeleccionada]);

  // 🎧 AUDIO PLAYER
  const playAudio = (buffer) => {
    stopAudio();
    const blob = new Blob([buffer], { type: "audio/mp3" });
    const url = URL.createObjectURL(blob);
    audioRef.current = new Audio(url);

    audioRef.current.onplay = () => setSpeaking(true);
    audioRef.current.onended = () => setSpeaking(false);
    audioRef.current.play();
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setSpeaking(false);
  };

  // 🎤 MICRO
  let recognition;
  if ("webkitSpeechRecognition" in window) {
    recognition = new window.webkitSpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;
  }

  const startListening = () => {
    if (!recognition) return alert("Tu navegador no soporta reconocimiento de voz.");

    recognition.start();
    setListening(true);

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setMsg(text);
      setListening(false);
      send(text);
    };

    recognition.onerror = () => setListening(false);
  };

  const stopListening = () => {
    if (recognition) recognition.stop();
    setListening(false);
  };

  // 🚀 ENVIAR
  const send = async (forcedText) => {
    const finalText = forcedText || msg;
    if (!finalText.trim()) return;

    setChat((prev) => [...prev, { from: "user", text: finalText }]);

    const res = await axios.post(
      "/ai/chat",
      {
        prompt: finalText,
        voice: selectedVoice,
        empresa: empresaSeleccionada,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const reply = res.data.respuesta;

    setChat((prev) => [...prev, { from: "ia", text: reply }]);

    try {
      const audioRes = await axios.post(
        "/ai/tts",
        { text: reply, voice: selectedVoice },
        {
          responseType: "arraybuffer",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      playAudio(audioRes.data);
    } catch (err) {
      console.error("Error generando TTS", err);
    }

    setMsg("");
  };

  // 🔁 REPLAY
  const replayVoice = async (text) => {
    try {
      const audioRes = await axios.post(
        "/ai/tts",
        { text, voice: selectedVoice },
        {
          responseType: "arraybuffer",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      playAudio(audioRes.data);
    } catch (err) {
      console.error("Error reproduciendo", err);
    }
  };

  return (
    <div className={`chat-container ${open ? "open" : ""}`}>
      <button className="chat-toggle" onClick={() => setOpen(!open)}>🤖</button>

      {open && (
        <div className="chat-box">
          {/* HEADER */}
          <div className="header">
            <span className="bot-name">
              {VOICES.find((v) => v.id === selectedVoice)?.label} • PracticumIA
            </span>
            <button className="stop-btn" onClick={stopAudio}>⏹️</button>
          </div>

          {/* VOCES */}
          <div className="voice-slider">
            {VOICES.map((v) => (
              <div
                key={v.id}
                className={`voice-card ${selectedVoice === v.id ? "active" : ""}`}
                style={{ borderColor: v.color }}
                onClick={() => setSelectedVoice(v.id)}
              >
                <div className="voice-color" style={{ background: v.color }}></div>
                <div className="voice-info">
                  <strong>{v.label}</strong>
                  <small>{v.style}</small>
                </div>
              </div>
            ))}
          </div>

          {/* ANIMACIÓN */}
          {speaking && (
            <div className="voice-animation">
              <span></span><span></span><span></span><span></span>
            </div>
          )}

          {/* MENSAJES */}
          <div className="messages">
            {chat.map((c, i) => (
              <div key={i} className={`msg ${c.from}`}>
                {c.text}

                {c.from === "ia" && (
                  <button className="replay-btn" onClick={() => replayVoice(c.text)}>
                    🔊 Reproducir en {VOICES.find(v => v.id === selectedVoice)?.label}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* INPUT */}
          <div className="input-area">
            <button className="mic-btn" onClick={listening ? stopListening : startListening}>
              {listening ? "🎙️" : "🎤"}
            </button>

            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Escribe o habla..."
              onKeyDown={(e) => e.key === "Enter" && send()}
            />

            <button onClick={() => send()}>Enviar</button>
          </div>
        </div>
      )}
    </div>
  );
}