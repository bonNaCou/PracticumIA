import { useState, useRef, useMemo } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./FichaSemanal.css";

import {
  FaSave,
  FaFilePdf,
  FaCheck,
  FaTimes,
  FaLock
} from "react-icons/fa";

export default function FichaSemanal() {
  const [header, setHeader] = useState({
    semanaInicio: "",
    semanaFin: "",
    centro: "",
    profesorTutor: "",
    empresa: "",
    tutorEmpresa: "",
    alumno: "",
    ciclo: "",
  });

  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  const [tabla, setTabla] = useState(
    dias.map((dia) => ({
      dia,
      actividad: "",
      tiempo: "",
      observaciones: "",
    }))
  );

  // ============================================================
  // ROLES Y CONTROL DE PERMISOS (NO rompe tu flujo)
  // - estudiante: firma alumno
  // - tutor_empresa: firma empresa y aprueba primera fase
  // - tutor: firma centro y aprueba segunda fase (final)
  // - admin: solo visualiza (puede exportar)
  // ============================================================
  const rol = (localStorage.getItem("rol") || "").toLowerCase();

  const puedeFirmarAlumno = rol === "estudiante";
  const puedeFirmarTutorEmpresa = rol === "tutor_empresa";
  const puedeFirmarTutorCentro = rol === "tutor";

  // ============================================================
  // FLUJO DE APROBACIÓN: Empresa → Centro
  // Estados:
  // - pendiente_empresa
  // - pendiente_centro
  // - aprobado
  // - rechazado
  // ============================================================
  const [aprobado, setAprobado] = useState("pendiente_empresa");

  // ============================================================
  // FIRMAS DIGITALES (tu estructura, pero handlers estables)
  // ============================================================
  const alumnoCanvas = useRef(null);
  const tutorCanvas = useRef(null);
  const profesorCanvas = useRef(null);

  const [firmaAlumno, setFirmaAlumno] = useState(null);
  const [firmaTutor, setFirmaTutor] = useState(null);
  const [firmaProfesor, setFirmaProfesor] = useState(null);

  // Estado de dibujo por canvas (evita recrear funciones en cada evento)
  const drawState = useRef({
    alumno: { dibujando: false, lastX: 0, lastY: 0 },
    tutor: { dibujando: false, lastX: 0, lastY: 0 },
    profesor: { dibujando: false, lastX: 0, lastY: 0 },
  });

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

const setupCanvas = (canvas) => {
  const ctx = canvas.getContext("2d");
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#2d2a55";
  return ctx;
};

  const makeSignatureHandlers = (key, canvasRef, setFirma, permitido) => {
    return {
      start: (e) => {
        if (!permitido) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = setupCanvas(canvas);
        const { x, y } = getPos(e, canvas);

        drawState.current[key].dibujando = true;
        drawState.current[key].lastX = x;
        drawState.current[key].lastY = y;

        ctx.beginPath();
        ctx.moveTo(x, y);
      },

      draw: (e) => {
        if (!permitido) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (!drawState.current[key].dibujando) return;

        const ctx = setupCanvas(canvas);
        const { x, y } = getPos(e, canvas);

        ctx.lineTo(x, y);
        ctx.stroke();
      },

      end: () => {
        if (!permitido) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        drawState.current[key].dibujando = false;
        setFirma(canvas.toDataURL("image/png"));
      },

      clear: () => {
        if (!permitido) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setFirma(null);
      }
    };
  };

  // Handlers memoizados (no cambian en cada render)
  const alumnoSig = useMemo(
    () => makeSignatureHandlers("alumno", alumnoCanvas, setFirmaAlumno, puedeFirmarAlumno),
    [puedeFirmarAlumno]
  );
  const tutorSig = useMemo(
    () => makeSignatureHandlers("tutor", tutorCanvas, setFirmaTutor, puedeFirmarTutorEmpresa),
    [puedeFirmarTutorEmpresa]
  );
  const profesorSig = useMemo(
    () => makeSignatureHandlers("profesor", profesorCanvas, setFirmaProfesor, puedeFirmarTutorCentro),
    [puedeFirmarTutorCentro]
  );

  const updateCell = (idx, field, value) => {
    const newTable = [...tabla];
    newTable[idx][field] = value;
    setTabla(newTable);
  };

  // ============================================================
  // GUARDAR (mismo flujo; solo limpio y consistente)
  // ============================================================
  const saveFicha = () => {
    const ficha = {
      header,
      tabla,
      firmas: {
        alumno: firmaAlumno,
        tutor_empresa: firmaTutor,
        tutor_centro: firmaProfesor,
      },
      estado: aprobado,
    };

    console.log("FICHA SEMANAL:", ficha);
    alert("Ficha semanal guardada correctamente.");
  };

  // ============================================================
  // APROBACIONES: Tutor Empresa → Tutor Centro (bloqueado por rol)
  // Reglas:
  // - Tutor Empresa puede aprobar/rechazar SOLO si estado = pendiente_empresa
  // - Tutor Centro puede aprobar/rechazar SOLO si estado = pendiente_centro
  // ============================================================
  const aprobarFase = () => {
    if (rol === "tutor_empresa" && aprobado === "pendiente_empresa") {
      setAprobado("pendiente_centro");
      return;
    }
    if (rol === "tutor" && aprobado === "pendiente_centro") {
      setAprobado("aprobado");
      return;
    }
  };

  const rechazarFase = () => {
    if (
      (rol === "tutor_empresa" && aprobado === "pendiente_empresa") ||
      (rol === "tutor" && aprobado === "pendiente_centro")
    ) {
      setAprobado("rechazado");
    }
  };

  const puedeAprobar =
    (rol === "tutor_empresa" && aprobado === "pendiente_empresa") ||
    (rol === "tutor" && aprobado === "pendiente_centro");

  // ============================================================
  // EXPORTAR A PDF (profesional + multipágina)
  // ============================================================
  const exportPDF = async () => {
    const element = document.querySelector(".ficha-container");
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Ajuste con margen superior para evitar corte
    const margin = 6;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Primera página
    pdf.addImage(imgData, "PNG", 0, position + margin, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Páginas adicionales si hace falta
    while (heightLeft > 0) {
      pdf.addPage();
      position = heightLeft - imgHeight;
      pdf.addImage(imgData, "PNG", 0, position + margin, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const nombre = `Ficha_Semanal_${header.semanaInicio || "inicio"}_${header.semanaFin || "fin"}.pdf`;
    pdf.save(nombre);
  };

  // ============================================================
  // Helpers UI Estado (sin emoticonos)
  // ============================================================
  const estadoLabel = () => {
    if (aprobado === "pendiente_empresa") return "Pendiente de validación (Empresa)";
    if (aprobado === "pendiente_centro") return "Pendiente de validación (Centro)";
    if (aprobado === "aprobado") return "Aprobada";
    if (aprobado === "rechazado") return "Rechazada";
    return "Pendiente";
  };

  return (
    <div className="page-container ficha-container">
      <h1>Registro Semanal de Prácticas Formativas</h1>

      {/* ESTADO DE APROBACIÓN */}
      <div className={`estado ${aprobado}`}>
        Estado: {estadoLabel()}
      </div>

      {/* CONTROLES (solo quienes tienen permiso en la fase correcta) */}
      {puedeAprobar && (
        <div className="aprobacion-controles">
          <button onClick={aprobarFase} className="ok-btn" type="button">
            <FaCheck /> Validar
          </button>

          <button onClick={rechazarFase} className="no-btn" type="button">
            <FaTimes /> Rechazar
          </button>
        </div>
      )}

      {/* ENCABEZADO */}
      <div className="ficha-header">
        <label>
          Semana del:
          <input type="date" onChange={(e) => setHeader({ ...header, semanaInicio: e.target.value })} />
        </label>

        <label>
          al:
          <input type="date" onChange={(e) => setHeader({ ...header, semanaFin: e.target.value })} />
        </label>

        <label>
          Centro Docente:
          <input type="text" onChange={(e) => setHeader({ ...header, centro: e.target.value })} />
        </label>

        <label>
          Profesor Tutor:
          <input type="text" onChange={(e) => setHeader({ ...header, profesorTutor: e.target.value })} />
        </label>

        <label>
          Empresa Colaboradora:
          <input type="text" onChange={(e) => setHeader({ ...header, empresa: e.target.value })} />
        </label>

        <label>
          Tutor de Empresa:
          <input type="text" onChange={(e) => setHeader({ ...header, tutorEmpresa: e.target.value })} />
        </label>

        <label>
          Alumno:
          <input type="text" onChange={(e) => setHeader({ ...header, alumno: e.target.value })} />
        </label>

        <label>
          Ciclo Formativo:
          <input type="text" onChange={(e) => setHeader({ ...header, ciclo: e.target.value })} />
        </label>
      </div>

      {/* TABLA */}
      <table className="ficha-tabla">
        <thead>
          <tr>
            <th>Día</th>
            <th>Actividades desarrolladas</th>
            <th>Tiempo</th>
            <th>Observaciones</th>
          </tr>
        </thead>

        <tbody>
          {tabla.map((row, i) => (
            <tr key={i}>
              <td>{row.dia}</td>
              <td>
                <textarea value={row.actividad} onChange={(e) => updateCell(i, "actividad", e.target.value)} />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Horas"
                  value={row.tiempo}
                  onChange={(e) => updateCell(i, "tiempo", e.target.value)}
                />
              </td>
              <td>
                <textarea value={row.observaciones} onChange={(e) => updateCell(i, "observaciones", e.target.value)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FIRMAS DIGITALES */}
      <h2>Firmas</h2>

      <div className="firmas-section">

        {/* Alumno */}
        <div className="firma-box">
          <p>Firma del Alumno</p>

          {!puedeFirmarAlumno && (
            <div className="firma-lock">
              <FaLock /> Firma reservada a: Estudiante
            </div>
          )}

          <canvas
            ref={alumnoCanvas}
            width={300}
            height={120}
            className={`canvas-firma ${!puedeFirmarAlumno ? "canvas-disabled" : ""}`}
            onMouseDown={alumnoSig.start}
            onMouseMove={alumnoSig.draw}
            onMouseUp={alumnoSig.end}
            onMouseLeave={alumnoSig.end}
            onTouchStart={alumnoSig.start}
            onTouchMove={alumnoSig.draw}
            onTouchEnd={alumnoSig.end}
          />

          {puedeFirmarAlumno && (
            <button type="button" className="firma-clear-btn" onClick={alumnoSig.clear}>
              Limpiar firma
            </button>
          )}
        </div>

        {/* Tutor Empresa */}
        <div className="firma-box">
          <p>Firma del Tutor de Empresa</p>

          {!puedeFirmarTutorEmpresa && (
            <div className="firma-lock">
              <FaLock /> Firma reservada a: Tutor de Empresa
            </div>
          )}

          <canvas
            ref={tutorCanvas}
            width={300}
            height={120}
            className={`canvas-firma ${!puedeFirmarTutorEmpresa ? "canvas-disabled" : ""}`}
            onMouseDown={tutorSig.start}
            onMouseMove={tutorSig.draw}
            onMouseUp={tutorSig.end}
            onMouseLeave={tutorSig.end}
            onTouchStart={tutorSig.start}
            onTouchMove={tutorSig.draw}
            onTouchEnd={tutorSig.end}
          />

          {puedeFirmarTutorEmpresa && (
            <button type="button" className="firma-clear-btn" onClick={tutorSig.clear}>
              Limpiar firma
            </button>
          )}
        </div>

        {/* Profesor Tutor (Centro) */}
        <div className="firma-box">
          <p>Firma del Profesor Tutor</p>

          {!puedeFirmarTutorCentro && (
            <div className="firma-lock">
              <FaLock /> Firma reservada a: Tutor (Centro)
            </div>
          )}

          <canvas
            ref={profesorCanvas}
            width={300}
            height={120}
            className={`canvas-firma ${!puedeFirmarTutorCentro ? "canvas-disabled" : ""}`}
            onMouseDown={profesorSig.start}
            onMouseMove={profesorSig.draw}
            onMouseUp={profesorSig.end}
            onMouseLeave={profesorSig.end}
            onTouchStart={profesorSig.start}
            onTouchMove={profesorSig.draw}
            onTouchEnd={profesorSig.end}
          />

          {puedeFirmarTutorCentro && (
            <button type="button" className="firma-clear-btn" onClick={profesorSig.clear}>
              Limpiar firma
            </button>
          )}
        </div>

      </div>

      {/* BOTONES */}
      <div className="botones-final">
        <button className="save-btn" onClick={saveFicha} type="button">
          <FaSave /> Guardar
        </button>

        <button className="pdf-btn" onClick={exportPDF} type="button">
          <FaFilePdf /> Exportar a PDF
        </button>
      </div>
    </div>
  );
}