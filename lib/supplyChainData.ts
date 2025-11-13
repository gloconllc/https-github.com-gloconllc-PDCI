/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import { SupplyChainData } from '../types';

export const supplyChainData: SupplyChainData = {
    // NVIDIA
    'NVDA': {
        ticker: 'NVDA',
        upstream: ['TSM', 'ASML', '000660.KS', 'ENTG', 'DD'],
        downstream: ['SMCI', 'DELL', 'ANET'],
        competitors: ['AMD', 'INTC'], // Placeholder for non-listed competitors
    },
    // TSMC
    'TSM': {
        ticker: 'TSM',
        upstream: ['ASML', '6488.TWO', 'ENTG', 'DD'],
        downstream: ['NVDA', 'AVGO'],
        competitors: ['SAMSUNG', 'INTC'], // Placeholders
    },
    // Super Micro
    'SMCI': {
        ticker: 'SMCI',
        upstream: ['NVDA', 'VRT', 'APH', 'TEL', 'NVT'],
        downstream: [],
        competitors: ['DELL', 'HPE'], // Placeholder
    },
    // Broadcom
    'AVGO': {
        ticker: 'AVGO',
        upstream: ['TSM'],
        downstream: ['ANET', 'APH'],
        competitors: ['MRVL'], // Placeholder
    },
    // SK Hynix
    '000660.KS': {
        ticker: '000660.KS',
        upstream: ['ASML', '6488.TWO', 'ENTG'],
        downstream: ['NVDA'],
        competitors: ['MU', 'SAMSUNG'], // Placeholders
    },
    // Vertiv
    'VRT': {
        ticker: 'VRT',
        upstream: ['ETN', 'SIEGY', 'CC', 'NVT', 'PH'],
        downstream: ['SMCI', 'DELL'],
        competitors: ['ETN', 'Schneider'], // Schneider is a placeholder
    },
    // Arista Networks
    'ANET': {
        ticker: 'ANET',
        upstream: ['AVGO', 'TSM', 'APH', 'TEL'],
        downstream: [],
        competitors: ['CSCO'], // Placeholder
    },
    // ASML
    'ASML': {
        ticker: 'ASML',
        upstream: ['DD'],
        downstream: ['TSM', '000660.KS'],
        competitors: [], // Monopoly
    },
    // Dell
    'DELL': {
        ticker: 'DELL',
        upstream: ['NVDA', 'VRT', 'ETN', 'APH', 'TEL'],
        downstream: [],
        competitors: ['SMCI', 'HPE'],
    },
    // Eaton
    'ETN': {
        ticker: 'ETN',
        upstream: ['DD'],
        downstream: ['VRT', 'SMCI', 'DELL', 'SIEGY'],
        competitors: ['VRT', 'Schneider'],
    },
    // GlobalWafers
    '6488.TWO': {
        ticker: '6488.TWO',
        upstream: ['DD'],
        downstream: ['TSM', '000660.KS'],
        competitors: ['3436.T', 'Shin-Etsu'],
    },
    // Siemens
    'SIEGY': {
        ticker: 'SIEGY',
        upstream: ['ETN', 'DD'],
        downstream: ['VRT'],
        competitors: ['ABB', 'Schneider'],
    },
    // Atkore
    'ATKR': {
        ticker: 'ATKR',
        upstream: ['NUE'],
        downstream: [],
        competitors: ['NVT'],
    },
    // nVent
    'NVT': {
        ticker: 'NVT',
        upstream: ['DD'],
        downstream: ['SMCI', 'VRT'],
        competitors: ['ATKR'],
    },
    // TE Connectivity
    'TEL': {
        ticker: 'TEL',
        upstream: ['DD'],
        downstream: ['SMCI', 'DELL', 'ANET'],
        competitors: ['APH'],
    },
    // Chemours
    'CC': {
        ticker: 'CC',
        upstream: [],
        downstream: ['VRT'],
        competitors: ['3M'],
    },
    // DuPont
    'DD': {
        ticker: 'DD',
        upstream: [],
        downstream: ['TSM', 'ASML', 'NVDA', 'ETN', '6488.TWO', 'TEL', 'NVT'],
        competitors: ['DOW', 'CC'],
    },
    // Entegris
    'ENTG': {
        ticker: 'ENTG',
        upstream: ['DD'],
        downstream: ['TSM', 'NVDA', '000660.KS'],
        competitors: [], // Niche leader
    },
    // Amphenol
    'APH': {
        ticker: 'APH',
        upstream: ['AVGO', 'DD'],
        downstream: ['SMCI', 'DELL', 'ANET'],
        competitors: ['TEL'],
    },
    // Parker-Hannifin
    'PH': {
        ticker: 'PH',
        upstream: ['DD'],
        downstream: ['VRT', 'CARR', 'TT'],
        competitors: ['EMR'],
    },
    // Kingspan Group
    'KGP.L': {
        ticker: 'KGP.L',
        upstream: ['NUE'],
        downstream: [],
        competitors: [], // Niche leader
    },
    // Nextracker
    'NXT': {
        ticker: 'NXT',
        upstream: ['NUE'],
        downstream: [],
        competitors: ['Array Technologies'],
    },
    // Nucor
    'NUE': {
        ticker: 'NUE',
        upstream: [],
        downstream: ['ATKR', 'KGP.L', 'NXT'],
        competitors: ['STLD'],
    },
    // Freeport-McMoRan
    'FCX': {
        ticker: 'FCX',
        upstream: [],
        downstream: ['PRY.MI', 'APH', 'TEL'],
        competitors: ['SCCO'],
    },
    // Southern Copper
    'SCCO': {
        ticker: 'SCCO',
        upstream: [],
        downstream: ['PRY.MI', 'APH', 'TEL'],
        competitors: ['FCX'],
    },
    // Prysmian
    'PRY.MI': {
        ticker: 'PRY.MI',
        upstream: ['FCX', 'SCCO'],
        downstream: [],
        competitors: ['NKT'],
    },
};