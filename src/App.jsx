import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'model',
      parts: [
        {
          text: "Hi there! 👋 What industry or service are you interested in? For example: real estate, insurance, or SaaS.",
        },
      ],
    },
  ]);
  const [answer, setAnswer] = useState('');

  // Parse **bold** text
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

  // Ask question
  async function handleAsk() {
    if (!question.trim()) return;

    setAnswer('Generating answer...');
    const newMessages = [
      ...messages,
      { role: 'user', parts: [{ text: question }] },
    ];
    setMessages(newMessages);

    try {
      const res = await axios.post('/api/gemini', {
        messages: newMessages,
      });

      const botReply = res.data.response;

      const updatedMessages = [
        ...newMessages,
        { role: 'model', parts: [{ text: botReply }] },
      ];
      setMessages(updatedMessages);
      setAnswer('');
      setQuestion('');
    } catch (error) {
      console.error('Frontend error:', error?.response?.data || error.message);
      setAnswer('Error generating answer.');
    }
  }

  // Clear chat
  function clearChat() {
    setMessages([
      {
        role: 'model',
        parts: [
          {
            text: "Hi there! 👋 What industry or service are you interested in? For example: real estate, insurance, or SaaS.",
          },
        ],
      },
    ]);
    setQuestion('');
    setAnswer('');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl md:text-6xl font-extrabold text-blue-700 mb-6 text-center">
        LEAD QUALIFYING CHATBOT!
      </h1>

      <div className="bg-blue-400 shadow-lg rounded-xl p-8 w-full max-w-xl flex flex-col items-center">
        <input
          type="text"
          placeholder="Ask your question..."
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
        />
        <div className="flex space-x-4">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            onClick={handleAsk}
          >
            Ask
          </button>
          <button
            className="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-100 transition"
            onClick={clearChat}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-8 w-full max-w-xl bg-white rounded-xl shadow-md p-6 space-y-3">
        <h2 className="text-xl font-bold text-gray-700">Chat History:</h2>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`text-lg px-3 py-2 rounded ${
              msg.role === 'user'
                ? 'bg-gray-200 text-right'
                : 'bg-gray-100 text-left'
            }`}
          >
            {parseBold(msg.parts[0].text)}
          </div>
        ))}
        {answer && (
          <div className="text-red-600 font-semibold mt-2">{answer}</div>
        )}
      </div>
    </div>
  );
}

export default App;
