
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const getAllProducts = async () => {
  return axios.get(`${API_BASE_URL}/menu`);
};

export const getProductByName = async (name: string) => {
  return axios.post(`${API_BASE_URL}/menu/name`, { name });
};
