/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React from 'react';
import { PDCIcon, BrainCircuitIcon } from './icons/Icons';

interface ApiKeySelectionScreenProps {
    onKeySelect: () => void;
}

const ApiKeySelectionScreen: React.FC<ApiKeySelectionScreenProps> = ({ onKeySelect }) => {
    const handleSelectKey = async () => {
        try {
            // This is an external function provided by the execution environment.
            // @ts-ignore
            await window.aistudio.openSelectKey();
            // Assume success after the dialog is closed, as per guidelines.
            onKeySelect();
        } catch (error) {
            console.error("Error opening API key selection:", error);
            alert("Could not open the API key selection dialog. Please ensure you are in a supported environment.");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-full max-w-lg text-center">
                <div className="flex justify-center mb-6">
                    <PDCIcon />
                </div>
                <div className="glass-panel p-8">
                    <BrainCircuitIcon className="mx-auto w-12 h-12 text-accent-blue mb-4" />
                    <h1 className="text-2xl font-bold text-gray-100 mb-2">Gemini API Key Required</h1>
                    <p className="text-gray-400 mb-6">
                        To power its advanced analytics, the PDCI Dashboard requires access to the Gemini API. Please select an API key to proceed.
                    </p>
                    <button
                        onClick={handleSelectKey}
                        className="btn btn-primary w-full max-w-xs mx-auto py-3"
                    >
                        Select API Key
                    </button>
                    <p className="text-xs text-gray-500 mt-4">
                        By using this service, you agree to the associated costs. For more information, please see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">Gemini API billing documentation</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ApiKeySelectionScreen;
