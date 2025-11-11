import { SupplyChainData } from '../types';

// This data defines the direct relationships for the Supply Chain Visualizer.
// It's a simplified representation based on the company descriptions.
export const supplyChainData: SupplyChainData = {
    // Computing
    "TSM": { ticker: "TSM", upstream: ["6488.TW", "3436.T"], downstream: ["AVGO", "SMCI"] },
    "6488.TW": { ticker: "6488.TW", upstream: [], downstream: ["TSM"] },
    "3436.T": { ticker: "3436.T", upstream: [], downstream: ["TSM"] },
    "000660.KS": { ticker: "000660.KS", upstream: [], downstream: ["SMCI", "DELL"] },
    // Raw Materials & Construction
    "FCX": { ticker: "FCX", upstream: [], downstream: ["PRY.MI", "APH"] },
    "SCCO": { ticker: "SCCO", upstream: [], downstream: ["PRY.MI", "APH"] },
    "MP": { ticker: "MP", upstream: [], downstream: ["STX", "WDC"] },
    "NUE": { ticker: "NUE", upstream: [], downstream: ["SMCI", "DELL"] },
    "VMC": { ticker: "VMC", upstream: [], downstream: [] }, // Sells to contractors, end of chain here
    "MLM": { ticker: "MLM", upstream: [], downstream: [] }, // Sells to contractors
    // Networking
    "ANET": { ticker: "ANET", upstream: ["AVGO"], downstream: [] }, // Sells to end users
    "AVGO": { ticker: "AVGO", upstream: ["TSM"], downstream: ["ANET"] },
    "CRDO": { ticker: "CRDO", upstream: [], downstream: ["ANET"] },
    // Storage
    "STX": { ticker: "STX", upstream: ["MP"], downstream: [] }, // Sells to integrators/end users
    "WDC": { ticker: "WDC", upstream: ["MP"], downstream: [] }, // Sells to integrators/end users
    // Power & Cooling
    "VRT": { ticker: "VRT", upstream: ["ENS", "EMR"], downstream: [] },
    "ETN": { ticker: "ETN", upstream: ["NUE", "FCX"], downstream: [] },
    "SBGSY": { ticker: "SBGSY", upstream: ["NUE", "FCX"], downstream: [] },
    "CAT": { ticker: "CAT", upstream: ["NUE"], downstream: [] },
    "CMI": { ticker: "CMI", upstream: ["NUE"], downstream: [] },
    "ENS": { ticker: "ENS", upstream: [], downstream: ["VRT", "ETN", "SBGSY"] },
    // Interconnects
    "APH": { ticker: "APH", upstream: ["FCX", "DOW"], downstream: ["SMCI", "DELL", "ANET"] },
    "PRY.MI": { ticker: "PRY.MI", upstream: ["FCX", "DOW"], downstream: ["ETN", "SBGSY"] },
    // Hardware & Components
    "SMCI": { ticker: "SMCI", upstream: ["TSM", "000660.KS", "NUE", "TTMI"], downstream: [] },
    "DELL": { ticker: "DELL", upstream: ["000660.KS", "NUE", "TTMI", "WDC", "STX"], downstream: [] },
    "6981.T": { ticker: "6981.T", upstream: [], downstream: ["TTMI", "SANM"] },
    "2327.TW": { ticker: "2327.TW", upstream: [], downstream: ["TTMI", "SANM"] },
    "VSH": { ticker: "VSH", upstream: [], downstream: ["TTMI", "SANM"] },
    "TTMI": { ticker: "TTMI", upstream: ["6981.T", "2327.TW", "VSH", "DD"], downstream: ["SMCI", "DELL"] },
    "SANM": { ticker: "SANM", upstream: ["6981.T", "2327.TW", "VSH"], downstream: ["DELL"] },
    "JBL": { ticker: "JBL", upstream: ["TTMI"], downstream: ["DELL"] },
    // Materials
    "DOW": { ticker: "DOW", upstream: [], downstream: ["APH", "PRY.MI"] },
    "DD": { ticker: "DD", upstream: [], downstream: ["TTMI", "APH"] },
    "PPG": { ticker: "PPG", upstream: [], downstream: ["NUE"] },
    // Other
    "CARR": { ticker: "CARR", upstream: [], downstream: [] },
    "TT": { ticker: "TT", upstream: [], downstream: [] },
    "HON": { ticker: "HON", upstream: [], downstream: [] },
    "JCI": { ticker: "JCI", upstream: [], downstream: [] },
    "COHR": { ticker: "COHR", upstream: [], downstream: ["ANET"] },
    "EMR": { ticker: "EMR", upstream: [], downstream: ["VRT", "ETN"] },
    "LIGHT.AS": { ticker: "LIGHT.AS", upstream: [], downstream: [] },
    "ABB": { ticker: "ABB", upstream: ["NUE", "FCX"], downstream: [] }
};
