import React, { useMemo } from 'react';

interface SparklineProps {
  ticker: string;
}

// This function generates a deterministic, pseudo-random chart based on the ticker
const generateSparklineData = (ticker: string) => {
  const data = [];
  const seed = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  let price = 100 + (seed % 50);
  const volatility = 0.5 + ((seed % 10) / 10);

  for (let i = 0; i < 30; i++) { // 30 data points for the sparkline
    const change = (Math.random() - 0.49) * volatility;
    price += change;
    data.push(price < 0 ? 0 : price);
  }
  return data;
};

const Sparkline: React.FC<SparklineProps> = ({ ticker }) => {
  const data = useMemo(() => generateSparklineData(ticker), [ticker]);

  const width = 100;
  const height = 40;
  const yMax = Math.max(...data);
  const yMin = Math.min(...data);
  const xMax = data.length - 1;

  const getCoordinates = (value: number, index: number) => {
    const y = height - ((value - yMin) / (yMax - yMin || 1)) * height;
    const x = (index / (xMax || 1)) * width;
    return `${x},${y}`;
  };

  const path = data.map(getCoordinates).join(' L ');
  const isUp = data[data.length - 1] >= data[0];
  const strokeColor = isUp ? '#00FF88' : '#FF0080';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <path d={`M ${path}`} fill="none" stroke={strokeColor} strokeWidth="2" />
    </svg>
  );
};

export default Sparkline;
