import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  X,
  Send,
  Bus,
  User,
  CloudSun,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  Trash2
} from 'lucide-react';

const AI_SERVICE_URL = 'http://localhost:8000/api/chat';

export default function Chatbot({ role = 'parent', dashboardContext = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const initialGreeting = role === 'driver'
    ? "Hello Captain! 🚌 I'm your Transit Assistant. Ask me about weather updates on your route, next stops, or schedule details."
    : "Hello! 🚌 I'm SmartTransit Assistant. Ask me about your child's bus location, ETA, stop details, or route weather conditions!";

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = role === 'driver' ? [
    { icon: <CloudSun size={12} />, label: "Route Weather", query: "What is the current weather condition along my route?" },
    { icon: <MapPin size={12} />, label: "Next Stop Info", query: "What is my next stop and remaining distance?" },
    { icon: <Clock size={12} />, label: "Schedule Status", query: "Am I running on schedule or delayed?" }
  ] : [
    { icon: <Bus size={12} />, label: "Bus Location", query: "Where is the bus right now?" },
    { icon: <Clock size={12} />, label: "ETA to my stop", query: "When will the bus reach my stop?" },
    { icon: <CloudSun size={12} />, label: "Weather Update", query: "Is it raining on the bus route?" }
  ];

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(AI_SERVICE_URL, {
        user_query: text,
        role: role,
        context_data: dashboardContext
      });

      const botReply = response.data?.response || "I couldn't generate a response.";

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error("AI Service Error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "⚠️ Unable to reach AI Assistant. Make sure `ai-service` is running on port 8000.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="chatbot-wrapper">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-trigger-btn"
        >
          <div className="chatbot-trigger-icon">
            <Bus size={16} />
            <span className="chatbot-online-dot"></span>
          </div>
          <span>{role === 'driver' ? 'Driver Assistant' : 'Transit AI'}</span>
          <Sparkles size={14} style={{ opacity: 0.8 }} />
        </button>
      )}

      {/* Mini Chat Box Window */}
      {isOpen && (
        <div className="chatbot-window">
          
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <div className="chatbot-header-avatar">
                <Bus size={18} />
              </div>
              <div>
                <div className="chatbot-header-name">
                  <span>SmartTransit AI</span>
                  <span className="chatbot-role-tag">{role}</span>
                </div>
                <div className="chatbot-header-status">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }}></span>
                  Live Transit & Weather
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handleClearChat}
                title="Reset Conversation"
                className="chatbot-header-btn"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="chatbot-header-btn"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="chatbot-quick-bar">
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.query)}
                disabled={isLoading}
                className="chatbot-quick-chip"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="chatbot-messages-area">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-msg-row ${msg.sender}`}
              >
                {msg.sender === 'bot' && (
                  <div className="chat-avatar-icon bot">AI</div>
                )}

                <div className={`chat-msg-bubble ${msg.sender} ${msg.isError ? 'error' : ''}`}>
                  <p>{msg.text}</p>
                  <span className="chat-msg-time">{msg.timestamp}</span>
                </div>

                {msg.sender === 'user' && (
                  <div className="chat-avatar-icon user">
                    <User size={12} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="chat-msg-row bot">
                <div className="chat-avatar-icon bot">
                  <RefreshCw size={12} className="animate-spin" />
                </div>
                <div className="chat-msg-bubble bot" style={{ color: 'var(--text-muted)' }}>
                  <span>Checking bus telemetry & weather...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input */}
          <div className="chatbot-footer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="chatbot-input-form"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={role === 'driver' ? "Ask route or weather..." : "Ask bus location or ETA..."}
                className="chatbot-input"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="chatbot-send-btn"
              >
                <Send size={15} />
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
