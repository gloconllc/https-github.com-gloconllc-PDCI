import React from 'react';
import { GeminiResponse } from '../lib/gemini';
import { CloseIcon, LinkIcon, SparkleIcon } from './icons/Icons';

interface UpdateModalProps {
    isLoading: boolean;
    content: GeminiResponse | null;
    onClose: () => void;
}


const UpdateModal: React.FC<UpdateModalProps> = ({ isLoading, content, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-gray-700 p-4 border-b border-gray-600 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <SparkleIcon />
                        Real-Time Market Summary
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-600">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {isLoading && (
                        <div className="text-center text-gray-300">
                            <div className="animate-pulse">Fetching latest market developments...</div>
                        </div>
                    )}
                    {content && (
                        <div>
                            <pre className="text-gray-300 whitespace-pre-wrap font-sans text-sm mb-6">{content.text}</pre>
                            {content.groundingMetadata?.groundingChunks?.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400">
                                    <h4 className="font-semibold mb-2">Sources:</h4>
                                    <ul className="space-y-1">
                                        {content.groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
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
                    )}
                </div>
                 <div className="mt-auto bg-gray-700 p-4 border-t border-gray-600">
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-500 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateModal;
