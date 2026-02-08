import api from "./api";

export async function getIALogs() {
  const token = localStorage.getItem("token");

  return axios.get("http://localhost:4000/ia_logs", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then((res) => res.data)
  .catch((err) => {
    throw err;
  });
}
