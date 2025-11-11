
export interface MarketEvent {
    year: number;
    event: string;
    simulatedDowJonesIndex: number;
}

export const historicalMarketData: MarketEvent[] = [
    { year: 1992, event: "Start of modern internet era", simulatedDowJonesIndex: 3300 },
    { year: 1995, event: "Dot-com boom begins", simulatedDowJonesIndex: 5100 },
    { year: 2000, event: "Dot-com bubble peaks and bursts", simulatedDowJonesIndex: 11700 },
    { year: 2002, event: "Market bottom after tech wreck", simulatedDowJonesIndex: 7300 },
    { year: 2007, event: "Pre-financial crisis peak", simulatedDowJonesIndex: 14100 },
    { year: 2009, event: "Great Financial Crisis bottom", simulatedDowJonesIndex: 6600 },
    { year: 2013, event: "Quantitative Easing (QE) bull market", simulatedDowJonesIndex: 16500 },
    { year: 2018, event: "Start of cloud and early AI adoption", simulatedDowJonesIndex: 26000 },
    { year: 2020, event: "COVID-19 pandemic crash and recovery", simulatedDowJonesIndex: 29000 },
    { year: 2023, event: "Generative AI boom begins", simulatedDowJonesIndex: 37000 },
    { year: 2024, event: "Current market conditions", simulatedDowJonesIndex: 40000 }
];
