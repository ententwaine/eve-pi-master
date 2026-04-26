import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { commodities } from '../../data/pi_data';
import './ConsultantPage.css';

const sortedCommodities = [...commodities].sort((a, b) => b.name.length - a.name.length);
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const commodityPattern = new RegExp(`\\b(${sortedCommodities.map(c => escapeRegExp(c.name)).join('|')})\\b`, 'gi');

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the API only if we have a key
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// The System Prompt gives Piffany her personality and bounds her knowledge.
const SYSTEM_INSTRUCTION = `
You are Piffany, an elite AI Planetary Interaction (PI) Consultant in the universe of EVE Online.
Your tone is highly professional, slightly robotic but warmly accommodating, similar to a high-end capsuleer assistant.
You specialize EXCLUSIVELY in Planetary Interaction. If a user asks about anything outside of EVE Online, or outside of PI, politely redirect them back to PI.
Provide concise, accurate, and highly strategic advice regarding PI chains, planetary setups, extraction efficiency, and market considerations.
Format your responses clearly.
`;

const ConsultantPage = () => {
    const [messages, setMessages] = useState([
        { role: 'model', content: "Hi! I am Piffany, your Planetary Interaction Consultant. How can I optimize your planetary networks today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chatSession, setChatSession] = useState(null);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Initialize Chat Session on load
    useEffect(() => {
        if (genAI) {
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                systemInstruction: SYSTEM_INSTRUCTION
            });
            const session = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: "Hello Piffany." }]
                    },
                    {
                        role: "model",
                        parts: [{ text: "Hi! I am Piffany, your Planetary Interaction Consultant. How can I optimize your planetary networks today?" }]
                    }
                ],
            });
            setChatSession(session);
        }
    }, []);

    const handleSend = async () => {
        if (!input.trim() || !chatSession) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsTyping(true);

        try {
            const result = await chatSession.sendMessage(userMessage);
            const responseText = result.response.text();
            
            setMessages(prev => [...prev, { role: 'model', content: responseText }]);
        } catch (error) {
            console.error("Gemini API Error:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                content: "Error: Communications array scrambled. I am unable to connect to my central processing core at this time." 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Format simple markdown-like text (bolding and line breaks)
    const formatMessage = (text) => {
        return text.split('\n').map((line, i) => {
            if (!line) return <br key={i} />;
            
            // Basic bolding **text**
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <p key={i}>
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j}>{part.slice(2, -2)}</strong>;
                        }
                        
                        const commodityParts = part.split(commodityPattern);
                        return commodityParts.map((subPart, k) => {
                            if (!subPart) return null;
                            const matchedCommodity = sortedCommodities.find(c => c.name.toLowerCase() === subPart.toLowerCase());
                            if (matchedCommodity) {
                                return (
                                    <Link key={`${j}-${k}`} to={`/commodity/${matchedCommodity.id}`} className="text-primary" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
                                        {subPart}
                                    </Link>
                                );
                            }
                            return subPart;
                        });
                    })}
                </p>
            );
        });
    };

    if (!GEMINI_API_KEY) {
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
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                >
                    SEND
                </button>
            </div>
        </div>
    );
};

export default ConsultantPage;
