/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useState } from 'react';
import { Company } from '../types';
import PortfolioSidebar from './PortfolioSidebar';
import AIChat from './AIChat';
import { ClipboardCheckIcon, ChatBubbleIcon } from './icons/Icons';

interface RightSidebarProps {
    portfolio: Company[];
    onRemoveFromPortfolio: (ticker: string) => void;
    onViewDetails: (company: Company) => void;
    allCompanies: Company[];
}

type ActiveTab = 'portfolio' | 'chat';

const RightSidebar: React.FC<RightSidebarProps> = ({ portfolio, onRemoveFromPortfolio, onViewDetails, allCompanies }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('portfolio');

    const tabs = [
        { id: 'portfolio', label: 'My Portfolio', icon: <ClipboardCheckIcon className="w-5 h-5" /> },
        { id: 'chat', label: 'PDCI Chat', icon: <ChatBubbleIcon className="w-5 h-5" /> },
    ];

    return (
        <div className="glass-panel p-4 sticky top-24 h-[calc(100vh-7rem)] flex flex-col">
            <div className="mb-4 flex-shrink-0">
                <div className="flex bg-black/20 p-1 rounded-lg">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ActiveTab)}
                            className={`w-1/2 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-colors ${
                                activeTab === tab.id ? 'bg-accent-blue text-white shadow' : 'text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-grow overflow-hidden">
                {activeTab === 'portfolio' && (
                    <PortfolioSidebar
                        portfolio={portfolio}
                        onRemove={onRemoveFromPortfolio}
                        onViewDetails={onViewDetails}
                        allCompanies={allCompanies}
                    />
                )}
                {activeTab === 'chat' && (
                    <AIChat companies={allCompanies} />
                )}
            </div>
        </div>
    );
};

export default RightSidebar;
