/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React from 'react';
import { Company } from '../types';
import { supplyChainData } from '../lib/supplyChainData';

interface PeerComparisonProps {
    company: Company;
    allCompanies: Company[];
    onViewDetails: (company: Company) => void;
}

const getGeoRiskColor = (score: number): string => {
    if (score <= 30) return 'text-accent-green';
    if (score <= 65) return 'text-yellow-400';
    if (score <= 80) return 'text-orange-500';
    return 'text-accent-red';
};

const PeerComparison: React.FC<PeerComparisonProps> = ({ company, allCompanies, onViewDetails }) => {
    const peers = (supplyChainData[company.Ticker]?.competitors || [])
        .map(ticker => allCompanies.find(c => c.Ticker === ticker))
        .filter((c): c is Company => c !== undefined)
        .slice(0, 3); // Limit to max 3 peers for clarity

    if (peers.length === 0) {
        return null; // Don't render the component if no peers are defined
    }

    const allInComparison = [company, ...peers];

    return (
        <div className="glass-panel p-4">
            <h3 className="font-semibold text-gray-200 mb-3">Peer Comparison</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400">
                            <th className="p-1.5 text-left">Ticker</th>
                            <th className="p-1.5 text-right">Score</th>
                            <th className="p-1.5 text-right">P/E</th>
                            <th className="p-1.5 text-right">Growth</th>
                            <th className="p-1.5 text-right">YTD %</th>
                            <th className="p-1.5 text-right">Geo Risk</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allInComparison.map(p => (
                            <tr
                                key={p.Ticker}
                                className={`border-b border-white/10 last:border-b-0 ${p.Ticker === company.Ticker ? 'bg-accent-blue/10' : 'hover:bg-white/5 cursor-pointer'}`}
                                onClick={() => p.Ticker !== company.Ticker && onViewDetails(p)}
                            >
                                <td className={`p-1.5 font-bold ${p.Ticker === company.Ticker ? 'text-accent-blue' : 'text-gray-200'}`}>{p.Ticker}</td>
                                <td className="p-1.5 text-right font-mono">{p.Universal_Score}</td>
                                <td className="p-1.5 text-right font-mono">{p.PE_Ratio.toFixed(1)}</td>
                                <td className={`p-1.5 text-right font-mono ${p.Revenue_Growth_YoY >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                    {p.Revenue_Growth_YoY.toFixed(1)}%
                                </td>
                                <td className={`p-1.5 text-right font-mono ${p.YTD_Performance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                    {p.YTD_Performance >= 0 ? '+' : ''}{p.YTD_Performance.toFixed(1)}%
                                </td>
                                <td className={`p-1.5 text-right font-mono font-bold ${getGeoRiskColor(p.Geopolitical_Risk_Score)}`}>
                                    {p.Geopolitical_Risk_Score}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PeerComparison;