export const getMessageType = (message: string) => {
  const lowerMessage = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
    if (lowerMessage.includes("menu") || lowerMessage.includes("producto")) {
      return "product";
    }
    
    if (
      lowerMessage.includes("hola")
    ) {
      return "saludo";
    }
    if (
      lowerMessage.includes("pedido") ||
      lowerMessage.includes("orden") ||
      lowerMessage.includes("quiero")
    ) {
      return "order";
    }
  
    return "faq";
  };
  