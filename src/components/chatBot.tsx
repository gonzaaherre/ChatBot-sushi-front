import React, { useState } from "react";
import chatbotImg from "../assets/chatbot.jpg";
import "./chatBot.css";

const ChatBot = () => {
  // Estado para mensajes y entrada del usuario
  const [messages, setMessages] = useState([]);
  const [userInput, setInput] = useState("");


  return (
    <div className="chatbot-container">
      <img src={chatbotImg} alt="Chatbot" className="chatbot-image" />
      <div className="conversation" style={{ height: 350, overflowY: 'auto' }}>
        <h1>¡Hola! ¿Cómo puedo ayudarte?</h1>
        {/* Los mensajes irían aquí en el futuro */}
      </div>
      <form action="">
        <textarea
          name="textAreaInput"
          id="textAreaInput"
          cols={50}
          rows={5}
          placeholder="Escribe un mensaje..."
          style={{ fontSize: 14, padding: 10 }}
        ></textarea>
        <button>Enviar</button>
      </form>
    </div>
  );
}
export default ChatBot;
