/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useState, useCallback, useRef, useEffect, useContext } from 'react';
import { getChatResponse, getDeepAnalysisResponse, GeminiResponse } from '../lib/gemini';
import { Company } from '../types';
import { SendIcon, SparkleIcon, CloseIcon, LinkIcon } from './icons/Icons';
import { ApiKeyContext } from '../context';

// FIX: Removed declare global block to prevent type conflicts.
// Global types are now centralized in `types.ts`.
interface AIChatProps {
    companies: Company[];
}

interface Message {
    type: 'user' | 'ai';
    text: string;
    groundingMetadata?: any;
}

const AIChat: React.FC<AIChatProps> = ({ companies }) => {
    const { setIsKeyReady } = useContext(ApiKeyContext);
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
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
            const result: GeminiResponse = isDeepAnalysis
                ? await getDeepAnalysisResponse(currentQuery, companies)
                : await getChatResponse(currentQuery, companies);
            setMessages(prev => [...prev, { type: 'ai', text: result.text, groundingMetadata: result.groundingMetadata }]);
        } catch (error) {
            console.error(error);
            if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
                setIsKeyReady(false);
            }
            setMessages(prev => [...prev, { type: 'ai', text: 'An error occurred. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    }, [query, companies, isLoading, isDeepAnalysis, setIsKeyReady]);

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2">
                <SparkleIcon />
                PDCI Analyst Chat
            </h2>
            
            <div className="flex-grow bg-black/20 rounded-lg p-4 space-y-4 overflow-y-auto">
                {messages.length === 0 && (
                     <div className="text-center text-gray-400 p-8">
                        <p className="font-semibold">Welcome to the PDCI Analyst.</p>
                        <p className="text-sm mt-2">Ask simple questions like "What does SCSI mean?" or toggle Deep Analysis for complex queries like "Build me a portfolio focused on supply chain resilience."</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index}>
                        <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-lg p-3 max-w-xs md:max-w-sm break-words ${msg.type === 'user' ? 'bg-accent-blue text-white' : 'bg-gray-800 text-gray-200'}`}>
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
                        <div className="rounded-lg p-3 max-w-sm bg-gray-800 text-gray-400 animate-pulse">
                            {isDeepAnalysis ? 'PDCI Network Intelligence is thinking...' : 'PDCI is thinking...'}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
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
                        className="flex-grow bg-black/20 border border-white/10 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleQuery}
                        disabled={isLoading || !query.trim()}
                        className="btn btn-success p-2.5"
                        aria-label="Send query"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChat;