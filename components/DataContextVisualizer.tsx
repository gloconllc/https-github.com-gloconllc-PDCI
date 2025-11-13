/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React from 'react';
import { dataCenterVisualizerConfig } from '../constants';

interface DataContextVisualizerProps {
    companyCategory: string;
}

const DataContextVisualizer: React.FC<DataContextVisualizerProps> = ({ companyCategory }) => {
    const { imageUrl, hotspots } = dataCenterVisualizerConfig;

    return (
        <div className="relative w-full aspect-[16/9] bg-black rounded-lg overflow-hidden">
            <img src={imageUrl} alt="Data Center Visualization" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30"></div>

            {hotspots.map(hotspot => {
                const isActive = hotspot.associatedCategories.includes(companyCategory);
                const hotspotClasses = `absolute rounded-md border-2 transition-all duration-300 group cursor-pointer
                    ${isActive 
                        ? 'border-accent-green animate-pulse-strong' 
                        : 'border-accent-blue/70 hover:border-accent-blue animate-glow'
                    }`;

                return (
                    <div
                        key={hotspot.id}
                        className={hotspotClasses}
                        style={{
                            top: hotspot.coordinates.top,
                            left: hotspot.coordinates.left,
                            width: hotspot.coordinates.width,
                            height: hotspot.coordinates.height,
                        }}
                    >
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 w-max max-w-xs bg-gray-900 text-white text-xs rounded-md p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible z-10 left-1/2 -translate-x-1/2 pointer-events-none">
                            <p className={`font-bold text-sm ${isActive ? 'text-accent-green' : 'text-accent-blue'}`}>{hotspot.title}</p>
                            <p className="text-gray-400 mt-1">{hotspot.description}</p>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DataContextVisualizer;