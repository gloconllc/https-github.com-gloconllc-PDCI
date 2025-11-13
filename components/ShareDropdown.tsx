/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Company } from '../types';
import { ShareIcon, CopyIcon, TwitterIcon, LinkedInIcon, FacebookIcon, WhatsAppIcon, EmailIcon } from './icons/Icons';

interface ShareDropdownProps {
    generatePdfBlob: () => Promise<Blob | null>;
    company?: Company;
    title?: string;
    text?: string;
    fileName?: string;
}

const ShareDropdown: React.FC<ShareDropdownProps> = ({ generatePdfBlob, company, title, text, fileName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const shareTitle = title || `PDCI Report: ${company?.Company} (${company?.Ticker})`;
    const shareText = text || `Check out this analysis for ${company?.Company} from the PDCI Dashboard.`;
    const shareUrl = window.location.href;
    const pdfFileName = fileName || `PDCI_Report_${company?.Ticker}.pdf`;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setStatus('Copied!');
        setTimeout(() => setStatus(''), 2000);
    };

    const handleNativeShare = async () => {
        setStatus('Sharing...');
        try {
            const blob = await generatePdfBlob();
            if (!blob) {
                 setStatus('Error');
                 return;
            }

            const file = new File([blob], pdfFileName, { type: 'application/pdf' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: shareTitle, text: shareText });
                setStatus('');
            } else {
                alert('Sharing files is not supported on this browser. Try downloading the PDF.');
                setStatus('');
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                 console.error("Failed to share report:", error);
                 setStatus('Error');
            } else {
                 setStatus(''); // Reset if user cancels share dialog
            }
        }
        setIsOpen(false);
    };

    const socialLinks = [
        {
            name: 'X (Twitter)',
            icon: <TwitterIcon />,
            url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
        },
        {
            name: 'LinkedIn',
            icon: <LinkedInIcon />,
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        },
        {
            name: 'Facebook',
            icon: <FacebookIcon />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        },
        {
            name: 'WhatsApp',
            icon: <WhatsAppIcon />,
            url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
        },
        {
            name: 'Email',
            icon: <EmailIcon />,
            url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
        }
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-secondary"
                aria-haspopup="true"
                aria-expanded={isOpen}
                title="Share Report"
            >
                <ShareIcon />
                <span className="hidden sm:inline">{status || 'Share'}</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-60 glass-panel p-2 z-50 animate-fade-in-up">
                    <div className="space-y-1">
                        <button
                            onClick={handleNativeShare}
                            className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-accent-blue/20 text-gray-200 transition-colors"
                        >
                            <ShareIcon /> <span>Share PDF via...</span>
                        </button>
                         <button
                            onClick={handleCopyLink}
                            className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-accent-blue/20 text-gray-200 transition-colors"
                        >
                            <CopyIcon /> <span>Copy Link</span>
                        </button>
                        <div className="border-t border-white/10 my-1"></div>
                        {socialLinks.map(link => (
                            <a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-accent-blue/20 text-gray-200 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShareDropdown;