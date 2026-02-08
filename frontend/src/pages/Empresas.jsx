import { useState, useEffect } from "react";
import {
  getEmpresas,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
} from "../services/empresasService";

import CompanyForm from "../components/CompanyForm";
import CompaniesTable from "../components/CompaniesTable";

import "./Empresas.css";

export default function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const cargarEmpresas = async () => {
    const data = await getEmpresas();
    setEmpresas(data);
  };

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const handleSave = async (empresa) => {
    if (editingEmpresa) {
      await updateEmpresa(editingEmpresa.id, empresa);
    } else {
      await createEmpresa(empresa);
    }

    setShowForm(false);
    setEditingEmpresa(null);
    cargarEmpresas();
  };

  const handleDelete = async (id) => {
    if (confirm("¿Eliminar empresa?")) {
      await deleteEmpresa(id);
      cargarEmpresas();
    }
  };

  return (
    <div className="empresas-page">
      <h2>Empresas</h2>

      {!showForm && (
        <button className="btn-new" onClick={() => setShowForm(true)}>
          Nueva Empresa
        </button>
      )}

      {showForm && (
        <CompanyForm
          initialData={editingEmpresa}
          onSubmit={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingEmpresa(null);
          }}
        />
      )}

      <CompaniesTable
        data={empresas}
        onEdit={(e) => {
          setEditingEmpresa(e);
          setShowForm(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}
