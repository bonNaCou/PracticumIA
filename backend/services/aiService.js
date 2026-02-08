require("dotenv").config();
const OpenAI = require("openai");
const fetch = require("node-fetch");
const voiceMap = require("./voiceMap");

// ==============================
// CLIENTE OPENAI
// ==============================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// GEMINI PDF
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// ==============================
// DETECTOR AUTOMÁTICO DE VOZ SEGÚN EL TEXTO
// ==============================
function detectarVozAutomatica(prompt) {
  const p = prompt.toLowerCase();

  if (p.includes("práctica") || p.includes("estudio") || p.includes("evaluación"))
    return "synthia";

  if (p.includes("motivación") || p.includes("triste") || p.includes("sentir"))
    return "sherrynova";

  if (p.includes("programar") || p.includes("código") || p.includes("tecnología"))
    return "xerimaz";

  if (p.includes("consola") || p.includes("juego"))
    return "gamerkween";

  if (p.includes("españa") || p.includes("español"))
    return "esp_femenina1";

  return null;
}

// ======================================================
// 🧠 CHAT IA — PERSONALIDAD REAL + CONTROL DEL PRIMER MENSAJE
// ======================================================

async function chatIA(prompt, voice = "synthia", isFirstMessage = false, personalityText = "") {

  const personalityMap = {
  synthia: "Hablas con profesionalidad, tono claro, directo y eficiente.",
  shayla: "Hablas joven, dinámica, con energía ligera pero respetuosa.",
  adira: "Hablas con profundidad, elegancia, calma y reflexión.",
  sherrynova: "Hablas cálida, cariñosa, suave y muy humana.",
  
  esp_femenina1: "Hablas como española nativa, clara, segura y natural.",
  esp_femenina2: "Hablas en castellano elegante, pausado y refinado.",
  
  esp_masculina1: "Hablas con voz masculina castellana firme y segura.",
  esp_masculina2: "Hablas como un hombre joven español, natural y cercano.",

  chikwadovoice: "Hablas con profundidad africana, pausado y fuerte.",
  odogwubass: "Hablas con energía masculina grave, muy dominante pero calmada.",

  narrator: "Hablas como documental épico, tono cinematográfico y solemne.",
  storyteller: "Hablas como narrador de cuento mágico, suave y envolvente."
};

const emotionTone = {
  feliz: "Suena alegre y positiva, con energía suave.",
  triste: "Habla con empatía y calidez, sin sonar fría.",
  preocupado: "Hablas con calma y seguridad, dando apoyo.",
  motivado: "Habla con fuerza, enfoque y determinación.",
};

function detectarEmocion(prompt) {
  const p = prompt.toLowerCase();

  if (p.includes("feliz") || p.includes("bien") || p.includes("contenta"))
    return "feliz";

  if (p.includes("triste") || p.includes("mal") || p.includes("bajón"))
    return "triste";

  if (p.includes("ansiedad") || p.includes("preocupado") || p.includes("estres"))
    return "preocupado";

  if (p.includes("motivación") || p.includes("lograr") || p.includes("quiero conseguir"))
    return "motivado";

  return null;
}

  let selectedVoice = detectarVozAutomatica(prompt) || voice;

const personality = personalityMap[voice] || "Habla de forma clara y natural.";

const mood = detectarEmocion(prompt);
const moodText = mood ? `Además, ajusta el tono emocional a: ${emotionTone[mood]}.` : "";

const systemMessage = `
Eres la voz "${voice}" y SIGUES esta personalidad:
${personality}

${moodText}

Reglas:
- Responde en 3–5 líneas.
- Estilo conversacional.
- No menciones que eres IA.
- Mantén el estilo asignado.
`;



  const messages = [
    { role: "system", content: systemMessage }
  ];

  if (isFirstMessage) {
    messages.push({
      role: "assistant",
      content: `Este es nuestro primer mensaje, así que te doy la bienvenida con el estilo de ${voice}.`
    });
  }

  messages.push({ role: "user", content: prompt });

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });

  return res.choices[0].message.content;
}

// ======================================================
// 🔊 TEXTO → VOZ MULTIVOZ (OpenAI TTS)
// ======================================================
async function generarAudio(text, voice = "synthia") {
  const openaiVoice = voiceMap[voice.toLowerCase()] || "alloy";

  // Velocidad y tono personalizados por voz
  const voiceSettings = {
    synthia:      { speed: 1.0, pitch: 1.0 },
    shayla:       { speed: 1.15, pitch: 1.1 },
    adira:        { speed: 0.92, pitch: 0.9 },
    sherrynova:   { speed: 0.95, pitch: 1.05 },

    esp_femenina1: { speed: 1.05, pitch: 1.0 },
    esp_femenina2: { speed: 0.9, pitch: 0.95 },

    esp_masculina1: { speed: 1.0, pitch: 0.85 },
    esp_masculina2: { speed: 1.08, pitch: 0.9 },

    chikwadovoice: { speed: 0.88, pitch: 0.75 },
    odogwubass:    { speed: 0.9, pitch: 0.7 },

    narrator:     { speed: 0.85, pitch: 0.95 },
    storyteller:  { speed: 0.95, pitch: 1.1 },
  };

  const { speed, pitch } = voiceSettings[voice] || { speed: 1.0, pitch: 1.0 };

  const audio = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: openaiVoice,
    input: text,
    speed,
    pitch
  });

  return Buffer.from(await audio.arrayBuffer());
}

// ======================================================
// 📝 INFORME ACADÉMICO
// ======================================================
async function generarInforme(prompt) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Genera informes claros, profesionales y estructurados." },
      { role: "user", content: prompt }
    ],
  });

  return res.choices[0].message.content;
}

// ======================================================
// 📄 ANALIZAR PDF (GEMINI)
// ======================================================
async function analizarPDF(file) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
    GEMINI_KEY;

  const body = {
    contents: [
      {
        parts: [
          { text: "Analiza el PDF y crea un resumen profesional y claro." },
          {
            inline_data: {
              mime_type: file.mimetype,
              data: file.buffer.toString("base64"),
            }
          }
        ],
      },
    ],
  };

  const req = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await req.json();

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error procesando PDF.";
}

module.exports = {
  chatIA,
  generarAudio,
  analizarPDF,
  generarInforme,
};
