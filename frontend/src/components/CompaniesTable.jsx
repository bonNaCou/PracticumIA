import "./CompaniesTable.css";

export default function CompaniesTable({ data, onEdit, onDelete }) {
  if (!data || data.length === 0)
    return <p>No hay empresas registradas.</p>;

  return (
    <table className="companies-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>CIF</th>
          <th>Sector</th>
          <th>Teléfono</th>
          <th>Email</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {data.map((empresa) => (
          <tr key={empresa.id}>
            <td>{empresa.nombre}</td>
            <td>{empresa.cif}</td>
            <td>{empresa.sector}</td>
            <td>{empresa.telefono}</td>
            <td>{empresa.email}</td>

            <td>
              <button className="btn-edit" onClick={() => onEdit(empresa)}>
                Editar
              </button>

              <button className="btn-delete" onClick={() => onDelete(empresa.id)}>
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
