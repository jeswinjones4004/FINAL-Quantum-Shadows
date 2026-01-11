import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Shield, Terminal } from 'lucide-react';

const QA_KNOWLEDGE_BASE = [
    {
        keywords: ['scan', 'analyze', 'check', 'test', 'url'],
        response: "To scan a website, enter the URL in the main input field on the dashboard and click 'Scan Now'. I'll check for legacy cryptography and TLS configurations."
    },
    {
        keywords: ['quantum', 'computer', 'q-day'],
        response: "Quantum computers use qubits to solve complex problems. 'Q-Day' is the hypothetical future date when they become powerful enough to break current public-key encryption (RSA, ECC)."
    },
    {
        keywords: ['rsa', 'ecc', 'breaking', 'crack'],
        response: "RSA and ECC rely on math problems (integer factorization, discrete logs) that quantum computers can solve effortlessly using Shor's Algorithm. They need to be replaced with Post-Quantum Cryptography (PQC)."
    },
    {
        keywords: ['monitoring', 'live', 'monitor', 'threats'],
        response: "The Live Threat Monitor is a restricted area for security analysts. It visualizes real-time harvest-now attacks and global cryptographic transition statistics. You need to log in to access it."
    },
    {
        keywords: ['pqc', 'algorithm', 'nist', 'kyber', 'dilithium'],
        response: "PQC (Post-Quantum Cryptography) refers to cryptographic algorithms (like Kyber and Dilithium) that are thought to be secure against a cryptanalytic attack by a quantum computer."
    },
    {
        keywords: ['google', 'cloud', 'tink'],
        response: "We leverage Google Cloud's PQC experiments and the Tink cryptographic library to provide hybrid encryption schemes that bridge the gap between classical and quantum security."
    }
];

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Greetings. I am Q-AI, your quantum security assistant. How can I assist you in securing your infrastructure today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const findResponse = (text) => {
        const lowerInput = text.toLowerCase();
        for (const entry of QA_KNOWLEDGE_BASE) {
            if (entry.keywords.some(k => lowerInput.includes(k))) {
                return entry.response;
            }
        }
        return "I am currently calibrated for quantum security inquiries. You can ask me about 'scanning', 'RSA vulnerabilities', 'PQC algorithms', or how to use the 'Live Monitor'.";
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate think time
        setTimeout(() => {
            const responseText = findResponse(userMsg.text);
            const botMsg = { id: Date.now() + 1, type: 'bot', text: responseText };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1000 + Math.random() * 500);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            {/* Chat Window */}
            <div className={`
        pointer-events-auto
        bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden
        transition-all duration-300 ease-in-out origin-bottom-right
        ${isOpen ? 'w-80 h-96 opacity-100 scale-100 mb-4' : 'w-0 h-0 opacity-0 scale-50 mb-0'}
      `}>
                {/* Header */}
                <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-brand-cyan/20 rounded-lg">
                            <Bot className="w-5 h-5 text-brand-cyan" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-100 font-mono">Q-AI Assistant</h3>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] text-green-400">Online</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="h-64 overflow-y-auto p-4 space-y-4 bg-slate-900/95">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                max-w-[85%] rounded-2xl px-4 py-2 text-sm
                ${msg.type === 'user'
                                    ? 'bg-brand-cyan/20 text-cyan-100 rounded-tr-none border border-brand-cyan/20'
                                    : 'bg-slate-800 text-slate-300 rounded-tl-none border border-slate-700'}
              `}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 text-slate-300 rounded-2xl rounded-tl-none border border-slate-700 px-4 py-3 flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="absolute bottom-0 left-0 right-0 p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about encryption..."
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-cyan placeholder-slate-500"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="p-2 bg-brand-cyan text-slate-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-400 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className={`
          pointer-events-auto
          w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-brand-cyan/30 transition-all duration-300
          ${isOpen ? 'bg-slate-700 text-slate-400 rotate-90 scale-0 opacity-0' : 'bg-brand-cyan text-slate-900 scale-100 opacity-100 hover:scale-110'}
        `}
            >
                <MessageSquare className="w-7 h-7" />
            </button>

            {/* Alternative Close Button when open but minimized? No, just X inside. 
          Actually, let's keep the main toggle button visible or replace it? 
          Common pattern is the FAB disappears or turns into close. 
          Let's make sure the FAB reappears. 
          My logic above hides the FAB when open. 
          The 'X' inside the window closes it. That works.
      */}

        </div>
    );
}
