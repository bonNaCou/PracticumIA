/**
 * Servicio de gestión de documentos.
 * Encapsula todas las llamadas HTTP relacionadas con documentos.
 * Utiliza Axios para comunicarse con el backend.
 */

import axios from "axios";

// URL base del backend
const API_URL = "http://localhost:4000";

/**
 * Obtiene los encabezados de autenticación usando el token almacenado.
 * @returns {Object} Headers con el token Bearer.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`
  };
};

/**
 * Obtiene la lista de documentos almacenados en el servidor.
 * @returns {Promise<Array>} Lista de documentos.
 */
export const getDocumentos = async () => {
  const response = await axios.get(`${API_URL}/documentos`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

/**
 * Sube un documento al servidor.
 * IMPORTANTE: No se debe establecer manualmente "Content-Type".
 * Axios detecta automáticamente FormData y genera el boundary necesario.
 *
 * @param {FormData} formData - FormData con el archivo a subir.
 * @returns {Promise<Object>} Documento creado.
 */
export const uploadDocumento = async (formData) => {
  const response = await axios.post(
    `${API_URL}/documentos/upload`,
    formData,
    {
      headers: {
        ...getAuthHeaders()
        // NO agregar "Content-Type": "multipart/form-data"
        // Axios lo maneja automáticamente
      }
    }
  );
  return response.data;
};

/**
 * Elimina un documento por ID.
 * @param {number} id - ID del documento a eliminar.
 * @returns {Promise<Object>} Respuesta del servidor.
 */
export const deleteDocumento = async (id) => {
  const response = await axios.delete(
    `${API_URL}/documentos/${id}`,
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};
