import React, { useState } from "react";
import chatbotImg from "../assets/chatbot.jpg";
import "./chatBot.css";


const ChatBot = () => {
  
  //estado para mensajes y entrada del usuario
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [userInput, setInput] = useState("");

  const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {

    if (e) e.preventDefault()//para que no se envie el mensaje vacio

    if (!userInput.trim()) return;

    const userMessage = {
      role: "user",
      content: userInput,
    };

    //actualizamos el estado con el nuevo mensaje
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setInput(""); //limpiar el campo de entrada después de enviar el mensaje

    };

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
          value={userInput} //conectamos el value al estado para q se elimine
          onChange={(e) => setInput(e.target.value)}//seteamos en tiempo real cuando se hace un cambio
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          style={{ fontSize: 14, padding: 10 }}
        ></textarea>
        <button>Enviar</button>
      </form>
    </div>
  );
}
export default ChatBot;
