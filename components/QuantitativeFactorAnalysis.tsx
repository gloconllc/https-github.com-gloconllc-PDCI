/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useState } from 'react';
import { Company } from '../types';
import FactorCorrelationMatrix from './FactorCorrelationMatrix';
import MarketDistribution from './MarketDistribution';
import { ChartBarIcon, QuestionMarkCircleIcon } from './icons/Icons';

interface QuantitativeFactorAnalysisProps {
    companies: Company[];
}

const QuantitativeFactorAnalysis: React.FC<QuantitativeFactorAnalysisProps> = ({ companies }) => {
    const [isMethodologyVisible, setIsMethodologyVisible] = useState(false);
    
    if (companies.length < 2) {
        return (
            <div className="text-center py-20">
                <ChartBarIcon className="mx-auto w-12 h-12 text-gray-600" />
                <h1 className="text-3xl font-bold text-gray-200 mt-4">Factor Analysis Unavailable</h1>
                <p className="text-gray-400 mt-2">This view requires at least two companies to compute correlations and distributions.</p>
                <p className="text-gray-500">Please broaden your filters to analyze market-wide factors.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
             <div className="text-center">
                 <h1 className="text-3xl font-bold text-gray-200">Factor Analysis</h1>
                 <p className="text-gray-400">Analyze market-wide trends and factor correlations.</p>
            </div>

            <div className="glass-panel p-4">
                <button
                    onClick={() => setIsMethodologyVisible(!isMethodologyVisible)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-accent-blue transition-colors w-full"
                    aria-expanded={isMethodologyVisible}
                >
                    <QuestionMarkCircleIcon className="w-5 h-5"/>
                    <span>Methodology Explained</span>
                    <span className={`ml-auto transform transition-transform ${isMethodologyVisible ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {isMethodologyVisible && (
                    <div className="mt-4 pt-4 border-t border-white/10 text-sm text-gray-400 space-y-4">
                        <div>
                            <h4 className="font-bold text-gray-200">Factor Correlation Matrix</h4>
                            <p>This matrix visualizes the linear relationship between different quantitative factors. The values are calculated using the <strong className="text-gray-200">Pearson correlation coefficient</strong>. This statistical measure assesses the relationship by dividing the covariance of the two variables by the product of their standard deviations. The result is a value between -1 and +1.</p>
                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                <li><strong className="text-accent-green/90">Positive Values (Green):</strong> Indicate that two factors tend to move in the same direction. A value close to +1 signifies a strong positive linear relationship.</li>
                                <li><strong className="text-accent-red/90">Negative Values (Red):</strong> Indicate that two factors tend to move in opposite directions. A value close to -1 signifies a strong negative linear relationship.</li>
                                <li><strong className="text-gray-300">Values Near Zero:</strong> Indicate a weak or non-existent linear relationship.</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-200">Market Distribution Histograms</h4>
                            <p>These histograms show the frequency distribution of key metrics across the selected companies. The process involves:</p>
                             <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                <li><strong className="text-gray-200">Binning:</strong> The entire range of values for a factor is divided into a fixed number of equal-sized intervals, or "bins". For example, if P/E ratios in the view range from 10 to 110 and we use 10 bins, each bin would represent a range of 10 points (10-20, 20-30, etc.).</li>
                                <li><strong className="text-gray-200">Counting:</strong> The algorithm counts the number of companies whose factor value falls into each bin.</li>
                                <li><strong className="text-gray-200">Visualization:</strong> The length of the bar for each bin represents the count of companies in that range, providing a visual snapshot of how values are distributed.</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <FactorCorrelationMatrix companies={companies} />
                </div>
                <div className="lg:col-span-1">
                    <MarketDistribution companies={companies} />
                </div>
            </div>
        </div>
    );
};

export default QuantitativeFactorAnalysis;