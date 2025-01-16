import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const getAllFAQs = async () => {
  return axios.get(`${API_BASE_URL}/faq`);
};

export const getFAQByKeyword = async (keywords: string) => {
  return axios.post(
    `${API_BASE_URL}/faq/search`,
    { keywords }, // Cuerpo de la solicitud
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};