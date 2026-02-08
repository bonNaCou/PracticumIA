import { useEffect, useState } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

import VOICES from "../data/voices";

// Registro ChartJS
ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function IALogs() {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [voiceFilter, setVoiceFilter] = useState("all");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  /* ============================
     1. Cargar historial IA
  ============================ */
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("http://localhost:4000/ia_logs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLogs(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Error cargando logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [token]);

  /* ============================
     2. Aplicar filtros
  ============================ */
  useEffect(() => {
    let data = [...logs];

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (l) =>
          l.pregunta.toLowerCase().includes(s) ||
          l.respuesta.toLowerCase().includes(s)
      );
    }

    if (voiceFilter !== "all") {
      data = data.filter((l) => l.voz_usada === voiceFilter);
    }

    if (dateStart) {
      data = data.filter((l) => new Date(l.fecha) >= new Date(dateStart));
    }

    if (dateEnd) {
      data = data.filter((l) => new Date(l.fecha) <= new Date(dateEnd));
    }

    setFiltered(data);
  }, [search, voiceFilter, dateStart, dateEnd, logs]);

  /* ============================
      3. Gráficos
  ============================ */
  const chartByDay = {
    labels: filtered.map((l) => new Date(l.fecha).toLocaleDateString()),
    datasets: [
      {
        label: "Consultas por día",
        data: filtered.map(() => 1),
        borderColor: "#6a4afb",
        backgroundColor: "rgba(106, 74, 251, 0.3)",
        tension: 0.4,
      },
    ],
  };

  const voiceCounts = filtered.reduce((acc, log) => {
    acc[log.voz_usada] = (acc[log.voz_usada] || 0) + 1;
    return acc;
  }, {});

  const chartVoices = {
    labels: Object.keys(voiceCounts),
    datasets: [
      {
        label: "Uso por voz",
        data: Object.values(voiceCounts),
        backgroundColor: [
          "#6a4afb",
          "#ff66c4",
          "#4cc9f0",
          "#ff9e00",
          "#7f5af0",
          "#14f195",
          "#f72585",
          "#555",
          "#999",
        ],
      },
    ],
  };

  /* ============================
     4. Exportar CSV
  ============================ */
  const exportCSV = () => {
    const header = "ID,Fecha,Pregunta,Respuesta,Voz\n";
    const rows = filtered
      .map(
        (r) =>
          `${r.id},"${r.fecha}","${r.pregunta}","${r.respuesta}",${r.voz_usada}`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ia_logs.csv";
    a.click();
  };

  /* ============================
     5. Exportar Excel
  ============================ */
  const exportExcel = () => {
    const XLSX = require("xlsx");

    const formatted = filtered.map((log) => ({
      ID: log.id,
      Fecha: new Date(log.fecha).toLocaleString(),
      Pregunta: log.pregunta,
      Respuesta: log.respuesta,
      Voz: log.voz_usada,
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Logs IA");

    XLSX.writeFile(wb, "ia_logs.xlsx");
  };

  /* ============================
     6. Exportar PDF
  ============================ */
  const exportPDF = () => {
    const jsPDF = require("jspdf");
    require("jspdf-autotable");

    const doc = new jsPDF();
    doc.text("Historial de IA – PracticumIA", 14, 15);

    const tableData = filtered.map((log) => [
      log.id,
      new Date(log.fecha).toLocaleString(),
      log.pregunta,
      log.respuesta,
      log.voz_usada,
    ]);

    doc.autoTable({
      head: [["ID", "Fecha", "Pregunta", "Respuesta", "Voz"]],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [106, 74, 251] },
    });

    doc.save("ia_logs.pdf");
  };

  /* ============================
     7. Render de vista
  ============================ */
  return (
    <div className="page-container logs-container">
      <h2 className="logs-title">Panel PRO Historial IA</h2>

      {/* FILTROS */}
      <div className="filters-box">
        <input
          className="search-input"
          placeholder="Buscar…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={voiceFilter}
          onChange={(e) => setVoiceFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todas las voces</option>
          {VOICES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre}
            </option>
          ))}
        </select>

        <div className="date-filters">
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
          />
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
          />
        </div>
      </div>

      {/* GRÁFICOS */}
      <h3>Actividad diaria</h3>
      <div className="chart-box">
        <Line data={chartByDay} />
      </div>

      <h3>Uso por voz</h3>
      <div className="chart-box">
        <Bar data={chartVoices} />
      </div>

      {/* EXPORTAR */}
      <div className="export-buttons">
        <button onClick={exportCSV}>CSV</button>
        <button onClick={exportExcel}>Excel</button>
        <button onClick={exportPDF}>PDF</button>
      </div>

      {/* TABLA */}
      {!loading && (
        <table className="logs-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Pregunta</th>
              <th>Respuesta</th>
              <th>Voz</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} onClick={() => setSelected(log)}>
                <td>{log.id}</td>
                <td>{new Date(log.fecha).toLocaleString()}</td>
                <td>{log.pregunta.slice(0, 40)}...</td>
                <td>{log.respuesta.slice(0, 40)}...</td>
                <td>{log.voz_usada}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODAL */}
      {selected && (
        <div className="modal-bg" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Detalle completo</h3>

            <p>
              <strong>Fecha:</strong>{" "}
              {new Date(selected.fecha).toLocaleString()}
            </p>
            <p>
              <strong>Pregunta:</strong> {selected.pregunta}
            </p>
            <p>
              <strong>Respuesta:</strong> {selected.respuesta}
            </p>
            <p>
              <strong>Voz usada:</strong> {selected.voz_usada}
            </p>

            <button className="close-btn" onClick={() => setSelected(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
