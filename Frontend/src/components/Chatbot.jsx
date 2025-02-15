import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  // Toggle chat window
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Send message to backend and handle response
  const handleSend = async () => {
    if (message.trim()) {
      // Add user message to chat history
      const userMessage = { content: message, role: 'user' };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setMessage('');

      try {
        // Send message to backend
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message, conversationId }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();

        // Add AI response to chat history
        const aiMessage = { content: data.message, role: 'assistant' };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);

        // Update conversation ID if it's a new conversation
        if (!conversationId) {
          setConversationId(data.conversationId);
        }
      } catch (error) {
        console.error('Error:', error);
        // Show error message in chat
        const errorMessage = {
          content: 'Failed to send message. Please try again.',
          role: 'assistant',
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    }
  };

  return (
    <div className="fixed bottom-0 right-0 mb-6 mr-6">
      <div className="relative">
        <button
          onClick={toggleChat}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center">
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>

        {isOpen && (
          <div className="absolute bottom-16 right-0 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white">
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded-full p-2">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Chat Assistant</h2>
                  <p className="text-sm text-blue-100">Online | Usually responds instantly</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-2 mb-4 ${
                    msg.role === 'user' ? 'justify-end' : ''
                  }`}>
                  {msg.role === 'assistant' && (
                    <div className="bg-blue-600 rounded-full p-2 flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg p-3 shadow-sm max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-700 rounded-tl-none'
                    }`}>
                    <p>{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="bg-gray-600 rounded-full p-2 flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
