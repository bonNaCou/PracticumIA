export default function ModalLog({ log, onClose }) {
  if (!log) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">

        <h2>Detalle del Log</h2>

        <div className="modal-body">
          <p><strong>ID:</strong> {log.id}</p>
          <p><strong>Usuario:</strong> {log.usuario_nombre}</p>
          <p><strong>Pregunta:</strong> {log.pregunta}</p>

          <div className="respuesta-box">
            {log.respuesta}
          </div>
        </div>

        <button className="close-btn" onClick={onClose}>Cerrar</button>

      </div>
    </div>
  );
}
