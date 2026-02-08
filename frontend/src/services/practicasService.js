import api from "./api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getPracticas = async () => {
  const res = await api.get("/practicas", {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const createPractica = async (data) => {
  const res = await api.post("/practicas", data, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  return res.data;
};

export const updatePractica = async (id, data) => {
  const res = await api.put(`/practicas/${id}`, data, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  return res.data;
};

export const deletePractica = async (id) => {
  const res = await api.delete(`/practicas/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
