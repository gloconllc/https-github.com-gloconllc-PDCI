/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React from 'react';

interface FooterProps {
    onOpenLegal: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
    return (
        <footer className="bg-gray-900/50 border-t border-white/10 text-center p-4 mt-8 text-xs text-gray-500">
            <div className="space-x-4 mb-2">
                <button onClick={onOpenLegal} className="hover:text-accent-blue hover:underline">Legal & Compliance</button>
                <span>|</span>
                <button onClick={onOpenLegal} className="hover:text-accent-blue hover:underline">Privacy Policy</button>
                 <span>|</span>
                <button onClick={onOpenLegal} className="hover:text-accent-blue hover:underline">Terms of Service</button>
            </div>
            <p>&copy; {new Date().getFullYear()} PDCI. All Rights Reserved.</p>
            <p className="mt-1">Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.</p>
        </footer>
    );
};

export default Footer;
