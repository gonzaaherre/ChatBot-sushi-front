import axios from "axios";
import { getAllProducts, getProductByName } from "./product-service";

const API_BASE_URL = "http://localhost:3000/api";

let menuCache: Array<{ name: string }> = [] // Caché del menú

//cargar menu al iniciar
export const initializeMenuCache = async () => {
  try {
    const response = await getAllProducts();
    if (response.data) {
      menuCache = response.data;
    }
    console.log("Caché del menú inicializado:", menuCache);
    return menuCache; // <--- Add this line
  } catch (error) {
    console.error("Error al inicializar el caché del menú:", error);
  }
};

//verificar si un producto existe
export const verifyProduct = async (productName: string) => {
  try {
    const cachedProduct = menuCache.find(
      (product) => product.name.toLowerCase() === productName.toLowerCase()
    );

    if (cachedProduct) {
      console.log("Producto encontrado en caché:", cachedProduct);
      return cachedProduct; //producto encontrado en caché
    }

    console.log("product enviado al back :", productName);
    const response = await getProductByName(productName); //rnviar solo el nombre del producto

    if (response && response.data) {  //verificar que la respuesta sea válida
      console.log("Producto encontrado en el backend:", response.data);
      return response.data; //producto encontrado en el backend
    } else {
      throw new Error("Producto no encontrado en el backend.");
    }
  } catch (error) {
    console.error("Error al buscar el producto en el backend:", error);
    return null;  //retornar null si no se encuentra el producto
  }
};



//procesar varios productos
export const verifyProducts = async (parsedOrder: { name: string, quantity: number }[]) => {
  const results = await Promise.all(
    parsedOrder.map(async ({ name, quantity }) => {
      //encuentra el producto y obtiene sus detalles
      console.log("Verificando producto:", name);
      const product = await verifyProduct(name);

      //eerificar si el producto existe
      const exists = !!product;

      //retornar el producto y su existencia junto con la cantidad
      return {
        name,
        quantity,
        exists,
        details: exists ? product : null, //asegurarse de que 'details' sea null si no existe
      };
    })
  );

  //filtrar productos válidos e inválidos
  const validProducts = results.filter((item) => item.exists);
  const invalidProducts = results.filter((item) => !item.exists);

  return { validProducts, invalidProducts };
};



export const createOrder = async (orderData: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/order`, orderData);
    console.log("Orden creada exitosamente:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al crear la orden:", error);
    throw error;
  }
};

export const parseOrder = (orderMessage: string, cachedMenu: Array<{ name: string }>) => {
  const parsedProducts: { quantity: number; name: string }[] = [];

  //normalizar el mensaje
  const normalizedMessage = orderMessage
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") //eliminar tildes
    .toLowerCase()
    .replace(/[\?\s]+/g, " "); //reemplazar signos de interrogación y espacios por un solo espacio

  console.log("Mensaje normalizado:", normalizedMessage);

  cachedMenu.forEach((product) => {
    //normalizar el nombre del producto
    const normalizedName = product.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") //eliminar tildes
      .toLowerCase();

    console.log("Buscando producto en caché:", normalizedName);

    //usar una expresión regular para buscar coincidencias de productos en el mensaje
    const regex = new RegExp(`(\\d+)\\s+.*${normalizedName}.*`, "gi");
    let match;

    // Buscar coincidencias con el nombre del producto
    while ((match = regex.exec(normalizedMessage)) !== null) {
      const quantity = match[1] ? parseInt(match[1], 10) : 1;  //si no hay cantidad, por defecto sera 1
      console.log(`Producto encontrado: ${product.name} con cantidad: ${quantity}`);
      parsedProducts.push({ quantity, name: product.name });
    }
  });

  console.log("Productos parseados:", parsedProducts);
  return parsedProducts;
};








