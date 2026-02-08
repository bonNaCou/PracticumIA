import { useEffect, useState } from "react";
import "./Documentos.css";
import {
  getDocumentos,
  uploadDocumento,
  deleteDocumento
} from "../services/documentosService";

export default function Documentos() {
  const [documentos, setDocumentos] = useState([]);
  const [archivo, setArchivo] = useState(null);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const data = await getDocumentos();
      setDocumentos(data);
    } catch (err) {
      console.error("Error cargando documentos:", err);
    }
  };

  // ===============================
  // SUBIR ARCHIVO
  // ===============================
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!archivo) return alert("Selecciona un documento");

    const formData = new FormData();
    formData.append("file", archivo);   // ← NOMBRE CORRECTO

    try {
      await uploadDocumento(formData);
      setArchivo(null);
      loadDocs();
    } catch (err) {
      console.error("Error subiendo archivo:", err);
      alert("Error al subir el archivo");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar documento?")) return;
    await deleteDocumento(id);
    loadDocs();
  };

  return (
    <div className="docs-page">
      <h1>Gestión de Documentos</h1>

      <form className="upload-form" onSubmit={handleUpload}>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.png"
          onChange={(e) => setArchivo(e.target.files[0])}
        />
        <button type="submit" className="btn-upload">
          Subir documento
        </button>
      </form>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Archivo</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {documentos.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  No hay documentos aún.
                </td>
              </tr>
            ) : (
              documentos.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.nombre}</td>
                  <td>{d.tipo}</td>
                  <td>{new Date(d.fecha).toLocaleString()}</td>

                  <td>
                    <a
                      className="btn-download"
                      href={`http://localhost:4000/uploads/${d.nombre_fisico}`}
                      download
                    >
                      Descargar
                    </a>

                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(d.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
