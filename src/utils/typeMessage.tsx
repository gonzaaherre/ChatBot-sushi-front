export const getMessageType = (message: string) => {
  const lowerMessage = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (lowerMessage.includes("menu") || lowerMessage.includes("producto") || lowerMessage.includes("comidas")) {
    return "product";
  }
  if (lowerMessage.includes("ver pedido")) {
    return "ver orden";
  }
  if (lowerMessage.includes("finalizar pedido")) {
    return "finalizar pedido";
  }

  if (
    lowerMessage.includes("hola")
  ) {
    return "saludo";
  }
  if (
    //lowerMessage.includes("pedido") ||
    lowerMessage.includes("eliminar") ||
    lowerMessage.includes("quiero") ||
    lowerMessage.includes("modificar")
  ) {
    return "order";
  }

  return "faq";
};
