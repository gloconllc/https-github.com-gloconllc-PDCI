import React from 'react';
import { CloseIcon, GlossaryIcon } from './icons/Icons';

interface GlossaryModalProps {
    onClose: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="text-xl font-semibold text-accent-green mb-4 border-b border-gray-600 pb-2">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const Term: React.FC<{ name: string; definition: string; calculation?: string }> = ({ name, definition, calculation }) => (
    <div>
        <h4 className="font-bold text-gray-200">{name}</h4>
        <p className="text-gray-300 text-sm">{definition}</p>
        {calculation && (
            <p className="text-xs text-gray-400 mt-1">
                <span className="font-semibold">Calculation:</span> <code className="bg-gray-900 px-1 rounded">{calculation}</code>
            </p>
        )}
    </div>
);

const GlossaryModal: React.FC<GlossaryModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-gray-700 p-4 border-b border-gray-600 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                        <GlossaryIcon />
                        Glossary of Terms
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-600">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <Section title="Advanced Analytical Models (PDCI AI Core)">
                        <Term
                            name="Federated Learning Insights"
                            definition="Integrates privacy-preserving insights from a distributed network of financial data, enhancing pattern recognition without centralizing sensitive information. This allows our models to learn from a broader dataset for higher accuracy."
                        />
                        <Term
                            name="Macro-Economic Cross-Correlation Engine"
                            definition="Utilizes a multi-factor model to analyze the cascading impact of global macroeconomic signals (e.g., inflation, interest rates, PMI) on specific supply chain nodes, identifying non-obvious risks and opportunities."
                        />
                        <Term
                            name="Supply Chain Fragility Index (SCFI v2.1)"
                            definition="An enhanced proprietary model that quantifies potential disruption points in the supply chain. It uses graph theory and real-time logistics data to provide a dynamic risk score for each company's operational resilience."
                        />
                        <Term
                            name="Quantitative Momentum Anomaly Detector"
                            definition="A model trained to identify statistically significant deviations from expected momentum, flagging potential trend reversals or continuations that are not yet reflected in market consensus."
                        />
                        <Term
                            name="Geopolitical Risk Hedging Model"
                            definition="This model analyzes unstructured data from global news, policy papers, and social media to score geopolitical risk. It then suggests portfolio adjustments to hedge against region-specific tensions, like those seen in key semiconductor manufacturing zones."
                        />
                    </Section>

                    <Section title="PDCI Business Intelligence (BI) Metrics">
                        <Term name="Universal Score" definition="A proprietary PDCI score from 0-100 that measures a company's overall importance and irreplaceability in the AI data center supply chain. It's a weighted average of criticality, substitutability, market position, and universal presence." />
                        <Term name="Graham Score" definition="A score from 1-10 inspired by Benjamin Graham's value investing principles. It assesses a company's long-term quality based on its economic moat, financial health (e.g., low debt), and valuation (i.e., margin of safety). A higher score suggests a more fundamentally sound, long-term investment." />
                        <Term name="SCSI (Supply Constraint Severity Index)" definition="Measures a company's pricing power based on how critical and irreplaceable its products are. A higher score indicates a stronger competitive moat and pricing power." calculation="(Criticality * 30) + (Supply Chain Depth Score) + (100 - Substitutability Score)" />
                        <Term name="Criticality" definition="A 1-10 score indicating how essential a company's product is for a data center to function. 10 is mission-critical." />
                        <Term name="Substitutability Score" definition="A 0-100 score indicating how easily a company's product can be replaced. 0 (Impossible) is best, 100 (Easy) is worst." />
                        <Term name="Supply Chain Depth Score" definition="A score indicating a company's position in the supply chain. Raw Materials (100) have the deepest moat, while Software/Systems (10) are closer to the end user." />
                        <Term name="ESG Score" definition="An environmental, social, and governance score rating a company's sustainability and ethical impact." />
                    </Section>

                    <Section title="Financial Metrics">
                        <Term name="P/E Ratio (Price-to-Earnings)" definition="A valuation ratio of a company's current share price compared to its per-share earnings. A high P/E could mean a stock's price is high relative to earnings and possibly overvalued." calculation="Market Price per Share / Earnings per Share (EPS)" />
                        <Term name="Forward P/E" definition="A version of the P/E ratio that uses forecasted earnings for the P/E calculation. It's used to compare current earnings to future earnings." />
                        <Term name="Revenue Growth (YoY)" definition="The percentage increase in a company's revenue over the last 12 months compared to the prior 12-month period. It shows how fast a company is growing its sales." />
                        <Term name="Debt-to-Equity Ratio" definition="A measure of a company's financial leverage. A high ratio indicates that a company has been aggressive in financing its growth with debt." calculation="Total Liabilities / Shareholder Equity" />
                        <Term name="Market Cap (B)" definition="The total market value of a company's outstanding shares, shown in billions of USD." calculation="Current Share Price × Total Shares Outstanding" />
                    </Section>

                    <Section title="Portfolio KPIs">
                        <Term name="USWA (Universal Score Weighted Avg)" definition="The average Universal Score of all companies in your portfolio, weighted equally. Target: >85." />
                        <Term name="CEI (Criticality Exposure Index)" definition="The average Criticality Score of your portfolio. Shows how dependent the portfolio is on mission-critical components. Target: >9.0." />
                        <Term name="SRS (Substitutability Risk Score)" definition="The average Substitutability Score of your portfolio. A lower score means your portfolio has a stronger competitive moat. Target: <35." />
                        <Term name="GCR (Geographic Concentration Risk)" definition="The percentage of your portfolio's companies based in specific high-risk regions (e.g., Taiwan, Korea). A lower percentage indicates better geographic diversification. Target: <40%." />
                    </Section>
                </div>
            </div>
        </div>
    );
};

export default GlossaryModal;