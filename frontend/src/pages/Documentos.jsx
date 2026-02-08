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
    } catch (error) {
      console.error("Error cargando documentos:", error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!archivo) {
      alert("Selecciona un archivo");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);

    try {
      await uploadDocumento(formData);
      setArchivo(null);
      loadDocs();
    } catch (error) {
      console.error("Error subiendo documento:", error);
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
          name= "archivo"
          onChange={(e) => setArchivo(e.target.files[0])}
          accept=".pdf,.doc,.docx,.jpg,.png"
        />
        <button type="submit">Subir documento</button>
      </form>

      <table>
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
              <td colSpan="5">No hay documentos</td>
            </tr>
          ) : (
            documentos.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.nombre_archivo}</td>
                <td>{d.tipo}</td>
                <td>{new Date(d.fecha_subida).toLocaleString()}</td>
                <td>
                  <a
                    href={`http://localhost:4000${d.url}`}
                    download
                  >
                    Descargar
                  </a>
                  <button onClick={() => handleDelete(d.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
