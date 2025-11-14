/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React from 'react';

interface MarkdownRendererProps {
    content: string | null | undefined;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    if (!content) {
        return null;
    }

    const renderInline = (text: string) => {
        const elements: React.ReactNode[] = [];
        let lastIndex = 0;
        // Regex to capture **bold** and [links](url)
        const regex = /(\*\*(.*?)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            // Add preceding text if any
            if (match.index > lastIndex) {
                elements.push(text.substring(lastIndex, match.index));
            }
            // Handle bold text: **text**
            if (match[1]) {
                elements.push(<strong key={match.index}>{match[2]}</strong>);
            } 
            // Handle link: [text](url)
            else if (match[3]) {
                elements.push(
                    <a href={match[5]} key={match.index} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">
                        {match[4]}
                    </a>
                );
            }
            lastIndex = regex.lastIndex;
        }

        // Add any remaining text after the last match
        if (lastIndex < text.length) {
            elements.push(text.substring(lastIndex));
        }

        return <>{elements}</>;
    };

    const renderBlocks = () => {
        // Normalize newlines and then split by one or more empty lines to create blocks
        const blocks = content.replace(/\r\n/g, '\n').split(/\n\s*\n/);
        
        return blocks.map((block, index) => {
            // Headers
            if (block.startsWith('## ')) {
                return <h2 key={index} className="text-xl font-bold text-gray-100 mt-5 mb-2 border-b border-white/10 pb-1">{renderInline(block.substring(3))}</h2>;
            }
            if (block.startsWith('### ')) {
                return <h3 key={index} className="text-lg font-semibold text-gray-200 mt-4 mb-2">{renderInline(block.substring(4))}</h3>;
            }

            // Unordered Lists
            if (block.startsWith('* ') || block.startsWith('- ')) {
                const listItems = block.split('\n').map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start my-1">
                        <span className="mr-2 mt-1 text-accent-blue">•</span>
                        <span>{renderInline(item.replace(/^\s*(\*|-)\s/, ''))}</span>
                    </li>
                ));
                return <ul key={index} className="space-y-1">{listItems}</ul>;
            }

            // Default to paragraphs
            return <p key={index} className="my-2">{renderInline(block)}</p>;
        });
    };

    return (
        <div className="prose prose-invert prose-sm max-w-none text-gray-300">
            {renderBlocks()}
        </div>
    );
};

export default MarkdownRenderer;
