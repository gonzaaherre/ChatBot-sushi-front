import { handleFAQ, handleFinalizeOrder, handleOrder, handleProductMenu, handleViewOrder } from "./messageHandlers";
import { getMessageType } from "./typeMessage";

export const handleUserMessage = async (userInput: string, menuCache: any[], currentOrder: any[]) => {
    const messageType = getMessageType(userInput);
    console.log("Tipo de mensaje identificado:", messageType);
    let botResponse = "";

    switch (messageType) {
        case "saludo":
            botResponse = "¡Hola! ¿En qué puedo ayudarte?";
            break;
        case "faq":
            botResponse = await handleFAQ(userInput);
            break;
        case "product":
            botResponse = await handleProductMenu();
            break;
        case "order":
            botResponse = await handleOrder(userInput, menuCache, currentOrder);
            break;
        case "ver orden":
            botResponse = handleViewOrder(currentOrder);
            break;
        case "finalizar pedido":
            botResponse = await handleFinalizeOrder(currentOrder, menuCache);
            break;
        default:
            botResponse = "Lo siento, no entiendo tu mensaje.";
            break;
    }

    return botResponse;
};
