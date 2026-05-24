import React, { useEffect, useRef } from 'react';
import { useConsultant } from '../../context/ConsultantContext';
import './ConsultantPage.css';

const ConsultantPage = () => {
    const {
        messages,
        input,
        setInput,
        isTyping,
        handleSend,
        formatMessage,
        hasApiKey
    } = useConsultant();

    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!hasApiKey) {
        return (
            <div className="consultant-container fade-in">
                <div className="setup-warning">
                    <h2 className="text-danger">AI Core Offline</h2>
                    <p className="text-muted">
                        Piffany requires a connection to the Google Gemini API to function.
                    </p>
                    <p>
                        Please create a <strong>.env</strong> file in your project root and add:<br/><br/>
                        <code style={{ background: 'var(--color-bg-base)', padding: '8px', color: 'var(--color-primary)' }}>
                            VITE_GEMINI_API_KEY=your_key_here
                        </code>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="consultant-container fade-in">
            <div className="chat-header">
                <div className="piffany-avatar">
                    <img src="/piffany.jpg" alt="Piffany Profile" />
                </div>
                <div className="piffany-info">
                    <span className="piffany-name">Piffany</span>
                    <span className="piffany-title">PI Consultant Protocol v1.0</span>
                </div>
            </div>

            <div className="chat-window">
                {messages.map((msg, index) => (
                    <div key={index} className={`message-bubble ${msg.role === 'model' ? 'message-ai' : 'message-user'}`}>
                        {formatMessage(msg.content)}
                    </div>
                ))}
                
                {isTyping && (
                    <div className="typing-indicator message-ai">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <textarea 
                    className="chat-input"
                    placeholder="Ask Piffany a question about Planetary Interaction..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isTyping}
                />
                <button 
                    className="send-btn" 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                >
                    SEND
                </button>
            </div>
        </div>
    );
};

export default ConsultantPage;
