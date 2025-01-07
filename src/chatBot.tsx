import React, { useState } from "react";

const ChatBot = () => {
  // Estado para mensajes y entrada del usuario
  const [messages, setMessages] = useState([]);
  const [userInput, setInput] = useState("");

  return (
    <div>
      <h1>ChatBot</h1>
      <div>
        <img src="" alt="ChatBot Logo" />
      </div>
      <div className="conversation">
      </div>
      <form>
        <textarea
            name="textAreaInput"
            id="textAreaInput"
            cols={70} 
            rows={10} 
            value={userInput} 
            onChange={(e) => setInput(e.target.value)} // Actualiza el estado con el texto ingresado
            placeholder="Escribe un mensaje"
        />
      </form>
    </div>
  );
};

export default ChatBot;
