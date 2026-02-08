import { useState, useEffect } from "react"; 
import "./StudentForm.css";
import { FaEye, FaEyeSlash, FaMagic, FaRobot } from "react-icons/fa";
import SelectCiclo from "../components/SelectCiclo";

export default function StudentForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    dni: "",
    ciclo: "",
    curso: "",
    especialidad: "",
    modulos: [],
    ai_tip: ""
  });

  const [showPass, setShowPass] = useState(false);

  // ============================
  // Autorrelleno cuando se recibe initialData (para edición)
  // ============================
  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre || "",
        email: initialData.email || "",
        password: "",
        dni: initialData.dni || "",
        ciclo: initialData.ciclo || "",
        curso: initialData.curso || "",
        especialidad: initialData.especialidad || "",
        modulos: initialData.modulos || [],
        ai_tip: initialData.ai_tip || ""
      });
    }
  }, [initialData]);

  // ============================
  // Manejar cambios de inputs
  // ============================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ============================
  // Cuando el usuario selecciona ciclo
  // (SelectCiclo devuelve value + info IA extra)
  // ============================
  const handleCicloSelect = (value, cicloData) => {
    setForm({
      ...form,
      ciclo: value,
      curso: cicloData.curso,
      especialidad: cicloData.especialidad,
      modulos: cicloData.modulos,
      ai_tip: cicloData.ai_tip
    });
  };

  // ============================
  // Generar contraseña automáticamente
  // ============================
  const generarPassword = () => {
    const pwd = Math.random().toString(36).slice(-8) + "!A1";
    setForm({ ...form, password: pwd });
  };

  // ============================
  // Autocompletar por IA (DEMO)
  // ============================
  const rellenarIA = () => {
    setForm({
      nombre: "Estudiante Ejemplo",
      email: "estudiante@correo.com",
      password: "Demo123!A",
      dni: "12345678A",
      ciclo: "DAW",
      curso: "1º 2024-2025",
      especialidad: "Desarrollo Web",
      modulos: ["HTML", "CSS", "JavaScript", "React"],
      ai_tip: "Recomendado para perfiles creativos con interés en desarrollo frontend y backend."
    });
  };

  // ============================
  // Enviar formulario
  // ============================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.nombre || !form.email || !form.dni || !form.ciclo) {
      alert("Los campos obligatorios deben ser completados.");
      return;
    }

    onSubmit(form);

    if (!initialData) {
      setForm({
        nombre: "",
        email: "",
        password: "",
        dni: "",
        ciclo: "",
        curso: "",
        especialidad: "",
        modulos: [],
        ai_tip: ""
      });
    }
  };

  return (
    <div className="student-form-card">
      <h3>{initialData ? "Editar estudiante" : "Nuevo estudiante"}</h3>

      <form onSubmit={handleSubmit}>

        {/* Nombre */}
        <label>Nombre completo *</label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Ej: Ana Gómez López"
          required
        />

        {/* Email */}
        <label>Email *</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="correo@ejemplo.com"
          required
        />

        {/* Contraseña */}
        {!initialData && (
          <>
            <label>Contraseña</label>
            <div className="password-wrapper">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Asignar o generar"
              />

              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>

              <button
                type="button"
                className="magic-btn"
                onClick={generarPassword}
              >
                <FaMagic />
              </button>
            </div>
          </>
        )}

        {/* DNI */}
        <label>DNI *</label>
        <input
          name="dni"
          value={form.dni}
          onChange={handleChange}
          placeholder="12345678A"
          required
        />

        {/* Ciclo */}
        <label>Ciclo / Grado *</label>
        <SelectCiclo value={form.ciclo} onChange={handleCicloSelect} />

        {/* Curso autocompletado */}
        {form.curso && (
          <>
            <label>Curso sugerido</label>
            <input value={form.curso} disabled />
          </>
        )}

        {/* Especialidad */}
        {form.especialidad && (
          <>
            <label>Especialidad sugerida</label>
            <input value={form.especialidad} disabled />
          </>
        )}

        {/* Mensaje IA */}
        {form.ai_tip && (
          <div className="ai-box">
            <FaRobot />
            <span>{form.ai_tip}</span>
          </div>
        )}

        {/* Botón IA */}
        <button type="button" className="btn-ai" onClick={rellenarIA}>
          <FaRobot /> Autocompletar por IA
        </button>

        {/* Botones finales */}
        <div className="form-buttons">
          <button type="submit" className="btn-primary">
            {initialData ? "Actualizar estudiante" : "Crear estudiante"}
          </button>

          {initialData && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancelar edición
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
