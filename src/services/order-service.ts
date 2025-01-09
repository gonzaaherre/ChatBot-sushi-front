import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api"; 
export const createOrder = async (orderData: any) => {
    return axios.post(`${API_BASE_URL}/order`, orderData);
  };