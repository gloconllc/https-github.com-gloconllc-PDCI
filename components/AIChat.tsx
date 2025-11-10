import React, { useState, useCallback, useRef, useEffect } from 'react';
// Import the new deep analysis function
import { getChatResponse, getDeepAnalysisResponse, GeminiResponse } from '../lib/gemini';
import { Company } from '../types';
import { SendIcon, SparkleIcon, CloseIcon, ExportIcon, LinkIcon } from './icons/Icons';

declare global {
    interface Window {
        jspdf: any;
    }
}
interface AIChatProps {
    companies: Company[];
    onClose: () => void;
}

interface Message {
    type: 'user' | 'ai';
    text: string;
    groundingMetadata?: any;
}

const AIChat: React.FC<AIChatProps> = ({ companies, onClose }) => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    // State for the deep analysis toggle
    const [isDeepAnalysis, setIsDeepAnalysis] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleQuery = useCallback(async () => {
        if (!query.trim() || isLoading) return;
        const userMessage: Message = { type: 'user', text: query };
        setMessages(prev => [...prev, userMessage]);
        const currentQuery = query;
        setQuery('');
        setIsLoading(true);
        
        try {
            // Choose the correct Gemini function based on the toggle state
            const result: GeminiResponse = isDeepAnalysis
                ? await getDeepAnalysisResponse(currentQuery, companies)
                : await getChatResponse(currentQuery, companies);

            setMessages(prev => [...prev, { type: 'ai', text: result.text, groundingMetadata: result.groundingMetadata }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { type: 'ai', text: 'An error occurred. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    }, [query, companies, isLoading, isDeepAnalysis]);

    const handleExport = () => {
        if (typeof window.jspdf === 'undefined') {
            alert('PDF library is not loaded. Please try again later.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("PDCI AI Chat Transcript", 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Analysis Mode: ${isDeepAnalysis ? 'Deep (gemini-2.5-pro)' : 'Standard (gemini-2.5-flash)'}`, 14, 28);
        doc.setTextColor(0);


        let y = 40;
        messages.forEach(msg => {
            doc.setFontSize(12);
            doc.setFont(undefined, msg.type === 'user' ? 'bold' : 'normal');
            const prefix = msg.type === 'user' ? 'You: ' : 'PDCI AI: ';
            const textLines = doc.splitTextToSize(prefix + msg.text, 180);
            
            if (y + (textLines.length * 7) > 280) {
                doc.addPage();
                y = 20;
            }
            
            doc.text(textLines, 14, y);
            y += (textLines.length * 7) + 7;
        });

        doc.save('pdci-chat-transcript.pdf');
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-2xl w-96 h-[70vh] max-h-[600px] flex flex-col animate-fade-in-up">
            <div className="bg-gray-700 p-3 flex justify-between items-center rounded-t-lg">
                <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                    <SparkleIcon />
                    PDCI AI Analyst
                </h2>
                <div>
                    <button onClick={handleExport} className="p-2 rounded-full text-gray-400 hover:bg-gray-600 mr-2" aria-label="Export chat to PDF">
                        <ExportIcon />
                    </button>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-600" aria-label="Close chat">
                        <CloseIcon />
                    </button>
                </div>
            </div>
            
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.length === 0 && (
                     <div className="text-center text-gray-400 p-8">Ask anything, or toggle Deep Analysis for complex queries like portfolio construction.</div>
                )}
                {messages.map((msg, index) => (
                    <div key={index}>
                        <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-lg p-3 max-w-xs md:max-w-sm break-words ${msg.type === 'user' ? 'bg-accent-blue text-white' : 'bg-gray-700 text-gray-200'}`}>
                                <pre className="whitespace-pre-wrap font-sans text-sm">{msg.text}</pre>
                            </div>
                        </div>
                        {msg.type === 'ai' && msg.groundingMetadata?.groundingChunks?.length > 0 && (
                             <div className="mt-2 text-xs text-gray-400">
                                <h4 className="font-semibold mb-1">Sources:</h4>
                                <ul className="space-y-1">
                                    {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
                                        <li key={i} className="flex items-start gap-1.5">
                                            <LinkIcon className="flex-shrink-0 mt-0.5" />
                                            <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                                                {chunk.web.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="rounded-lg p-3 max-w-sm bg-gray-700 text-gray-400 animate-pulse">
                            {isDeepAnalysis ? 'Network Intelligence is thinking...' : 'PDCI is thinking...'}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-gray-700 space-y-2">
                <div className="flex items-center justify-center">
                     <label htmlFor="deep-analysis-toggle" className="flex items-center cursor-pointer">
                        <span className="mr-3 text-sm font-medium text-gray-300">Deep Analysis</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                id="deep-analysis-toggle"
                                className="sr-only"
                                checked={isDeepAnalysis}
                                onChange={() => setIsDeepAnalysis(!isDeepAnalysis)}
                            />
                            <div className={`block w-10 h-6 rounded-full ${isDeepAnalysis ? 'bg-accent-green' : 'bg-gray-600'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isDeepAnalysis ? 'translate-x-full' : ''}`}></div>
                        </div>
                    </label>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                        placeholder={isDeepAnalysis ? "Enter a complex query..." : "Ask anything..."}
                        className="flex-grow bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-green"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleQuery}
                        disabled={isLoading || !query.trim()}
                        className="bg-accent-green text-black font-bold p-2 rounded-md hover:bg-green-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        aria-label="Send query to AI"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChat;