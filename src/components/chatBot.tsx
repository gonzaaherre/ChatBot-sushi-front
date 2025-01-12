import React, { useEffect, useState } from "react";
import chatbotImg from "../assets/chatbot.jpg";
import "./chatBot.css";
import { initializeMenuCache, parseOrder, verifyProducts, createOrder } from "../services/order-service";
import { handleUserMessage } from "../utils/handleUserMessage ";


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