import React, { useEffect, useState } from "react";
import chatbotImg from "../assets/chatbot.jpg";
import "./chatBot.css";
import { initializeMenuCache } from "../services/order-service";
import { handleUserMessage } from "../utils/handleUserMessage ";


const ChatBot = () => {
  //estado para mensajes y entrada del usuario
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([{
    role: "bot",
    content: `¡Hola! Bienvenido al bot de pedidos de sushi. 🎉🍣\n
Estas son algunas cosas que puedes hacer:
1. *Ver nuestro menú*: Solo escribe "¿Qué tienen en el menú?" o "Muéstrame el menú".
2. *Hacer un pedido*: Puedes decir algo como "Quiero 2 Roll California, 1 Roll Tempura".
3. *Preguntar algo*: Por ejemplo, "¿Están abiertos?" o "¿Hacen entregas a domicilio?".
4. *Ver tu pedido*: Escribe "Ver pedido?" para revisar los productos que has agregado.
5. *Finalizar tu pedido*: Escribe "Finalizar pedido" para confirmar y enviar tu orden.

¡Estoy aquí para ayudarte! ¿Qué te gustaría hacer primero?`,
  },
  ]);
  const [userInput, setInput] = useState("");
  const [menuCache, setMenuCache] = useState<any[]>([]);
  const [currentOrder] = useState<
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
    if (e) e.preventDefault(); //evitar el envío vacío

    if (!userInput.trim()) return;

    const userMessage = {
      role: "user",
      content: userInput,
    };

    console.log("Mensaje del usuario:", userMessage);

    //actualizar el estado con el nuevo mensaje
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const botResponse = await handleUserMessage(userInput, menuCache, currentOrder);
    setMessages((prev) => [...prev, { role: "bot", content: botResponse }]);

    setInput("");
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