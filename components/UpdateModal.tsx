import React from 'react';
import { CloseIcon, SparkleIcon } from './icons/Icons';

interface UpdateModalProps {
    onClose: () => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ onClose }) => {
    // This is a static simulation of the dynamic update process described in the user's documents.
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-panel w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <SparkleIcon />
                        PDCI Database Update Summary
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg text-accent-green mb-2">New Companies Discovered (2)</h3>
                        <div className="space-y-3">
                            <div className="bg-black/30 p-3 rounded-lg">
                                <p className="font-bold">Rogers Corporation (ROG)</p>
                                <p className="text-sm text-gray-400">Score: 85 | Rank: #15 | Category: PCB Laminates</p>
                                <p className="text-xs text-gray-500 mt-1">Reason: Identified in 18 DC equipment supplier contracts for high-frequency server PCBs.</p>
                            </div>
                            <div className="bg-black/30 p-3 rounded-lg">
                                <p className="font-bold">Celestica (CLS)</p>
                                <p className="text-sm text-gray-400">Score: 81 | Rank: #18 | Category: Contract Manufacturing</p>
                                <p className="text-xs text-gray-500 mt-1">Reason: Confirmed as a key assembly partner for Dell, HPE, and Cisco AI server lines.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold text-lg text-accent-blue mb-2">Universal Score Increases (3)</h3>
                         <div className="space-y-3">
                            <p className="text-sm">↑ <span className="font-bold">Credo Tech (CRDO):</span> 88 → 92 (+4) <span className="text-gray-400">- xAI Memphis contract confirmed.</span></p>
                            <p className="text-sm">↑ <span className="font-bold">Arista Networks (ANET):</span> 92 → 94 (+2) <span className="text-gray-400">- 5 new AI network trials announced.</span></p>
                            <p className="text-sm">↑ <span className="font-bold">Prysmian (PRY.MI):</span> 93 → 94 (+1) <span className="text-gray-400">- €382.5M new contracts identified.</span></p>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-lg text-yellow-400 mb-2">New Contracts & Developments (4)</h3>
                        <ul className="space-y-2 list-disc list-inside text-sm text-gray-300">
                            <li><span className="font-bold">TSMC:</span> NVIDIA Blackwell Ultra production confirmed for Q1 2026.</li>
                            <li><span className="font-bold">SK Hynix:</span> New 36GB HBM3E modules now shipping to AMD for MI400 series.</li>
                            <li><span className="font-bold">Vertiv:</span> Awarded $250M contract for Meta's next-gen liquid cooling systems.</li>
                            <li><span className="font-bold">Broadcom:</span> Announced Tomahawk 6 (102.4Tbps) switch ASIC, sampling to key partners.</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-auto bg-white/5 p-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="w-full neuro-button bg-accent-blue text-white font-bold py-2 px-4 transition-transform hover:scale-105"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateModal;
