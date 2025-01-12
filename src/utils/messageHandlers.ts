import { getFAQByKeyword } from "../services/FAQ-service";
import { getAllProducts } from "../services/product-service";
import { verifyProducts, createOrder, parseOrder } from "../services/order-service";

// Maneja las preguntas frecuentes
export const handleFAQ = async (userInput: string) => {
    const keywords = userInput.replace("pregunta sobre ", "").trim();
    try {
        const faqResponse = await getFAQByKeyword(keywords);

        console.log("Respuesta de búsqueda de FAQ por palabra clave:", faqResponse);
        if (faqResponse.data && faqResponse.data.length > 0) {
            const faq = faqResponse.data[0];
            return faq.answer;
        } else {
            return "No encontré resultados para tu búsqueda.";
        }
    } catch (error) {
        console.error("Error al buscar FAQ:", error);
        return "Hubo un problema al buscar preguntas frecuentes. Por favor, intenta nuevamente.";
    }
};

// Maneja el menú de productos
export const handleProductMenu = async () => {
    try {
        const productResponse = await getAllProducts();//función para obtener los productos
        console.log("Respuesta del menú:", productResponse);

        if (productResponse.data && productResponse.data.length > 0) {
            const products = productResponse.data;

            const productStrings = products.map((product: any) => {
                return `**${product.name}**\n${product.description}\nPrecio: $${product.price}\n`;
            });

            return `Aquí tienes nuestro menú:\n\n${productStrings.join("")}`;
        } else {
            return "No encontré productos en el menú.";
        }
    } catch (error) {
        console.error("Error al obtener el menú:", error);
        return "Hubo un problema al obtener el menú. Por favor, intenta nuevamente.";
    }
};

// Maneja los pedidos de productos
export const handleOrder = async (userInput: string, menuCache: any[], currentOrder: any[]): Promise<string> => {

    //parsear el mensaje del usuario para extraer los productos
    const parsedOrder = parseOrder(userInput, menuCache); //ahora solo tenemos los nombres de los productos

    console.log("Productos identificados:", parsedOrder);

    if (parsedOrder.length === 0) {
        return "No entendí tu pedido. Por favor, menciona productos y cantidades.";
    }

    const { validProducts, invalidProducts } = await verifyProducts(parsedOrder);

    validProducts.forEach((item) => {
        const existingItem = currentOrder.find((p) => p.name === item.name);
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            currentOrder.push({ name: item.name, quantity: item.quantity, price: item.details.price });
        }
    });

    let response = "Tu pedido ha sido actualizado:\n " + currentOrder.map((item) => {
        return `- ${item.quantity} x ${item.name} ($${item.price} c/u)\n`;
    });
    if (invalidProducts.length > 0) {
        response += "Algunos productos no fueron encontrados en el menú. ¿Quieres ver el menú?";
    } else {
        response += "¿Deseas agregar algo más o finalizar tu pedido?";
    }

    return response;
};

//muestra la orden actual
export const handleViewOrder = (currentOrder: any[]): string => {
    if (currentOrder.length === 0) {
        return "No tienes ningún producto en tu pedido. ¿Quieres agregar algo?";
    }

    let response = "Aquí está tu pedido actual:\n";
    currentOrder.forEach((item) => {
        response += `- ${item.quantity} x ${item.name} ($${item.price} c/u)\n`;
    });

    response += "¿Deseas agregar algo más o finalizar tu pedido?";
    return response;
};

// Finaliza el pedido
export const handleFinalizeOrder = async (currentOrder: any[], menuCache: any[]) => {
    if (currentOrder.length === 0) {
        return "No tienes productos en tu pedido. ¿Quieres agregar algo?";
    }

    try {
        const orderData = {
            //mapea los productos usando el cache
            products: currentOrder.map((item) => {
                const productInCache = menuCache.find((p) => p.name === item.name);
                if (!productInCache) {
                    throw new Error(`Producto no encontrado en el menú: ${item.name}`);
                }
                return {
                    product: productInCache._id,//usa el ID del cache
                    quantity: item.quantity,
                };
            }),
        };

        await createOrder(orderData);//envia la orden
        currentOrder.length = 0; //limpia el array de la orden
        return "¡Tu pedido ha sido enviado exitosamente! Pronto nos pondremos en contacto contigo.";
    } catch (error) {
        console.error("Error al enviar el pedido:", error);
        return "Hubo un problema al procesar tu pedido. Por favor, inténtalo nuevamente.";
    }
};
