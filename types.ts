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
  Graham_Score?: number; // Score from 1-10 based on value investing principles
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
}

export type SupplyChainData = Record<string, SupplyChainNode>;
