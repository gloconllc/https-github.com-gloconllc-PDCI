/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useMemo } from 'react';
import { Company } from '../types';

interface HistogramProps {
    data: number[];
    title: string;
    bins: number;
}

const Histogram: React.FC<HistogramProps> = ({ data, title, bins }) => {
    const { histogramData, maxCount } = useMemo(() => {
        if (data.length === 0) return { histogramData: [], maxCount: 0 };
        
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min;
        if (range === 0) { // Handle case where all data points are the same
             return { histogramData: [{label: `${min.toFixed(0)}`, count: data.length}], maxCount: data.length };
        }
        const binSize = range / bins;

        const histogramBins = Array(bins).fill(0).map((_, i) => ({
            label: `${(min + i * binSize).toFixed(0)}-${(min + (i + 1) * binSize).toFixed(0)}`,
            count: 0
        }));

        data.forEach(value => {
            let binIndex = Math.floor((value - min) / binSize);
            if (binIndex >= bins) binIndex = bins - 1; // Put max value in last bin
            if(binIndex < 0) binIndex = 0;
            histogramBins[binIndex].count++;
        });
        
        const maxCount = Math.max(...histogramBins.map(b => b.count));

        return { histogramData: histogramBins, maxCount };
    }, [data, bins]);

    return (
        <div>
            <h3 className="text-md font-semibold text-gray-300 mb-3">{title}</h3>
            <div className="space-y-1.5">
                {histogramData.map((bin, index) => (
                    <div key={index} className="flex items-center text-xs group" title={`${bin.count} companies`}>
                        <div className="w-1/4 text-gray-400 text-right pr-2">{bin.label}</div>
                        <div className="w-3/4 flex items-center">
                            <div className="w-full bg-black/20 rounded-sm h-4">
                                <div
                                    className="bg-accent-blue h-4 rounded-sm transition-all duration-300 ease-in-out"
                                    style={{ width: maxCount > 0 ? `${(bin.count / maxCount) * 100}%` : '0%'}}
                                ></div>
                            </div>
                            <span className="ml-2 font-mono text-gray-300 w-8 text-left">{bin.count}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const MarketDistribution: React.FC<{ companies: Company[] }> = ({ companies }) => {
    const peRatios = useMemo(() => companies.map(c => c.PE_Ratio).filter(pe => pe > 0 && pe < 150), [companies]);
    const revenueGrowths = useMemo(() => companies.map(c => c.Revenue_Growth_YoY), [companies]);

    return (
        <div className="glass-panel p-4 space-y-6">
            <h2 className="text-lg font-semibold text-gray-200">Market Health & Distribution</h2>
            <Histogram data={peRatios} title="P/E Ratio Distribution (0-150)" bins={10} />
            <Histogram data={revenueGrowths} title="Revenue Growth YoY (%)" bins={10} />
        </div>
    );
};

export default MarketDistribution;