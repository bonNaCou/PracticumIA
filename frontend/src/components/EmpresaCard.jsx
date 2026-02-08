export default function EmpresaCard({ empresa, onSelect, selected }) {
  return (
    <div
      className={`empresa-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(empresa.nombre)}
    >
      <img src={empresa.logo} alt={empresa.nombre} className="empresa-card-logo" />

      <div className="empresa-card-info">
        <h3>{empresa.nombre}</h3>
        <p>{empresa.sector}</p>
      </div>
    </div>
  );
}
