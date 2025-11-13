/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React, { useMemo } from 'react';

interface StockChartProps {
  ticker: string;
}

const generateStockData = (ticker: string) => {
  const data = [];
  // Use a simple hashing function on the ticker to create a deterministic but unique seed
  const seed = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  let price = 100 + (seed % 50); // Start price between 100 and 150
  const volatility = 0.5 + ((seed % 10) / 10); // Volatility between 0.5 and 1.5

  for (let i = 0; i < 60; i++) { // 60 data points
    const change = (Math.random() - 0.49) * volatility;
    price += change;
    if (price < 10) price = 10; // Floor price
    data.push({ x: i, y: price });
  }
  return data;
};

const StockChart: React.FC<StockChartProps> = ({ ticker }) => {
  const data = useMemo(() => generateStockData(ticker), [ticker]);

  const width = 300;
  const height = 120;
  const margin = { top: 5, right: 5, bottom: 5, left: 5 };
  const boundedWidth = width - margin.left - margin.right;
  const boundedHeight = height - margin.top - margin.bottom;

  const yMax = Math.max(...data.map(d => d.y)) * 1.05;
  const yMin = Math.min(...data.map(d => d.y)) * 0.95;
  const xMax = data.length - 1;

  const xScale = (x: number) => (x / xMax) * boundedWidth;
  const yScale = (y: number) => boundedHeight - ((y - yMin) / (yMax - yMin)) * boundedHeight;

  const path = data.map(d => `${xScale(d.x)},${yScale(d.y)}`).join(' L ');
  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];
  const isUp = lastPoint.y >= firstPoint.y;
  const strokeColor = isUp ? '#00FF88' : '#FF0080';

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id={`gradient-${ticker}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <path d={`M ${path}`} fill="none" stroke={strokeColor} strokeWidth="2" />
          <path d={`M ${xScale(firstPoint.x)},${yScale(firstPoint.y)} L ${path} L ${xScale(lastPoint.x)},${boundedHeight} L ${xScale(firstPoint.x)},${boundedHeight} Z`} fill={`url(#gradient-${ticker})`} />
        </g>
      </svg>
    </div>
  );
};

export default StockChart;