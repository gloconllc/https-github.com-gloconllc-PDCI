
import React from 'react';
import { Company } from '../types';
import FactorCorrelationMatrix from './FactorCorrelationMatrix';
import MarketDistribution from './MarketDistribution';
import { SparkleIcon } from './icons/Icons';

interface QuantitativeFactorAnalysisProps {
    companies: Company[];
}

const QuantitativeFactorAnalysis: React.FC<QuantitativeFactorAnalysisProps> = ({ companies }) => {
    
    if (companies.length < 2) {
        return (
            <div className="text-center py-20">
                <SparkleIcon className="mx-auto w-12 h-12 text-gray-600" />
                <h1 className="text-3xl font-bold text-gray-200 mt-4">Quantitative Factor Analysis</h1>
                <p className="text-gray-400 mt-2">Insufficient data for analysis.</p>
                <p className="text-gray-500">Please select at least two companies or broaden your filters to use this feature.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
             <div className="text-center">
                 <h1 className="text-3xl font-bold text-gray-200">Quantitative Factor Analysis</h1>
                 <p className="text-gray-400">Analyze market-wide trends and factor correlations.</p>
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
