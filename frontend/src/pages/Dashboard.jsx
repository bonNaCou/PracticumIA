/**
 * Dashboard.jsx — PracticumIA
 * ---------------------------------------------------------
 * Panel principal del administrador.
 *
 * Este componente:
 *  ✔ Verifica que exista token antes de cargar datos
 *  ✔ Si no hay token → redirige al login automáticamente
 *  ✔ Obtiene estadísticas reales del backend con axios
 *  ✔ Muestra los valores en tarjetas (estudiantes, empresas...)
 *  ✔ Maneja errores 401 (token caducado o inválido)
 *  ✔ Incluye el sidebar y el asistente IA flotante
 * ---------------------------------------------------------
 */

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import Card from "../components/Card";
import {
  FaUsers,
  FaBook,
  FaBuilding,
  FaRobot,
  FaClipboardList
} from "react-icons/fa";


import api from "../services/api";
import "./Dashboard.css";

function Dashboard({ usuario }) {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    estudiantes: 0,
    empresas: 0,
    practicas: 0,
    logsIA: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const [est, emp, prac, logs] = await Promise.all([
        api.get("/estudiantes"),
        api.get("/empresas"),
        api.get("/practicas"),
        api.get("/ia_logs"),
      ]);

      setStats({
        estudiantes: est.data.length,
        empresas: emp.data.length,
        practicas: prac.data.length,
        logsIA: logs.data.length,
      });

    } catch (err) {
      console.error("Error:", err);

      if (err?.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  return (
    <div className="dashboard-layout">


      <main className="dashboard-main">

        <section className="cards">

          <Card
            title="Total Estudiantes"
            value={`${stats.estudiantes} registrados`}
            icon={FaUsers}
            onClick={() => navigate("/estudiantes")}
          />

          <Card
            title="Prácticas activas"
            value={`${stats.practicas} en curso`}
            icon={FaBook}
            onClick={() => navigate("/practicas")}
          />

          <Card
            title="Empresas colaboradoras"
            value={`${stats.empresas} empresas`}
            icon={FaBuilding}
            onClick={() => navigate("/empresas")}
          />

        {/* TARJETA FICHA SEMANAL */}
        <Card
          title="Ficha Semanal"
          value="Registro semanal de prácticas"
          icon={FaClipboardList}
          onClick={() => navigate("/ficha-semanal")}
        />

          <Card
            title="Consultas IA registradas"
            value={`${stats.logsIA} respuestas`}
            icon={FaRobot}
            onClick={() => navigate("/ia-logs")}
          />

        </section>
      </main>

    </div>
  );
}

export default Dashboard;