
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api"; 

export const getAllProducts = async () => {
    return axios.get(`${API_BASE_URL}/menu`);
  };
  
  export const getProductByName = async (name: string) => {
    return axios.get(`${API_BASE_URL}/product/${name}`);
  };