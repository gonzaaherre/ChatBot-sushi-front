import axios from "axios";
import { getAllProducts, getProductByName } from "./product-service";

const API_BASE_URL = "http://localhost:3000/api";

let menuCache: any[] = []; // Caché del menú

//cargar menu al iniciar
export const initializeMenuCache = async () => {
  try {
    const response = await getAllProducts();
    if (response.data) {
      menuCache = response.data;
    }
  } catch (error) {
    console.error("Error al inicializar el caché del menú:", error);
  }
};

//verificar si un producto existe
export const verifyProduct = async (productName: string) => {
  // Buscar en el caché solo con el nombre del producto
  const cachedProduct = menuCache.find(
    (product) => product.name.toLowerCase() === productName.toLowerCase()
  );

  if (cachedProduct) {
    return cachedProduct; // Producto encontrado en caché
  }

  // Si no está en el caché, consultar al backend
  try {
    const response = await getProductByName(productName); // Enviar solo el nombre del producto
    if (response && response.data) {  // Verificar que la respuesta sea válida
      return response.data; // Producto encontrado en el backend
    } else {
      throw new Error("Producto no encontrado en el backend.");
    }
  } catch (error) {
    console.error("Error al buscar el producto en el backend:", error);
    return null;  // Retornar null si no se encuentra el producto
  }
};



//procesar varios productos
export const verifyProducts = async (parsedOrder: string[]) => {
  const results = await Promise.all(
    parsedOrder.map(async (productName) => {
      //encuentra el producto y obtiene sus detalles
      const product = await verifyProduct(productName);
      return {
        name: productName,
        exists: !!product,
        details: product || null,
        quantity: 1,
      };
    })
  );

  // Filtrar productos válidos e inválidos
  const validProducts = results.filter((item) => item.exists);
  const invalidProducts = results.filter((item) => !item.exists);

  return { validProducts, invalidProducts };
};



export const createOrder = async (orderData: any) => {
  return axios.post(`${API_BASE_URL}/order`, orderData);
};


// expresion regular: Entrada: "Quiero 2 rolls de salmón y 3 makis de atún."
//Salida: ["2 rolls de salmón", "3 makis de atún"]
export const parseOrder = (orderMessage: string) => {
  // Buscar productos en el mensaje (ejemplo: "2 rolls de salmón", "3 makis de atún")
  const productPattern = /(\d+)\s*(rolls?|makis?|sushis?|arroz|salmón|atún)/gi;
  const matches = orderMessage.match(productPattern);

  // Extraer solo los nombres de los productos
  if (matches) {
    return matches.map((match) => {
      const words = match.split(' ');
      return words.slice(1).join(' ');  // Devolver solo el nombre del producto (sin la cantidad)
    });
  }
  return [];
};


