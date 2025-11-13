/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React from 'react';

export interface ApiKeyContextType {
    isKeyReady: boolean;
    setIsKeyReady: (isReady: boolean) => void;
}

export const ApiKeyContext = React.createContext<ApiKeyContextType>({
    isKeyReady: false,
    setIsKeyReady: () => {
        console.warn('ApiKeyContext provider is not available');
    },
});
