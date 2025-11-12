// FIX: Replaced incorrect HTML content with the required TypeScript module exporting 'MarketEvent' and 'historicalMarketData'. This resolves numerous parsing errors and allows dependent components to import the necessary data.

export interface MarketEvent {
    year: number;
    event: string;
    simulatedDowJonesIndex: number; // A simulated index to represent market beta
    impact?: {
        targetType: 'Sub_Category' | 'Country';
        targets: string[];
        alpha: number; // The "alpha" or shock to the system for targeted companies
    };
}

export const historicalMarketData: MarketEvent[] = [
    { year: 1992, event: "Early Internet Era Begins", simulatedDowJonesIndex: 3300 },
    { year: 1995, event: "Windows 95 & Netscape IPO", simulatedDowJonesIndex: 5117, impact: { targetType: 'Sub_Category', targets: ['Ethernet Switches', 'AI Servers'], alpha: 0.10 } },
    { year: 1999, event: "Dot-com Bubble Peak", simulatedDowJonesIndex: 11497, impact: { targetType: 'Sub_Category', targets: ['Ethernet Switches', 'Switching Silicon'], alpha: 0.20 } },
    { year: 2001, event: "Dot-com Bubble Bursts", simulatedDowJonesIndex: 8950, impact: { targetType: 'Sub_Category', targets: ['Ethernet Switches', 'Switching Silicon'], alpha: -0.35 } },
    { year: 2006, event: "Launch of AWS Cloud", simulatedDowJonesIndex: 12463, impact: { targetType: 'Sub_Category', targets: ['AI Servers', 'Ethernet Switches', 'UPS, PDUs, Cooling'], alpha: 0.15 } },
    { year: 2008, event: "Global Financial Crisis", simulatedDowJonesIndex: 8776, impact: { targetType: 'Country', targets: ['USA', 'Taiwan', 'Korea', 'Japan', 'Netherlands'], alpha: -0.30 } },
    { year: 2011, event: "Thailand Floods Disrupt HDD Supply", simulatedDowJonesIndex: 12231, impact: { targetType: 'Sub_Category', targets: ['AI Servers'], alpha: -0.10 } }, // Indirect via HDD
    { year: 2015, event: "AI/ML Investment Surge", simulatedDowJonesIndex: 17425, impact: { targetType: 'Sub_Category', targets: ['GPUs', 'AI Servers'], alpha: 0.20 } },
    { year: 2018, event: "US-China Trade Tensions", simulatedDowJonesIndex: 23327, impact: { targetType: 'Country', targets: ['Taiwan'], alpha: -0.10 } },
    { year: 2020, event: "COVID-19 Pandemic & WFH Boom", simulatedDowJonesIndex: 30606, impact: { targetType: 'Sub_Category', targets: ['Ethernet Switches', 'UPS, PDUs, Cooling', 'Connectors, Cables'], alpha: 0.25 } },
    { year: 2021, event: "Global Chip Shortage", simulatedDowJonesIndex: 36338, impact: { targetType: 'Sub_Category', targets: ['Semiconductor Fabrication', 'Lithography Equipment', 'Silicon Wafers'], alpha: 0.30 } },
    { year: 2023, event: "Generative AI Boom (ChatGPT)", simulatedDowJonesIndex: 37689, impact: { targetType: 'Sub_Category', targets: ['GPUs', 'HBM Memory', 'Semiconductor Fabrication', 'AI Servers', 'Lithography Equipment'], alpha: 0.40 } },
    { year: 2024, event: "Ongoing AI Infrastructure Buildout", simulatedDowJonesIndex: 39100, impact: { targetType: 'Sub_Category', targets: ['UPS, PDUs, Cooling', 'Power Cables', 'Structural Steel', 'Copper Mining'], alpha: 0.20 } }
];
