import React, { useMemo } from 'react';
import { Company, InvestmentTier } from '../types';

interface KpiCardProps {
    title: string;
    value: string;
    description: string;
    children?: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, description, children }) => (
    <div className="glass-panel p-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="text-3xl font-bold text-gray-100 mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
        {children && <div className="mt-4">{children}</div>}
    </div>
);

const TierDistribution: React.FC<{ companies: Company[] }> = ({ companies }) => {
    const distribution = useMemo(() => {
        const counts = {
            [InvestmentTier.MustBuy]: 0,
            [InvestmentTier.HighConviction]: 0,
            [InvestmentTier.OnRadar]: 0,
        };
        companies.forEach(c => {
            if (c.Investment_Tier in counts) {
                counts[c.Investment_Tier]++;
            }
        });
        return counts;
    }, [companies]);

    const total = companies.length;
    if (total === 0) return null;

    const tierData = [
        { tier: InvestmentTier.MustBuy, count: distribution[InvestmentTier.MustBuy], color: 'bg-accent-green' },
        { tier: InvestmentTier.HighConviction, count: distribution[InvestmentTier.HighConviction], color: 'bg-accent-blue' },
        { tier: InvestmentTier.OnRadar, count: distribution[InvestmentTier.OnRadar], color: 'bg-gray-400' },
    ];

    return (
        <div className="w-full flex rounded-full h-3 bg-gray-700">
            {tierData.map(({ tier, count, color }) => (
                <div
                    key={tier}
                    className={`h-3 ${color}`}
                    style={{ width: `${(count / total) * 100}%` }}
                    title={`${tier}: ${count} companies (${((count / total) * 100).toFixed(1)}%)`}
                ></div>
            ))}
        </div>
    );
};


const DashboardSummary: React.FC<{ companies: Company[] }> = ({ companies }) => {
    const summaryStats = useMemo(() => {
        if (companies.length === 0) {
            return {
                totalCompanies: 0,
                averagePE: 'N/A',
                averageGrowth: 'N/A',
            };
        }
        const totalPE = companies.reduce((acc, company) => acc + company.PE_Ratio, 0);
        const totalGrowth = companies.reduce((acc, company) => acc + company.Revenue_Growth_YoY, 0);
        
        return {
            totalCompanies: companies.length,
            averagePE: (totalPE / companies.length).toFixed(1),
            averageGrowth: `${(totalGrowth / companies.length).toFixed(1)}%`,
        };
    }, [companies]);

    return (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard
                title="Total Companies"
                value={summaryStats.totalCompanies.toString()}
                description="Curated list of key suppliers"
            />
            <KpiCard
                title="Avg. Revenue Growth (YoY)"
                value={summaryStats.averageGrowth}
                description="Across entire supply chain"
            />
            <KpiCard
                title="Avg. P/E Ratio"
                value={summaryStats.averagePE}
                description="Valuation metric for the universe"
            />
            <KpiCard
                title="Investment Tier Mix"
                value=""
                description="Distribution of investment ratings"
            >
                <TierDistribution companies={companies} />
            </KpiCard>
        </div>
    );
};

export default DashboardSummary;