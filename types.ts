/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
export enum InvestmentTier {
  MustBuy = 'MUST BUY',
  HighConviction = 'HIGH CONVICTION',
  OnRadar = 'ON RADAR',
}

export enum RiskLevel {
  Conservative = 'Conservative',
  Moderate = 'Moderate',
  Aggressive = 'Aggressive',
  High = 'High',
}

export enum GeopoliticalRiskLevel {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    VeryHigh = 'Very High',
}

export type Substitutability = 'Impossible' | 'Difficult' | 'Moderate' | 'Easy';

export interface Company {
  Company: string;
  Ticker: string;
  Exchange: string;
  Current_Price_USD: number;
  Market_Cap_B: number;
  Shares_Outstanding_M: number;
  Float_Percent: number;
  Category: string;
  Sub_Category: string;
  Product_Component: string;
  Universal_Presence: string;
  Investment_Tier: InvestmentTier;
  Geographic_Presence: string;
  Recent_Contracts_2024_2025: string;
  Growth_Driver: string;
  Risk_Level: RiskLevel;
  Competitive_Position: string;
  Supply_Chain_Role: string;
  // New fields for advanced analysis
  Universal_Score: number;
  Criticality: number;
  Substitutability: Substitutability;
  YTD_Performance: number;
  logoUrl: string;
  // New BI Fields from Framework
  Country: string;
  Substitutability_Score: number; // Impossible=0, Difficult=30, Moderate=60, Easy=100
  Supply_Chain_Depth_Score: number; // Raw Material=100, Component=70, System=40, Software=10
  SCSI: number; // Supply Constraint Severity Index
  ESG_Score?: number;
  // New valuation and financial health metrics
  PE_Ratio: number;
  Forward_PE: number;
  Revenue_Growth_YoY: number; // in percent
  Debt_to_Equity: number;
  // New qualitative/wisdom metric
  isBlueChip?: boolean;
  Graham_Score?: number; // Score from 1-10 based on value investing principles
  // New predictive metrics
  Psych_Score?: number; // 0-100 score quantifying market sentiment and behavioral drivers.
  Buy_Rank?: number; // Overall rank of all companies in the universe.
  Probability_Of_Success?: number; // AI-driven confidence level (0-100%)
  // New Geopolitical Fields
  Geopolitical_Risk: GeopoliticalRiskLevel;
  Geopolitical_Risk_Score: number; // 0-100, higher is riskier
  Geopolitical_Notes: string;
  // New financial metrics
  '52_Week_High': number;
  '52_Week_Low': number;
  'Avg_Volume': number; // in millions
  'EPS': number;
  'Dividend_Yield': number; // in percent
  'Beta': number;
}

export interface SortConfig {
  key: keyof Company;
  direction: 'ascending' | 'descending';
}

// Types for the new Supply Chain Visualizer
export interface SupplyChainNode {
    ticker: string;
    upstream: string[]; // Tickers of suppliers
    downstream: string[]; // Tickers of customers
    competitors: string[]; // Tickers of direct competitors
}

export type SupplyChainData = Record<string, SupplyChainNode>;

// Types for new AI-driven analysis reports in CompanyModal
export interface FinancialHealthAnalysis {
    valuation: string;
    financialHealth: string;
    catalysts: string;
    risks: string;
}

export interface PredictiveAnalysis {
    keyPredictors: { predictor: string; rationale: string }[];
    modelConfidence: number; // 0-100
    outlook: string;
    projectedMetrics?: {
        PE_Ratio: string;
        Revenue_Growth: string;
        Geopolitical_Risk_Trend: string;
    };
}

export interface StockPrediction {
    prediction: 'Bullish' | 'Neutral' | 'Bearish' | 'Outperform' | 'Underperform';
    priceTarget?: number;
    confidence: number; // 0-100
    rationale: string;
    timescale: string; // e.g., "6-12 months"
}

// Type for Data Context Visualizer
export interface Hotspot {
    id: string;
    title: string;
    description: string;
    coordinates: { top: string; left: string; width: string; height: string; };
    associatedCategories: string[];
}

export interface UserGoal {
    targetAmount: number;
    initialInvestment: number;
    horizon: number;
}

// Types for Goal Planner Modal
export interface GoalPlannerResult {
    strategySummary: string;
    hypotheticalPortfolio: {
        ticker: string;
        companyName: string;
        rationale: string;
    }[];
    growthProjection: {
        year: number;
        projectedValue: number;
        commentary: string;
    }[];
    keyAssumptions: string;
    realWorldExample: {
        title: string;
        narrative: string;
        sourceUrl: string;
    };
    disclaimer: string;
}

export interface PortfolioAnalysisResult {
    summary: string;
    healthScore: number;
    strengths: string;
    weaknesses: string;
    riskAnalysis: string;
    recommendations: string;
    composition: {
        byCategory: { label: string; value: number }[];
        byRisk: { label: string; value: number }[];
        byTier: { label: string; value: number }[];
    };
}

export interface SuggestedTrade {
    action: 'Add' | 'Remove';
    ticker: string;
    companyName: string;
    reasoning: string;
    detailedReasoning: string;
}

export interface PortfolioOptimizationResult {
    strategy: string;
    summary: string;
    strategyRationale: string;
    riskConsiderations: string;
    suggestedTrades: SuggestedTrade[];
}

declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }

    interface Window {
        aistudio?: AIStudio;
        html2canvas: any;
        jspdf: any;
    }
}