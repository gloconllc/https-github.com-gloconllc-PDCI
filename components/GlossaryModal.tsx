/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React from 'react';
import { CloseIcon } from './icons/Icons';

interface GlossaryModalProps {
    onClose: () => void;
}

export const terms = [
    { term: 'Universal Score', definition: 'A proprietary PDCI metric (0-100) that quantifies a company\'s overall importance and irreplaceability. It is informed by a historical analysis of past tech booms, geopolitical risk assessments, and financial health to identify the modern-day "picks and shovels"—the critical enablers of the current AI era.' },
    { term: 'Criticality', definition: 'A score (1-10) indicating how essential a company\'s product is, analogous to the role of steel in the railway boom or microprocessors in the PC revolution. The score is tempered by geopolitical risks that could affect availability. A score of 10 means there are no viable alternatives.' },
    { term: 'Geopolitical Risk', definition: 'A qualitative rating (Low, Medium, High, Very High) and a quantitative score (0-100) assessing the risk associated with a company\'s key operational geographies. Factors include political stability, trade tensions, and supply chain concentration.' },
    { term: 'Geopolitical_Risk_Score', definition: 'A quantitative score (0-100) assessing the risk associated with a company\'s key operational geographies. Factors include political stability, trade tensions, and supply chain concentration. Higher is riskier.' },
    { term: 'Substitutability Score', definition: 'A quantitative measure of how easily a company\'s product can be replaced. Lower scores are better (0 = Impossible, 30 = Difficult, 60 = Moderate, 100 = Easy).' },
    { term: 'SCSI', definition: 'Supply Constraint Severity Index. An index that measures the potential impact of a disruption from a specific supplier, helping to identify critical bottlenecks similar to how a single supplier could have constrained a historical tech boom. Higher scores indicate a more severe potential bottleneck.' },
    { term: 'Graham Score', definition: 'A value investing score (1-10) based on the principles of Benjamin Graham. It favors companies with low P/E ratios, strong financial health (low debt), and consistent earnings. Higher is better.' },
    { term: 'Psych Score', definition: 'A proprietary PDCI metric (0-100) that quantifies market sentiment and behavioral drivers, drawing from principles of neuromarketing and financial psychology to gauge investor conviction and potential momentum.' },
    { term: 'Buy Rank', definition: 'An overall ordinal ranking of all companies in the PDCI universe, determined by a weighted combination of Universal Score, financial health, and future growth prospects. A lower rank number indicates a higher conviction.' },
    { term: 'Probability_Of_Success', definition: 'An AI-driven confidence level (0-100%) representing the likelihood that a company will meet or exceed its projected growth and performance targets over the next 12-24 months, based on the PDCI core algorithm.' },
    { term: 'Investment Tier', definition: 'PDCI\'s qualitative rating. \'Must Buy\' are foundational, irreplaceable companies. \'High Conviction\' are strong leaders with excellent growth prospects. \'On Radar\' are companies with high potential that warrant monitoring.' },
    { term: 'USWA (Univ. Score W. Avg)', definition: 'Universal Score Weighted Average. The average Universal Score of your portfolio, indicating its overall quality and strategic importance.' },
    { term: 'SRS (Substitutability Risk Score)', definition: 'The average Substitutability Score of your portfolio. A lower SRS indicates your portfolio is composed of more irreplaceable companies.' },
];

const GlossaryModal: React.FC<GlossaryModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="glossary-modal-title">
            <div className="glass-panel w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 id="glossary-modal-title" className="text-xl font-bold text-gray-100">PDCI Metrics Glossary</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10" aria-label="Close glossary modal">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <dl className="space-y-4">
                        {terms.sort((a,b) => a.term.localeCompare(b.term)).map(item => (
                            <div key={item.term} className="bg-black/20 p-3 rounded-md">
                                <dt className="font-semibold text-accent-blue">{item.term}</dt>
                                <dd className="text-gray-300 text-sm mt-1">{item.definition}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
};

export default GlossaryModal;