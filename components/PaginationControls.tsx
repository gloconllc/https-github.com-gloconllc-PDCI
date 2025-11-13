/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React from 'react';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) {
        return null;
    }

    const getPaginationItems = (currentPage: number, totalPages: number): (string | number)[] => {
        const delta = 1; // number of pages on each side of current page
        const left = currentPage - delta;
        const right = currentPage + delta + 1;
        const range: number[] = [];
        const rangeWithDots: (string | number)[] = [];
        let l: number | undefined;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= left && i < right)) {
                range.push(i);
            }
        }

        for (const i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    const pageItems = getPaginationItems(currentPage, totalPages);

    return (
        <div className="flex items-center justify-center gap-2 p-3 bg-white/5 border-t border-white/10 flex-wrap">
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="btn btn-secondary p-2"
                aria-label="First page"
                title="First page"
            >
                &laquo;
            </button>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary p-2"
                aria-label="Previous page"
                title="Previous page"
            >
                &larr;
            </button>
            
            <div className="flex items-center gap-2">
                {pageItems.map((page, index) =>
                    typeof page === 'number' ? (
                        <button
                            key={index}
                            onClick={() => onPageChange(page)}
                            disabled={currentPage === page}
                            className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'} text-sm`}
                        >
                            {page}
                        </button>
                    ) : (
                        <span key={index} className="px-2 py-1 text-gray-500 select-none">...</span>
                    )
                )}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary p-2"
                aria-label="Next page"
                title="Next page"
            >
                &rarr;
            </button>
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary p-2"
                aria-label="Last page"
                title="Last page"
            >
                &raquo;
            </button>
        </div>
    );
};

export default PaginationControls;