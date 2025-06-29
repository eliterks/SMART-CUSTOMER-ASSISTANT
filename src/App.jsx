import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")

  // Helper function to parse **bold** text
  function parseBold(text) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  // This function is called when the button is clicked
  async function handleAsk() {
    try {
      setAnswer("Generating answer...");
      const response = await axios.post('http://localhost:5000/api/gemini', {
        question
      });

      setAnswer(response.data.candidates[0].content.parts[0].text);
    } catch (error) {
      setAnswer("Error generating answer.");
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {/* Title */}
      <h1 className="text-6xl font-extrabold text-blue-700 mb-8">LEAD QUALIFYING CHATBOT!</h1>
      
      {/* Question Box */}
      <div className="bg-blue-400 shadow-lg rounded-xl p-8 w-full max-w-xl flex flex-col items-center">
        <input
          type="text"
          placeholder="Ask your question..."
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          onClick={handleAsk}
        >
          Ask
        </button>
      </div>

      {/* Response Box */}
      {answer && (
        <div className="mt-8 w-full max-w-xl bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-2 text-gray-700">Response:</h2>
          <div className="text-lg text-gray-800">
            {parseBold(answer)}
          </div>
        </div>
      )}
    </div>
  );
}

export default App