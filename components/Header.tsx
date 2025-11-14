/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useState, useRef, useEffect } from 'react';
import { UpdateIcon, SearchIcon, PDCIcon, GlossaryIcon, HistoryIcon, CommentaryIcon, PipelineIcon, BrainCircuitIcon, ToolsIcon, GoalIcon } from './icons/Icons';

interface HeaderProps {
    onUpdate: () => void;
    lastUpdated: Date;
    isUpdating: boolean;
    searchValue: string;
    onSearchChange: (value: string) => void;
    onOpenGlossary: () => void;
    onSyncPDCI: () => void;
    onOpenBacktest: () => void;
    onOpenCommentary: () => void;
    onOpenOpportunityPipeline: () => void;
    onOpenGoalPlanner: () => void;
    locationStatus: string;
}

const AnalysisToolsDropdown: React.FC<Omit<HeaderProps, 'onUpdate' | 'lastUpdated' | 'isUpdating' | 'searchValue' | 'onSearchChange' | 'locationStatus'>> = 
({ onOpenGlossary, onOpenBacktest, onOpenOpportunityPipeline, onSyncPDCI, onOpenCommentary, onOpenGoalPlanner }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const menuItems = [
        { label: "PDCI Goal Planner", icon: <GoalIcon />, action: onOpenGoalPlanner },
        { label: "Market Backtest", icon: <HistoryIcon />, action: onOpenBacktest },
        { label: "Opportunity Pipeline", icon: <PipelineIcon />, action: onOpenOpportunityPipeline },
        { label: "PDCI Metrics Glossary", icon: <GlossaryIcon />, action: onOpenGlossary },
        { label: "Sync PDCI Models", icon: <BrainCircuitIcon />, action: onSyncPDCI },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-secondary"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <ToolsIcon />
                <span className="hidden lg:inline">Analysis Tools</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 glass-panel p-2 z-30 animate-fade-in-up">
                    <div className="space-y-1">
                        {menuItems.map(item => (
                            <button
                                key={item.label}
                                onClick={() => { item.action(); setIsOpen(false); }}
                                className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-accent-blue/20 text-gray-200 transition-colors"
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const Header: React.FC<HeaderProps> = (props) => {
    const { onUpdate, lastUpdated, isUpdating, searchValue, onSearchChange, locationStatus } = props;

    const getLocationIcon = () => {
        switch (locationStatus) {
            case 'Enabled':
                return <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-accent-green" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;
            case 'Initializing...':
                 return <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500 animate-pulse" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;
            default: // Error or Not Supported
                return <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-accent-red" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
        }
    };

    return (
        <header className="bg-gray-900/50 backdrop-blur-md p-4 shadow-md sticky top-0 z-20 border-b border-white/10">
            <div className="max-w-screen-2xl mx-auto flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <PDCIcon />
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-200 tracking-wider">
                            PDCI
                        </h1>
                        <p className="text-sm text-gray-400 hidden sm:block">Institutional-Grade Intelligence</p>
                    </div>
                </div>

                <div className="flex-1 max-w-xl hidden md:block">
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
                        onClick={props.onOpenCommentary}
                        className="btn btn-secondary"
                    >
                        <CommentaryIcon />
                        <span className="hidden lg:inline">Commentary</span>
                    </button>
                    <AnalysisToolsDropdown {...props} />
                    <div className="flex flex-col items-end">
                        <button
                            onClick={onUpdate}
                            disabled={isUpdating}
                            className="btn btn-primary"
                        >
                            <UpdateIcon className={isUpdating ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">{isUpdating ? 'Updating...' : 'Update Data'}</span>
                        </button>
                        <div className="text-xs text-gray-500 mt-1 hidden sm:flex items-center gap-2">
                            <span>Last Updated: {lastUpdated.toLocaleTimeString()}</span>
                            <span className="w-px h-2.5 bg-gray-600"></span>
                            <div className="flex items-center gap-1" title={locationStatus}>
                                {getLocationIcon()}
                                <span className="truncate max-w-[120px]">{locationStatus}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             <div className="max-w-screen-2xl mx-auto md:hidden mt-3 space-y-2">
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
                <div className="text-xs text-gray-500 flex items-center justify-center gap-1" title={locationStatus}>
                    {getLocationIcon()}
                    <span>Location: {locationStatus}</span>
                </div>
            </div>
        </header>
    );
};

export default Header;