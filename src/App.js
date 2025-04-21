import React, { useState, useEffect, useRef } from "react";
import "./index.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatWindowRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Show typing indicator
    setIsTyping(true);

    try {
      const botReply = await getBotResponse(input);
      // Remove typing indicator and add bot response
      setIsTyping(false);
      const botMessage = { sender: "bot", text: botReply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setIsTyping(false);
      const errorMessage = {
        sender: "bot",
        text: "⚠️ Sorry, something went wrong.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const getBotResponse = async (userInput) => {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer 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",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful DevOps assistant. Provide concise, technical answers about DevOps practices, tools, and methodologies.",
            },
            { role: "user", content: userInput },
          ],
        }),
      }
    );

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    }
    return "⚠️ No response from model.";
  };

  return (
    <div className="app">
      <h1>DevOps Assistant 🤖</h1>
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <strong>{msg.sender === "user" ? "You" : "Bot"}:</strong> {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
      </div>
      <div className="input-area">
        <input
          type="text"
          placeholder="Ask me about DevOps..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isTyping}
        />
        <button onClick={handleSend} disabled={isTyping}>
          {isTyping ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
