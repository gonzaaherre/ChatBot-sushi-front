import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api"; 

export const getAllFAQs = async () => {
    return axios.get(`${API_BASE_URL}/faq`);
  };
  
  export const getFAQByKeyword =  async (keywords: string) => {
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