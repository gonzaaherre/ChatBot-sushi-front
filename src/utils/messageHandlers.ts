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

            return `Aquí tienes nuestro menú:\n\n${productStrings.join("\n")}`;
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

    const modifyRegex = /modificar (\d+) (\w.+)/i;
    const removeRegex = /eliminar (\w.+)/i;

    const modifyMatch = userInput.match(modifyRegex);
    const removeMatch = userInput.match(removeRegex);

    if (modifyMatch) {
        const newQuantity = parseInt(modifyMatch[1], 10);
        const productName = modifyMatch[2]
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""); //normalizar el nombre

        const productToModify = currentOrder.find((item) =>
            item.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") === productName
        );

        if (productToModify) {
            if (newQuantity > 0) {
                productToModify.quantity = newQuantity;
                return `La cantidad de ${productToModify.name} ha sido actualizada a ${newQuantity}.\n\n` + formatCurrentOrder(currentOrder);
            } else {
                currentOrder.splice(currentOrder.indexOf(productToModify), 1); // Eliminar el producto si la cantidad es 0
                return `${productToModify.name} ha sido eliminado de tu pedido.\n\n` + formatCurrentOrder(currentOrder);
            }
        } else {
            return `No encontré ${productName} en tu pedido. Por favor verifica el nombre e intenta de nuevo.`;
        }
    }

    if (removeMatch) {
        console.log("Eliminando:", removeMatch[1]);
        const productName = removeMatch[1]
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""); // Normalizar el nombre
        console.log("Producto a eliminar 1:", productName);

        const productToRemove = currentOrder.find((item) =>
            item.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") === productName
        );
        if (productToRemove) {
            currentOrder.splice(currentOrder.indexOf(productToRemove), 1); // Eliminar el producto
            return `${productToRemove.name} ha sido eliminado de tu pedido.\n\n` + formatCurrentOrder(currentOrder);
        } else {
            return `No encontré ${productName} en tu pedido. Por favor verifica el nombre e intenta de nuevo.`;
        }
    }
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
    return buildOrderResponse(currentOrder, invalidProducts);



    // const total = calculaTotal(currentOrder);

    // let response = "Tu pedido ha sido actualizado:\n";
    // response += currentOrder.map((item) => {
    //     return `- ${item.quantity} x ${item.name} ($${item.price} c/u)`;
    // }).join("\n"); // Unir las líneas con un salto de línea, no con una coma.

    // response += `\nTotal: $${total.toFixed(2)}\n`;
    // if (invalidProducts.length > 0) {
    //     response += "Algunos productos no fueron encontrados en el menú. ¿Quieres ver el menú?";
    // } else {
    //     response += "¿Deseas agregar algo más o finalizar tu pedido?";
    // }

    // return response;
};
// Función para formatear el pedido actual
const formatCurrentOrder = (currentOrder: any[]): string => {
    if (currentOrder.length === 0) {
        return "Tu pedido está vacío.";
    }

    const total = calculaTotal(currentOrder);

    let response = "Tu pedido actual:\n";
    response += currentOrder
        .map((item) => `- ${item.quantity} x ${item.name} ($${item.price} c/u)`)
        .join("\n");
    response += `\nTotal actual: $${total.toFixed(2)}`;
    return response;
};

// Función para construir la respuesta del pedido
const buildOrderResponse = (currentOrder: any[], invalidProducts: any[]): string => {
    let response = formatCurrentOrder(currentOrder);

    if (invalidProducts.length > 0) {
        response += "\nAlgunos productos no fueron encontrados en el menú. ¿Quieres ver el menú?";
    } else {
        response += "\n¿Deseas agregar algo más o finalizar tu pedido?";
    }

    return response;
};

//muestra la orden actual
export const handleViewOrder = (currentOrder: any[]): string => {
    if (currentOrder.length === 0) {
        return "No tienes ningún producto en tu pedido. ¿Quieres agregar algo?";
    }

    let response = "Aquí está tu pedido actual:\n";
    const total = calculaTotal(currentOrder);
    currentOrder.forEach((item) => {
        response += `- ${item.quantity} x ${item.name} ($${item.price} c/u)\n`;

    });
    response += `Total actual: $${total.toFixed(2)}\n `;
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
const calculaTotal = (currentOrder: any[]): number => {
    return currentOrder.reduce((sum, item) => sum + item.quantity * item.price, 0);
};
