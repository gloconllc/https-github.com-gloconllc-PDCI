import React from 'react';
import { CloseIcon, SparkleIcon } from './icons/Icons';

interface MarketCommentaryModalProps {
    onClose: () => void;
    isLoading: boolean;
    commentary: string | null;
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const renderLine = (line: string, key: number) => {
        if (line.startsWith('### ')) {
            return <h3 key={key} className="text-lg font-semibold text-gray-200 mt-4 mb-2">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
            return <h2 key={key} className="text-xl font-bold text-gray-100 mt-5 mb-2 border-b border-white/10 pb-1">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('* ')) {
            return <li key={key} className="text-gray-300 my-1 ml-4 list-disc">{line.replace('* ', '')}</li>;
        }
        if (line.trim() === '') {
            return <br key={key} />;
        }
        return <p key={key} className="text-gray-300 my-2">{line}</p>;
    };

    return <>{content.split('\n').map(renderLine)}</>;
};

const MarketCommentaryModal: React.FC<MarketCommentaryModalProps> = ({ onClose, isLoading, commentary }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-panel w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <SparkleIcon />
                        PDCI Market Commentary
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                            <SparkleIcon />
                            <p className="text-gray-300 text-lg animate-pulse mt-4">Generating market briefing...</p>
                            <p className="text-gray-500 mt-2">Synthesizing real-time news and internal data.</p>
                        </div>
                    )}
                    {commentary && <MarkdownRenderer content={commentary} />}
                </div>
            </div>
        </div>
    );
};

export default MarketCommentaryModal;