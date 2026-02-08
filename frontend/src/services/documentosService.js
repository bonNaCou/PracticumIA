import api from "./api";

export const getDocumentos = async () => {
  const res = await api.get("/documentos");
  return res.data;
};

export const uploadDocumento = async (formData) => {
  const res = await api.post("/documentos/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteDocumento = async (id) => {
  const res = await api.delete(`/documentos/${id}`);
  return res.data;
};
