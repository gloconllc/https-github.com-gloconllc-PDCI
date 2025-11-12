import React from 'react';
import { CloseIcon } from './icons/Icons';

interface GlossaryModalProps {
    onClose: () => void;
}

const terms = [
    { term: 'Universal Score', definition: 'A proprietary PDCI metric (0-100) that quantifies a company\'s overall importance and irreplaceability within the global AI data center supply chain. It combines factors like market share, technological leadership, and criticality.' },
    { term: 'Criticality', definition: 'A score (1-10) indicating how essential a company\'s product is for the functioning of an AI data center. A score of 10 means there are no viable alternatives (e.g., TSMC for advanced chips).' },
    { term: 'Substitutability Score', definition: 'A quantitative measure of how easily a company\'s product can be replaced. Lower scores are better (0 = Impossible, 30 = Difficult, 60 = Moderate, 100 = Easy).' },
    { term: 'SCSI (Supply Constraint Severity Index)', definition: 'An index that measures the potential impact of a disruption from a specific supplier. Higher scores indicate a more severe potential bottleneck for the entire industry.' },
    { term: 'Graham Score', definition: 'A value investing score (1-10) based on the principles of Benjamin Graham. It favors companies with low P/E ratios, strong financial health (low debt), and consistent earnings. Higher is better.' },
    { term: 'Investment Tier', definition: 'PDCI\'s qualitative rating. \'Must Buy\' are foundational, irreplaceable companies. \'High Conviction\' are strong leaders with excellent growth prospects. \'On Radar\' are companies with high potential that warrant monitoring.' },
    { term: 'USWA (Univ. Score W. Avg)', definition: 'Universal Score Weighted Average. The average Universal Score of your portfolio, indicating its overall quality and strategic importance.' },
    { term: 'SRS (Substitutability Risk Score)', definition: 'The average Substitutability Score of your portfolio. A lower SRS indicates your portfolio is composed of more irreplaceable companies.' },
];

const GlossaryModal: React.FC<GlossaryModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-panel w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-100">PDCI Metrics Glossary</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <dl className="space-y-4">
                        {terms.map(item => (
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
