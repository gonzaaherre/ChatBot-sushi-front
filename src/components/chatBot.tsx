import React, { useEffect, useState } from "react";
import chatbotImg from "../assets/chatbot.jpg";
import "./chatBot.css";
import { getFAQByKeyword } from "../services/FAQ-service";
import { initializeMenuCache, parseOrder, verifyProducts, createOrder } from "../services/order-service";
import { getMessageType } from "../utils/typeMessage";
import { getAllProducts } from "../services/product-service";


const ChatBot = () => {
  //estado para mensajes y entrada del usuario
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [userInput, setInput] = useState("");
  const [menuCache, setMenuCache] = useState<any[]>([]);
  const [currentOrder, setCurrentOrder] = useState<
    { name: string; quantity: number; price?: number }[]
  >([]);

  useEffect(() => {
    const loadMenuCache = async () => {
      const response = await initializeMenuCache();
      setMenuCache(response || []);
    };
    loadMenuCache();
  }, []);

  //manejar el envío del mensaje
  const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    try {
      if (e) e.preventDefault(); //evitar el envío vacío

      if (!userInput.trim()) return;

      const userMessage = {
        role: "user",
        content: userInput,
      };

      console.log("Mensaje del usuario:", userMessage);

      //actualizar el estado con el nuevo mensaje
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      //determinar el tipo de mensaje y obtener respuesta del bot
      const messageType = getMessageType(userInput);
      console.log("Tipo de mensaje identificado:", messageType);

      let botResponse = "";

      try {

        switch (messageType) {
          // case "faq":
          //   const faqs = await getAllFAQs();
          //   console.log("Respuesta de FAQs:", faqs);
          //   botResponse =
          //     faqs.data.length > 0
          //       ? `Aquí tienes las preguntas frecuentes: ${faqs.data
          //           .map((faq: any) => faq.question)
          //           .join(", ")}`
          //       : "No encontré preguntas frecuentes.";
          //   break;

          case "saludo":
            botResponse = "¡Hola! ¿En qué puedo ayudarte?";
            break;

          case "faq":
            const keywords = userInput.replace("pregunta sobre ", "").trim();
            try {
              const faqResponse = await getFAQByKeyword(keywords);

              console.log("Respuesta de búsqueda de FAQ por palabra clave:", faqResponse);

              if (faqResponse.data && faqResponse.data.length > 0) {
                //accede al primer elemento del array
                const faq = faqResponse.data[0];
                botResponse = faq.answer;//`Pregunta: ${faq.question}\nRespuesta: ${faq.answer}`;
              } else {
                botResponse = "No encontré resultados para tu búsqueda.";
              }
            } catch (error) {
              console.error("Error al buscar FAQ:", error);
              botResponse = "No encontré resultados para tu búsqueda.. Por favor, intenta nuevamente.";
            }
            break;

          case "product":
            const productResponse = await getAllProducts(); //función para obtener los productos
            console.log("Respuesta del menú:", productResponse);

            if (productResponse.data && productResponse.data.length > 0) {
              const products = productResponse.data;

              const productStrings = products.map((product: any) => {
                return `**${product.name}**\n${product.description}\nPrecio: $${product.price}\n`;
              });

              botResponse = `Aquí tienes nuestro menú:\n\n${productStrings.join("")}`;
            } else {
              botResponse = "No encontré productos en el menú.";
            }
            break;


          case "order":
            console.log("Mensaje de orden identificado.", userInput);

            //parsear el mensaje del usuario para extraer los productos
            const parsedOrder = parseOrder(userInput, menuCache); //ahora solo tenemos los nombres de los productos

            // const productNames = parsedOrder.map((item) => item.name);

            console.log("Productos identificados:", parsedOrder);

            if (parsedOrder.length === 0) {
              botResponse = "No entendí tu pedido. Por favor, menciona productos y cantidades.";
              break;
            }

            const { validProducts, invalidProducts } = await verifyProducts(parsedOrder);
            // if (validProducts.length > 0) {
            //   validProducts.forEach((item: any) => {
            //     botResponse += `- ${item.quantity} x ${item.name} ($${item.details.price} c/u)\n`;
            //   });
            // }

            // if (invalidProducts.length > 0) {
            //   botResponse += "\nNo encontramos estos productos en el menú:\n";
            //   invalidProducts.forEach((item: any) => {
            //     botResponse += `- ${item.quantity} x ${item.name}\n`;
            //   });
            //   botResponse += "¿Quieres ver el menú para seleccionar otros productos?";
            // }

            // Actualizar el estado de la orden temporal con los productos válidos
            setCurrentOrder((prevOrder) => {
              const updatedOrder = [...prevOrder];
              validProducts.forEach((item) => {
                const existingItem = updatedOrder.find((p) => p.name === item.name);
                if (existingItem) {
                  existingItem.quantity += item.quantity; // Actualiza cantidad
                } else {
                  updatedOrder.push({ name: item.name, quantity: item.quantity, price: item.details.price });
                }
              });
              return updatedOrder;
            });

            botResponse = "Tu pedido ha sido actualizado. ";
            if (invalidProducts.length > 0) {
              botResponse += "Algunos productos no fueron encontrados en el menú. ¿Quieres ver el menú?";
            } else {
              botResponse += "¿Deseas agregar algo más o finalizar tu pedido?";
            }
            break;


          case "ver orden":
            if (currentOrder.length === 0) {
              botResponse = "No tienes ningún producto en tu pedido. ¿Quieres agregar algo?";
            } else {
              botResponse = "Aquí está tu pedido actual:\n";
              currentOrder.forEach((item) => {
                botResponse += `- ${item.quantity} x ${item.name} ($${item.price} c/u)\n`;
              });
              botResponse += "¿Deseas agregar algo más o finalizar tu pedido?";
            }
            break;


          case "finalizar pedido":
            if (currentOrder.length === 0) {
              botResponse = "No tienes productos en tu pedido. ¿Quieres agregar algo?";
            } else {
              try {
                //mapea los productos usando el cache
                const orderData = {
                  products: currentOrder.map((item) => {
                    const productInCache = menuCache.find((p) => p.name === item.name);
                    if (!productInCache) {
                      throw new Error(`Producto no encontrado en el menú: ${item.name}`);
                    }
                    return {
                      product: productInCache._id, // Usa el ID del caché
                      quantity: item.quantity,
                    };
                  }),
                };

                await createOrder(orderData); // Envía la orden
                setCurrentOrder([]); // Limpia la orden después de enviarla
                botResponse =
                  "¡Tu pedido ha sido enviado exitosamente! Pronto nos pondremos en contacto contigo.";
              } catch (error) {
                console.error("Error al enviar el pedido:", error);
                botResponse =
                  "Hubo un problema al procesar tu pedido. Por favor, inténtalo nuevamente.";
              }
            }
            break;

          default:
            console.log("Mensaje no reconocido.");
            botResponse = "Lo siento, no entiendo tu mensaje.";
            break;
        }
      } catch (error) {
        console.error("Error interno en el procesamiento del bot:", error);
        botResponse = "Hubo un error al procesar tu solicitud.";
      }

      console.log("Respuesta del bot:", botResponse);

      //agregar la respuesta del bot al estado
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "bot", content: botResponse },
      ]);

      setInput(""); //limpiar el campo de entrada después de enviar el mensaje
    } catch (error) {
      console.error("Error en handleSubmit:", error);
    }
  };

  //manejar el envío con Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); //evitar el salto de línea
      handleSubmit(); //lLlamar a la función de envío
    }
  };

  return (
    <div className="chatbot-container">
      <img src={chatbotImg} alt="Chatbot" className="chatbot-image" />

      <div className="conversation">
        {messages.map((msg, index) => (
          <p
            key={index}
            className={`message ${msg.role === "user" ? "user" : "bot"}`}
          >
            {msg.content}
          </p>
        ))}
      </div>

      <form className={"centered-form"} action={""} onSubmit={handleSubmit}>
        <textarea
          className={"form-control"}
          name="textAreaInput"
          id="textAreaInput"
          cols={50}
          rows={5}
          value={userInput} //conectar el value al estado para eliminarlo después
          onChange={(e) => setInput(e.target.value)} //setear en tiempo real
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          style={{ fontSize: 14, padding: 10 }}
        ></textarea>
        <button>Enviar</button>
      </form>
    </div>
  );
};

export default ChatBot;