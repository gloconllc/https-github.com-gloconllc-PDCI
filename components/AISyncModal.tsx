
import React, { useState, useEffect } from 'react';
import { CloseIcon, SparkleIcon, MarketDataIcon, NewsIcon, AcademicIcon, AlternativeDataIcon, BrainCircuitIcon } from './icons/Icons';

interface AISyncModalProps {
    onClose: () => void;
}

const syncStages = [
    { 
        name: "Real-Time Market Feeds", 
        sources: ["Alpha Vantage", "Finnhub API", "Yahoo Finance"],
        time: 1200,
        Icon: MarketDataIcon
    },
    { 
        name: "Global News & Sentiment", 
        sources: ["WSJ", "Bloomberg", "Reuters", "Motley Fool", "Investopedia", "Morningstar"],
        time: 1500,
        Icon: NewsIcon
    },
    { 
        name: "Academic & Economic Data", 
        sources: ["Ivy League Research", "World Bank", "Global Dev. Programs"],
        time: 1300,
        Icon: AcademicIcon
    },
    { 
        name: "Geospatial & Alternative Data", 
        sources: ["Land Satellite Feeds", "Logistics Trackers"],
        time: 1100,
        Icon: AlternativeDataIcon
    },
    { 
        name: "Consolidating & Retraining PDCI Core", 
        sources: ["Proprietary Algorithm v3.2"],
        time: 1800,
        Icon: BrainCircuitIcon
    },
];

const AISyncModal: React.FC<AISyncModalProps> = ({ onClose }) => {
    const [currentStage, setCurrentStage] = useState(0);
    const [status, setStatus] = useState<'syncing' | 'complete'>('syncing');

    useEffect(() => {
        let isMounted = true;
        const sync = async () => {
            for (let i = 0; i < syncStages.length; i++) {
                if (!isMounted) return;
                await new Promise(resolve => setTimeout(resolve, syncStages[i].time / 2)); // Speed up for demo
                if (!isMounted) return;
                setCurrentStage(i + 1);
            }
            if (isMounted) {
                setStatus('complete');
            }
        };
        sync();
        return () => { isMounted = false; };
    }, []);

    const Checkmark: React.FC = () => (
        <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
    );

    const Spinner: React.FC = () => <div className="w-6 h-6 border-2 border-gray-500 border-t-accent-blue rounded-full animate-spin"></div>;
    const Pending: React.FC = () => <div className="w-6 h-6 border-2 border-gray-700 rounded-full"></div>;


    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-panel w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <SparkleIcon />
                        Syncing PDCI Intelligence Core
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10" disabled={status !== 'complete'}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-gray-400 mb-6">Integrating latest market data and universally trained algorithms to enhance analytical accuracy.</p>
                    
                    <div className="space-y-4">
                        {syncStages.map((stage, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    {currentStage > index ? <Checkmark /> : currentStage === index ? <Spinner /> : <Pending />}
                                </div>
                                <div>
                                    <p className={`font-semibold transition-colors ${currentStage >= index ? 'text-gray-100' : 'text-gray-600'}`}>{stage.name}</p>
                                    <div className="flex flex-wrap gap-x-2 text-xs">
                                        {stage.sources.map(source => (
                                            <span key={source} className={`transition-colors ${currentStage >= index ? 'text-gray-400' : 'text-gray-700'}`}>{source}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-6">
                        <div className="bg-accent-blue h-2.5 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${(currentStage / syncStages.length) * 100}%` }}></div>
                    </div>

                    {status === 'complete' && (
                        <div className="mt-6 text-center text-accent-green font-semibold animate-fade-in-up">
                            <p>Sync Complete. PDCI Core Algorithm is now operating at peak accuracy.</p>
                             <p className="text-xs text-gray-500 font-normal mt-2">Core logic by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AISyncModal;