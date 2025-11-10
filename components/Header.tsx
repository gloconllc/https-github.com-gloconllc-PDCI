
import React from 'react';
import { UpdateIcon } from './icons/Icons';

interface HeaderProps {
    onUpdate: () => void;
    lastUpdated: Date;
    isUpdating: boolean;
}

const Header: React.FC<HeaderProps> = ({ onUpdate, lastUpdated, isUpdating }) => {
    return (
        <header className="bg-gray-800 p-4 shadow-md sticky top-0 z-20">
            <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-accent-green tracking-wider">
                        PDCI Dashboard
                    </h1>
                    <p className="text-sm text-gray-400">AI Data Center Supply Chain Investment Analysis</p>
                </div>
                <div className="flex flex-col items-end">
                    <button
                        onClick={onUpdate}
                        disabled={isUpdating}
                        className="flex items-center gap-2 bg-accent-blue text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        <UpdateIcon className={isUpdating ? 'animate-spin' : ''} />
                        {isUpdating ? 'Updating...' : 'Update Data'}
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                        Last Updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>
            </div>
        </header>
    );
};

export default Header;
