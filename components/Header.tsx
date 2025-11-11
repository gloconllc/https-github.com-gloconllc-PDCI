import React from 'react';
import { UpdateIcon, SearchIcon, PDCIcon, GlossaryIcon, GridIcon, AlgorithmUpdateIcon, HistoryIcon, CommentaryIcon } from './icons/Icons';

interface HeaderProps {
    onUpdate: () => void;
    lastUpdated: Date;
    isUpdating: boolean;
    searchValue: string;
    onSearchChange: (value: string) => void;
    onOpenGlossary: () => void;
    isQuantView: boolean;
    onToggleQuantView: () => void;
    onSyncAI: () => void;
    onOpenBacktest: () => void;
    onOpenCommentary: () => void;
}

const Header: React.FC<HeaderProps> = ({ onUpdate, lastUpdated, isUpdating, searchValue, onSearchChange, onOpenGlossary, isQuantView, onToggleQuantView, onSyncAI, onOpenBacktest, onOpenCommentary }) => {
    return (
        <header className="bg-gray-900/50 backdrop-blur-md p-4 shadow-md sticky top-0 z-20 border-b border-white/10">
            <div className="max-w-screen-2xl mx-auto flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <PDCIcon />
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-200 tracking-wider">
                            PDCI Dashboard
                        </h1>
                        <p className="text-sm text-gray-400 hidden sm:block">Quantitative Investment Platform for AI Infrastructure</p>
                    </div>
                </div>

                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or ticker..."
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-md py-2 pl-10 pr-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                            aria-label="Search companies"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                     <button
                        onClick={onToggleQuantView}
                        className={`p-2 rounded-full transition-colors ${isQuantView ? 'bg-accent-blue text-white' : 'text-gray-400 hover:bg-white/10'}`}
                        aria-label="Toggle Quantitative View"
                        title="Toggle Quantitative View"
                    >
                        <GridIcon />
                    </button>
                    <button
                        onClick={onOpenGlossary}
                        className="p-2 rounded-full text-gray-400 hover:bg-white/10 transition-colors"
                        aria-label="Open glossary"
                        title="Glossary"
                    >
                        <GlossaryIcon />
                    </button>
                    <button
                        onClick={onOpenBacktest}
                        className="p-2 rounded-full text-gray-400 hover:bg-white/10 transition-colors"
                        aria-label="Market Backtest"
                        title="Market Backtest"
                    >
                        <HistoryIcon />
                    </button>
                    <button
                        onClick={onSyncAI}
                        className="p-2 rounded-full text-gray-400 hover:bg-white/10 transition-colors"
                        aria-label="Sync PDCI Models"
                        title="Sync PDCI Models"
                    >
                        <AlgorithmUpdateIcon />
                    </button>
                     <button
                        onClick={onOpenCommentary}
                        className="p-2 rounded-full text-gray-400 hover:bg-white/10 transition-colors"
                        aria-label="Market Commentary"
                        title="Market Commentary"
                    >
                        <CommentaryIcon />
                    </button>
                    <div className="flex flex-col items-end">
                        <button
                            onClick={onUpdate}
                            disabled={isUpdating}
                            className="neuro-button flex items-center gap-2 text-white font-semibold py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <UpdateIcon className={isUpdating ? 'animate-spin' : ''} />
                            {isUpdating ? 'Updating...' : 'Update Data'}
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                            Last Updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;