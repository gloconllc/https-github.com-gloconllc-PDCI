import React, { useState, useEffect } from 'react';
import { CloseIcon, SparkleIcon } from './icons/Icons';

interface AISyncModalProps {
    onClose: () => void;
}

const modelsToSync = [
    { name: "Federated Learning Insights", time: 1000 },
    { name: "Macro-Economic Cross-Correlation Engine", time: 1200 },
    { name: "Supply Chain Fragility Index (SCFI v2.1)", time: 1100 },
    { name: "Quantitative Momentum Anomaly Detector", time: 1300 },
    { name: "Geopolitical Risk Hedging Model", time: 1000 },
];

const AISyncModal: React.FC<AISyncModalProps> = ({ onClose }) => {
    const [syncedModels, setSyncedModels] = useState<string[]>([]);
    const [status, setStatus] = useState<'syncing' | 'complete'>('syncing');

    useEffect(() => {
        let isMounted = true;
        const sync = async () => {
            for (const model of modelsToSync) {
                if (!isMounted) return;
                await new Promise(resolve => setTimeout(resolve, model.time));
                if (!isMounted) return;
                setSyncedModels(prev => [...prev, model.name]);
            }
            if (isMounted) {
                await new Promise(resolve => setTimeout(resolve, 500));
                setStatus('complete');
            }
        };
        sync();
        return () => { isMounted = false; };
    }, []);

    const Checkmark: React.FC = () => (
        <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-panel w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <SparkleIcon />
                        Syncing PDCI AI Models
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10" disabled={status !== 'complete'}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-gray-400 mb-4">Integrating latest universally trained algorithms to enhance analytical accuracy.</p>
                    <div className="space-y-3">
                        {modelsToSync.map((model, index) => (
                            <div key={index} className="flex items-center gap-3 bg-black/20 p-3 rounded-md">
                                {syncedModels.includes(model.name) ? (
                                    <Checkmark />
                                ) : (
                                    <div className="w-5 h-5 border-2 border-gray-600 rounded-full animate-spin"></div>
                                )}
                                <span className={`transition-colors ${syncedModels.includes(model.name) ? 'text-gray-200' : 'text-gray-500'}`}>{model.name}</span>
                            </div>
                        ))}
                    </div>

                    {status === 'complete' && (
                        <div className="mt-6 text-center text-accent-green font-semibold animate-fade-in-up">
                            <p>Sync Complete. Confidence level increased to 99.8%.</p>
                            <p className="text-xs text-gray-400 mt-1">Glossary has been updated with new model details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AISyncModal;