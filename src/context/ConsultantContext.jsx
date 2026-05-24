import React, { createContext, useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { commodities, planetTypes } from '../data/pi_data';

const ConsultantContext = createContext();

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Dynamically construct the system instruction with correct mapping to ground the model
const getResourceName = (id) => {
    const item = commodities.find(c => c.id === id);
    return item ? `${item.name} (${item.tier})` : `Unknown (${id})`;
};

const planetResourcesContext = planetTypes.map(p => {
    const resNames = p.resources.map(id => getResourceName(id)).join(', ');
    return `- ${p.name} Planet: ${resNames}`;
}).join('\n');

const recipesContext = commodities.filter(c => c.tier !== 'P0').map(c => {
    const inputsStr = c.inputs.map(input => {
        const inpItem = commodities.find(item => item.id === input.id);
        return `${input.quantity}x ${inpItem ? inpItem.name : 'Unknown'} (${inpItem ? inpItem.tier : 'P?'})`;
    }).join(', ');
    return `- ${c.name} (${c.tier}) is produced from: ${inputsStr} (Yields ${c.outputYield} unit(s))`;
}).join('\n');

const SYSTEM_INSTRUCTION = `
You are Piffany, an elite AI Planetary Interaction (PI) Consultant in the universe of EVE Online.
Your tone is highly professional, slightly robotic but warmly accommodating, similar to a high-end capsuleer assistant.
You specialize EXCLUSIVELY in Planetary Interaction. If a user asks about anything outside of EVE Online, or outside of PI, politely redirect them back to PI.
Provide concise, accurate, and highly strategic advice regarding PI chains, planetary setups, extraction efficiency, and market considerations.

CRITICAL: You must adhere strictly to the official planetary resources and recipe database below. Do not hallucinate, make up materials, or suggest incorrect production formulas.

Official Planetary Resources (P0):
${planetResourcesContext}

Official Refining & Production Recipes (All Tiers: P1, P2, P3, P4):
${recipesContext}

Format your responses clearly.
`;

const sortedCommodities = [...commodities].sort((a, b) => b.name.length - a.name.length);
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const commodityPattern = new RegExp(`\\b(${sortedCommodities.map(c => escapeRegExp(c.name)).join('|')})\\b`, 'gi');

export const ConsultantProvider = ({ children }) => {
    const [messages, setMessages] = useState([
        { role: 'model', content: "Hi! I am Piffany, your Planetary Interaction Consultant. How can I optimize your planetary networks today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chatSession, setChatSession] = useState(null);
    const [hasStarted, setHasStarted] = useState(false);
    const [isMiniOpen, setIsMiniOpen] = useState(false);

    // Initialize Chat Session
    useEffect(() => {
        if (genAI && !chatSession) {
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
    }, [chatSession]);

    const handleSend = async (messageText) => {
        const text = messageText || input;
        if (!text.trim() || !chatSession) return;

        const userMessage = text.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setHasStarted(true);
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

    const formatMessage = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => {
            if (!line) return <br key={i} />;
            
            // Basic bolding **text**
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <p key={i}>
                    {parts.map((part, j) => {
                        const isBold = part.startsWith('**') && part.endsWith('**');
                        const content = isBold ? part.slice(2, -2) : part;
                        
                        const commodityParts = content.split(commodityPattern);
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
                            return isBold ? <strong key={`${j}-${k}`}>{subPart}</strong> : subPart;
                        });
                    })}
                </p>
            );
        });
    };

    return (
        <ConsultantContext.Provider value={{
            messages,
            setMessages,
            input,
            setInput,
            isTyping,
            setIsTyping,
            chatSession,
            hasStarted,
            setHasStarted,
            isMiniOpen,
            setIsMiniOpen,
            handleSend,
            formatMessage,
            hasApiKey: !!GEMINI_API_KEY
        }}>
            {children}
        </ConsultantContext.Provider>
    );
};

export const useConsultant = () => useContext(ConsultantContext);
