import React, { useMemo } from 'react';
import { Company } from '../types';

type Factor = keyof Company;
const factors: Factor[] = [
    'Universal_Score',
    'Graham_Score',
    'PE_Ratio',
    'Revenue_Growth_YoY',
    'YTD_Performance',
    'Market_Cap_B',
    'ESG_Score',
    'SCSI',
    'Substitutability_Score'
];

const factorLabels: Record<string, string> = {
    'Universal_Score': 'Score',
    'Graham_Score': 'Graham',
    'PE_Ratio': 'P/E',
    'Revenue_Growth_YoY': 'Growth',
    'YTD_Performance': 'YTD',
    'Market_Cap_B': 'Mkt Cap',
    'ESG_Score': 'ESG',
    'SCSI': 'SCSI',
    'Substitutability_Score': 'Subst.'
};


// Pearson correlation calculation
const pearsonCorrelation = (arr1: number[], arr2: number[]): number => {
    let sum1 = 0, sum2 = 0, sum1sq = 0, sum2sq = 0, pSum = 0;
    const n = arr1.length;

    for (let i = 0; i < n; i++) {
        sum1 += arr1[i];
        sum2 += arr2[i];
        sum1sq += arr1[i] ** 2;
        sum2sq += arr2[i] ** 2;
        pSum += arr1[i] * arr2[i];
    }

    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1sq - sum1 ** 2 / n) * (sum2sq - sum2 ** 2 / n));

    if (den === 0) return 0;
    return num / den;
};

const getColorForCorrelation = (value: number): string => {
    if (value > 0.5) return 'bg-accent-green/80 text-white';
    if (value > 0.2) return 'bg-accent-green/50 text-gray-100';
    if (value > 0) return 'bg-accent-green/20 text-gray-200';
    if (value < -0.5) return 'bg-accent-red/80 text-white';
    if (value < -0.2) return 'bg-accent-red/50 text-gray-100';
    if (value < 0) return 'bg-accent-red/20 text-gray-200';
    return 'bg-white/5 text-gray-300';
};

const FactorCorrelationMatrix: React.FC<{ companies: Company[] }> = ({ companies }) => {
    const correlationMatrix = useMemo(() => {
        const matrix: (number | null)[][] = Array(factors.length).fill(null).map(() => Array(factors.length).fill(null));

        for (let i = 0; i < factors.length; i++) {
            for (let j = i; j < factors.length; j++) {
                const factor1 = factors[i];
                const factor2 = factors[j];
                
                const validCompanies = companies.filter(c => c[factor1] != null && c[factor2] != null);
                const validArr1 = validCompanies.map(c => c[factor1] as number);
                const validArr2 = validCompanies.map(c => c[factor2] as number);

                if (validArr1.length < 2) {
                    matrix[i][j] = null;
                    matrix[j][i] = null;
                } else {
                    const correlation = pearsonCorrelation(validArr1, validArr2);
                    matrix[i][j] = correlation;
                    matrix[j][i] = correlation;
                }
            }
        }
        return matrix;
    }, [companies]);

    return (
        <div className="glass-panel p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-200">Factor Correlation Matrix</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-center border-collapse">
                    <thead>
                        <tr>
                            <th className="p-1.5 border border-white/10 bg-black/20 w-16"></th>
                            {factors.map(factor => (
                                <th key={factor} className="p-1.5 border border-white/10 font-semibold text-gray-400 bg-black/20" title={factor}>
                                    <div className="transform -rotate-45 whitespace-nowrap">{factorLabels[factor]}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {factors.map((rowFactor, i) => (
                            <tr key={rowFactor}>
                                <th className="p-1.5 border border-white/10 font-semibold text-gray-400 text-left bg-black/20 w-16" title={rowFactor}>
                                    {factorLabels[rowFactor]}
                                </th>
                                {factors.map((colFactor, j) => {
                                    const value = correlationMatrix[i][j];
                                    return (
                                        <td
                                            key={`${rowFactor}-${colFactor}`}
                                            className={`p-1.5 border border-white/10 font-mono font-semibold transition-transform duration-200 hover:scale-110 hover:shadow-lg ${value !== null ? getColorForCorrelation(value) : 'bg-black/20 text-gray-500'}`}
                                            title={value !== null ? `${factorLabels[rowFactor]} / ${factorLabels[colFactor]}: ${value.toFixed(3)}` : 'N/A'}
                                        >
                                            {value !== null ? value.toFixed(2) : '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FactorCorrelationMatrix;