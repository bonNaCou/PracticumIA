import api from "./api";

// Devuelve headers con token
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Obtener empresas
export const getEmpresas = async () => {
  const res = await api.get("/empresas", {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// Crear empresa
export const createEmpresa = async (data) => {
  const res = await api.post("/empresas", data, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  return res.data;
};

// Actualizar empresa
export const updateEmpresa = async (id, data) => {
  const res = await api.put(`/empresas/${id}`, data, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  return res.data;
};

// Eliminar empresa
export const deleteEmpresa = async (id) => {
  const res = await api.delete(`/empresas/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
