import React, { useState } from "react";
import chatbotImg from "../assets/chatbot.jpg";
import "./chatBot.css";
import {
  getAllFAQs,
  getFAQByKeyword,
} from "../services/FAQ-service";
import {
  getAllProducts,
  getProductByName,
} from "../services/product-service";
import { createOrder, } from "../services/order-service";

import { getMessageType } from "../utils/typeMessage";


const ChatBot = () => {
  // Estado para mensajes y entrada del usuario
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [userInput, setInput] = useState("");

  // Manejar el envío del mensaje
  const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    try {
      if (e) e.preventDefault(); // Evitar el envío vacío

      if (!userInput.trim()) return;

      const userMessage = {
        role: "user",
        content: userInput,
      };

      console.log("Mensaje del usuario:", userMessage);

      // Actualizar el estado con el nuevo mensaje
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // Determinar el tipo de mensaje y obtener respuesta del bot
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
                // Accede al primer elemento del array
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
            const products = await getAllProducts();
            console.log("Respuesta de productos:", products);
            botResponse =
              products.data.length > 0
                ? `Aquí tienes nuestro menú: ${products.data
                  .map((product: any) => product.name)
                  .join(", ")}`
                : "No encontré productos en el menú.";
            break;

          case "order":
            console.log("Mensaje de orden identificado.");
            botResponse =
              "¿Podrías confirmar qué producto te gustaría ordenar y cuántos?";
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

      // Agregar la respuesta del bot al estado
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "bot", content: botResponse },
      ]);

      setInput(""); // Limpiar el campo de entrada después de enviar el mensaje
    } catch (error) {
      console.error("Error en handleSubmit:", error);
    }
  };

  // Manejar el envío con Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Evitar el salto de línea
      handleSubmit(); // Llamar a la función de envío
    }
  };

  return (
    <div className="chatbot-container">
      <img src={chatbotImg} alt="Chatbot" className="chatbot-image" />

      <div className="conversation">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role === "user" ? "user" : "bot"}`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <form className={"centered-form"} action={""} onSubmit={handleSubmit}>
        <textarea
          className={"form-control"}
          name="textAreaInput"
          id="textAreaInput"
          cols={50}
          rows={5}
          value={userInput} // Conectar el value al estado para eliminarlo después
          onChange={(e) => setInput(e.target.value)} // Setear en tiempo real
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