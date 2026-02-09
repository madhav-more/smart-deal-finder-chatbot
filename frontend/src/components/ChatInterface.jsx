import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, ShoppingBag, ExternalLink, ChevronRight, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { chatAPI } from '../services/api';

function ChatInterface() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I\'m your AI Shopping Assistant. I can help you find the best deals on the web. Try asking: \n\n"Find the best price for iPhone 15 Pro" or "Compare prices for Sony WH-1000XM5".',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        // Add user message to UI
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await chatAPI.sendMessage(userMessage, conversationId);

            // Update conversation ID if new
            if (response.conversationId && !conversationId) {
                setConversationId(response.conversationId);
            }

            // Add assistant response
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: response.reply,
                    metadata: response.results,
                },
            ]);
        } catch (error) {
            console.error('Chat error:', error);
            toast.error('Failed to send message. Please try again.');

            // Add error message
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-subtle"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-subtle" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Header */}
            <div className="glass sticky top-0 z-20 px-6 py-4 border-b border-white/50 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                        <ShoppingBag className="text-white w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-800 text-lg leading-tight">Smart Deal Finder</h1>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-slate-500 font-medium">AI Agent Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 z-10 scroll-smooth">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex w-full animate-fade-in-up ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div
                            className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            {/* Message Bubble */}
                            <div
                                className={`px-5 py-4 rounded-2xl shadow-sm relative ${message.role === 'user'
                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm'
                                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-slate-200/50'
                                    }`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="absolute -top-3 -left-3 bg-white p-1.5 rounded-full border border-slate-100 shadow-sm">
                                        <Sparkles className="w-4 h-4 text-purple-500 fill-purple-100" />
                                    </div>
                                )}

                                {message.role === 'assistant' ? (
                                    <ReactMarkdown
                                        className="prose prose-sm max-w-none prose-p:leading-relaxed prose-a:text-blue-600 hover:prose-a:text-blue-700"
                                        components={{
                                            a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                ) : (
                                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                )}
                            </div>

                            {/* Product Cards Grid */}
                            {message.metadata && (message.metadata.results || message.metadata.deals) && (
                                <div className="mt-4 w-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Search className="w-4 h-4 text-slate-400" />
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Deals Found</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                                        {(message.metadata.results || message.metadata.deals).map((deal, idx) => (
                                            <div
                                                key={idx}
                                                className="group bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                                            >
                                                {/* Image Container */}
                                                <div className="relative h-48 w-full bg-slate-50 p-6 flex items-center justify-center overflow-hidden border-b border-slate-100">
                                                    {deal.image ? (
                                                        <img
                                                            src={deal.image}
                                                            alt={deal.title}
                                                            className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.parentNode.innerHTML = '<div class="text-slate-300"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>';
                                                            }}
                                                        />
                                                    ) : (
                                                        <ShoppingBag className="w-12 h-12 text-slate-200" />
                                                    )}

                                                    {/* Badge */}
                                                    {idx === 0 && (
                                                        <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                                            TOP PICK
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="p-4 flex flex-col flex-1 justify-between bg-white">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
                                                                {deal.platform || 'Store'}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                                                            {deal.title}
                                                        </h4>
                                                    </div>

                                                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-slate-400 font-medium">Best Price</span>
                                                            <span className="text-lg font-bold text-slate-900">{deal.price}</span>
                                                        </div>
                                                        <a
                                                            href={deal.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors group/btn"
                                                        >
                                                            View Deal
                                                            <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Timestamp / Meta */}
                            <span className={`text-[10px] mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${message.role === 'user' ? 'text-right text-slate-400 mr-1' : 'text-slate-400 ml-1'
                                }`}>
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex justify-start w-full animate-fade-in-up">
                        <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-3">
                            <div className="relative">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute top-0 left-0 opacity-75"></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full relative"></div>
                            </div>
                            <span className="text-sm text-slate-500 font-medium animate-pulse">Searching best prices...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Form */}
            <div className="p-4 sm:p-6 z-20">
                <div className="glass max-w-4xl mx-auto rounded-2xl p-2 shadow-xl shadow-blue-900/5 ring-1 ring-white/50">
                    <form onSubmit={handleSubmit} className="flex gap-2 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask for any product..."
                            className="flex-1 bg-transparent px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none text-base"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-slate-900 text-white rounded-xl p-3 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg shadow-slate-900/20 active:scale-95"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
                <p className="text-center text-xs text-slate-400 mt-3 font-medium">
                    Powered by Groq AI & Real-time Scraping
                </p>
            </div>
        </div>
    );
}

export default ChatInterface;
