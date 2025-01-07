import { useState } from 'react'
import './App.css'
import Chatbot from "./chatBot"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
       <Chatbot></Chatbot>
    </>
  )
}

export default App
