import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConsultant } from '../context/ConsultantContext';
import './FloatingConsultant.css';

const FloatingConsultant = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        messages,
        input,
        setInput,
        isTyping,
        handleSend,
        formatMessage,
        hasStarted,
        isMiniOpen,
        setIsMiniOpen,
        hasApiKey
    } = useConsultant();

    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of mini chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isMiniOpen) {
            scrollToBottom();
        }
    }, [messages, isTyping, isMiniOpen]);

    // Don't show anything if no API key or on the main consultant page
    if (!hasApiKey || location.pathname === '/consultant') {
        return null;
    }

    // Don't show the bubble if the user hasn't started a conversation yet
    if (!hasStarted) {
        return null;
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="floating-consultant-wrapper">
            {isMiniOpen && (
                <div className="mini-chat-window fade-in">
                    <div className="mini-chat-header">
                        <div className="mini-chat-piffany">
                            <div className="mini-piffany-avatar">
                                <img src="/piffany.jpg" alt="Piffany Mini Profile" />
                            </div>
                            <div className="mini-piffany-details">
                                <span className="mini-piffany-name">Piffany</span>
                                <span className="mini-piffany-status">Online</span>
                            </div>
                        </div>
                        <div className="mini-chat-actions">
                            <button 
                                className="action-icon-btn" 
                                title="Expand to Full Page"
                                onClick={() => {
                                    setIsMiniOpen(false);
                                    navigate('/consultant');
                                }}
                            >
                                🗖
                            </button>
                            <button 
                                className="action-icon-btn close-btn" 
                                title="Minimize Chat"
                                onClick={() => setIsMiniOpen(false)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="mini-chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`mini-message-bubble ${msg.role === 'model' ? 'mini-ai' : 'mini-user'}`}>
                                {formatMessage(msg.content)}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="mini-typing-indicator mini-ai">
                                <div className="mini-typing-dot"></div>
                                <div className="mini-typing-dot"></div>
                                <div className="mini-typing-dot"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="mini-chat-input-area">
                        <textarea 
                            className="mini-chat-input"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isTyping}
                        />
                        <button 
                            className="mini-send-btn"
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                        >
                            ➔
                        </button>
                    </div>
                </div>
            )}

            <button 
                className={`floating-chat-bubble ${isMiniOpen ? 'active' : ''}`}
                onClick={() => setIsMiniOpen(!isMiniOpen)}
                title="Chat with Piffany"
            >
                <div className="bubble-icon">
                    <img src="/piffany.jpg" alt="Piffany Bubble" className="bubble-avatar-img" />
                    <span className="bubble-badge"></span>
                </div>
            </button>
        </div>
    );
};

export default FloatingConsultant;
