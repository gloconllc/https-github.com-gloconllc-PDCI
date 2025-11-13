/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */

import React from 'react';

interface ChartData {
    year: number;
    portfolioValue: number;
    benchmarkValue: number;
}

interface LineChartProps {
    data: ChartData[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
    if (!data || data.length < 2) {
        return <div className="flex items-center justify-center h-full text-gray-500">Not enough data to display chart.</div>;
    }

    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const boundedWidth = width - margin.left - margin.right;
    const boundedHeight = height - margin.top - margin.bottom;

    const minYear = data[0].year;
    const maxYear = data[data.length - 1].year;
    const maxValue = Math.max(...data.flatMap(d => [d.portfolioValue, d.benchmarkValue]));

    const xScale = (year: number) => ((year - minYear) / (maxYear - minYear)) * boundedWidth;
    const yScale = (value: number) => boundedHeight - ((value / maxValue) * boundedHeight);

    const portfolioPath = data.map(d => `${xScale(d.year)},${yScale(d.portfolioValue)}`).join(' L ');
    const benchmarkPath = data.map(d => `${xScale(d.year)},${yScale(d.benchmarkValue)}`).join(' L ');

    const yAxisLabels = [0, 0.25, 0.5, 0.75, 1].map(p => p * maxValue);
    const xAxisLabels = data.filter((_, i) => data.length < 10 || i % Math.floor(data.length / 5) === 0);

    return (
        <div className="relative w-full h-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {/* Axes */}
                    <line x1="0" y1={boundedHeight} x2={boundedWidth} y2={boundedHeight} stroke="#566573" />
                    <line x1="0" y1="0" x2="0" y2={boundedHeight} stroke="#566573" />

                    {/* Y-Axis Labels */}
                    {yAxisLabels.map((value, i) => (
                        <g key={i} transform={`translate(0, ${yScale(value)})`}>
                            <line x1="-5" y1="0" x2={boundedWidth} y2="0" stroke="#2C3E50" strokeDasharray="2,2" />
                            <text x="-10" y="3" fill="#B0B8C8" textAnchor="end" fontSize="10">
                                ${value > 1000 ? `${(value/1000).toFixed(0)}k` : value.toFixed(0)}
                            </text>
                        </g>
                    ))}

                    {/* X-Axis Labels */}
                    {xAxisLabels.map((d, i) => (
                        <g key={i} transform={`translate(${xScale(d.year)}, ${boundedHeight})`}>
                            <text y="15" fill="#B0B8C8" textAnchor="middle" fontSize="10">{d.year}</text>
                        </g>
                    ))}

                    {/* Lines */}
                    <path d={`M ${portfolioPath}`} fill="none" stroke="#00D9FF" strokeWidth="2" />
                    <path d={`M ${benchmarkPath}`} fill="none" stroke="#B0B8C8" strokeWidth="2" strokeDasharray="4,4" />
                </g>
            </svg>
            <div className="absolute top-0 right-4 text-xs flex gap-4">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-accent-blue"></div>
                    <span>Strategy</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-gray-400 border-dashed border-t-2 border-gray-400"></div>
                    <span>Benchmark</span>
                </div>
            </div>
        </div>
    );
};

export default LineChart;