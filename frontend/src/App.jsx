/**
 * App.jsx — Arquitectura principal de PracticumIA
 */

import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Páginas
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Estudiantes from "./pages/Estudiantes";
import Empresas from "./pages/Empresas";
import Practicas from "./pages/Practicas";
import Documentos from "./pages/Documentos";
import FichaSemanal from "./pages/FichaSemanal";
import IALogs from "./pages/IALogs";

// 🔹 Nuevas páginas multi-rol
import TutorFichasList from "./pages/TutorFichasList";
import TutorFichaDetalle from "./pages/TutorFichaDetalle";
import ValidacionesEmpresa from "./pages/ValidacionesEmpresa";
import PracticasEmpresa from "./pages/PracticasEmpresa";

// Componentes globales
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

// Rutas protegidas
import PrivateRoute from "./components/PrivateRoute";

// Asistentes flotantes
import AIChat from "./components/AIChat";
import AIAssistant from "./components/AIAssistant";
import AccessibilityAssistant from "./components/AccessibilityAssistant";

// Estilos
import "./styles/App.css";


/* =====================================================
   LAYOUT PRIVADO
===================================================== */
function ProtectedLayout({ children, usuario }) {
  const location = useLocation();

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <Sidebar
        onLogout={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
      />

      {/* Contenido principal */}
      <main className="main-content">
        <Header usuario={usuario} />
        {children}
      </main>

      {/* AIAssistant SOLO en /documentos */}
      {location.pathname === "/documentos" && <AIAssistant />}

      {/* Accesibilidad global */}
      <AccessibilityAssistant />
    </div>
  );
}


/* =====================================================
   APP PRINCIPAL
===================================================== */
export default function App() {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario")) || null
  );

  const handleLogin = (userData) => {
    setUsuario(userData);
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={
            usuario
              ? <Navigate to="/dashboard" replace />
              : <Login onLogin={handleLogin} />
          }
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute usuario={usuario}>
              <ProtectedLayout usuario={usuario}>
                <Dashboard usuario={usuario} />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* ESTUDIANTES */}
        <Route
          path="/estudiantes"
          element={
            <PrivateRoute usuario={usuario}>
              <ProtectedLayout usuario={usuario}>
                <Estudiantes />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* EMPRESAS */}
        <Route
          path="/empresas"
          element={
            <PrivateRoute usuario={usuario}>
              <ProtectedLayout usuario={usuario}>
                <Empresas />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* PRACTICAS */}
        <Route
          path="/practicas"
          element={
            <PrivateRoute usuario={usuario}>
              <ProtectedLayout usuario={usuario}>
                <Practicas />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* DOCUMENTOS — AIAssistant activo */}
        <Route
          path="/documentos"
          element={
            <PrivateRoute usuario={usuario}>
              <ProtectedLayout usuario={usuario}>
                <Documentos />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* FICHA SEMANAL (Estudiante) */}
        <Route
          path="/ficha-semanal"
          element={
            <PrivateRoute usuario={usuario}>
              <ProtectedLayout usuario={usuario}>
                <FichaSemanal />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* IA LOGS — AIChat SOLO AQUÍ */}
        <Route
          path="/ia-logs"
          element={
            <PrivateRoute usuario={usuario}>
              <ProtectedLayout usuario={usuario}>
                <IALogs />
                <AIChat />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />


        {/* ======================================
           NUEVAS RUTAS MULTI-ROL
        ====================================== */}

        {/* TUTOR DOCENTE */}
        <Route
          path="/tutor/fichas"
          element={
            <PrivateRoute usuario={usuario}>
              <ProtectedLayout usuario={usuario}>
                <TutorFichasList />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/tutor/fichas/:id"
          element={
            <PrivateRoute usuario={usuario}>
              <ProtectedLayout usuario={usuario}>
                <TutorFichaDetalle />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* EMPRESA / TUTOR EMPRESA */}
        <Route
          path="/empresa/validaciones"
          element={
            <PrivateRoute usuario={usuario}>
              <ProtectedLayout usuario={usuario}>
                <ValidacionesEmpresa />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/empresa/practicas"
          element={
            <PrivateRoute usuario={usuario}>
              <ProtectedLayout usuario={usuario}>
                <PracticasEmpresa />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* CUALQUIER OTRA RUTA */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
