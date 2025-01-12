import { useState } from 'react'
import './App.css'
import Chatbot from "./components/chatBot"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Chatbot></Chatbot>
    </>
  )
}

export default App
