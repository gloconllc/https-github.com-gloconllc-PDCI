import React from 'react';

interface GaugeProps {
    value: number;
    max: number;
    label: string;
}

const Gauge: React.FC<GaugeProps> = ({ value, max, label }) => {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));
    const circumference = 2 * Math.PI * 28; // 2 * pi * r
    const offset = circumference - (percentage / 100) * circumference;

    const getColor = () => {
        if (percentage >= 80) return '#00FF88'; // accent-green
        if (percentage >= 60) return '#00D9FF'; // accent-blue
        if (percentage >= 40) return '#FFD700'; // yellow
        return '#FF0080'; // accent-red
    };

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <div className="relative w-20 h-20">
                <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 60 60">
                    <circle
                        cx="30"
                        cy="30"
                        r="28"
                        stroke="#2C3E50" // gray-700
                        strokeWidth="4"
                        fill="transparent"
                    />
                    <circle
                        cx="30"
                        cy="30"
                        r="28"
                        stroke={getColor()}
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                    />
                </svg>
                <span className="absolute text-xl font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: getColor() }}>
                    {value}
                </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
        </div>
    );
};

export default Gauge;
