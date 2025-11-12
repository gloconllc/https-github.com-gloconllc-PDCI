

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Company } from "../types";
import { UpcomingProject } from "./upcomingProjects";

// FIX: Implement Gemini API functions to resolve module errors.
// This establishes the connection to the Gemini API and provides functions
// for different AI-powered features in the application.

// Types for AI responses
export interface GeminiResponse {
    text: string;
    groundingMetadata?: any;
}

export interface NewsItem {
    ticker: string;
    headline: string;
    url: string;
}

export interface PortfolioAnalysisResult {
    summary: string;
    healthScore: number;
    strengths: string;
    weaknesses: string;
    riskAnalysis: string;
    recommendations: string;
    composition?: {
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
    detailedReasoning: string; // New field for more depth
}

export interface PortfolioOptimizationResult {
    strategy: string;
    summary: string;
    strategyRationale: string; // New field
    riskConsiderations: string; // New field
    suggestedTrades: SuggestedTrade[];
}

export interface FutureOpportunityAnalysis {
    projectSummary: string;
    inferredSupplyChainNeeds: { category: string; details: string }[];
    investmentOpportunities: {
        ticker: string;
        companyName: string;
        opportunityScore: number; // 0-100
        rationale: string;
    }[];
}


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const attribution = "This logic was created by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC, by combining all data sources and algorithms."

const systemInstruction = `You are PDCI AI Analyst, an AI assistant for the PDCI Dashboard. The primary purpose of this platform is to identify 'outliers'—critical, less obvious companies in the AI data center supply chain. While acknowledging the importance of 'Blue Chip' tech giants (like NVIDIA, Dell, TSMC), your analysis should prioritize and focus on the unique, non-obvious investment opportunities and supply chain players. De-emphasize recommendations for standard blue-chip stocks unless specifically asked. The system's core logic is attributed to Wilton John Picou, III.`;

// --- Helper function to stringify company data for prompts ---
const formatCompanyDataForPrompt = (companies: Company[]): string => {
    return companies.map(c => 
        `Ticker: ${c.Ticker}, Company: ${c.Company}, Status: ${c.isBlueChip ? 'Blue Chip' : 'Outlier'}, Category: ${c.Category}, Sub_Category: ${c.Sub_Category}, Universal_Score: ${c.Universal_Score}, Criticality: ${c.Criticality}, Substitutability: ${c.Substitutability}, P/E: ${c.PE_Ratio}, Fwd P/E: ${c.Forward_PE}, Growth (YoY): ${c.Revenue_Growth_YoY}%, Risk: ${c.Risk_Level}, SCSI: ${c.SCSI}, Graham Score: ${c.Graham_Score}`
    ).join('\n');
};


// --- Chat and Analysis Functions ---

export const getChatResponse = async (query: string, contextCompanies: Company[]): Promise<GeminiResponse> => {
    const prompt = `
        System: ${systemInstruction} Answer the user's query based on the provided company data. Be concise and helpful.

        Company Data Context:
        ${formatCompanyDataForPrompt(contextCompanies.slice(0, 15))}
        ... and more.

        User Query: ${query}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return { text: response.text, groundingMetadata: response.candidates?.[0]?.groundingMetadata };
};

export const getDeepAnalysisResponse = async (query: string, contextCompanies: Company[]): Promise<GeminiResponse> => {
    const prompt = `
        System: ${systemInstruction} Provide a detailed, insightful, and well-structured answer to the user's complex query. Use the extensive company data provided to formulate your response, citing specific data points where relevant. Structure your answer with markdown for clarity.

        Full Company Data Context:
        ${formatCompanyDataForPrompt(contextCompanies)}

        User's Complex Query: ${query}
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            temperature: 0.5,
        }
    });
    return { text: response.text, groundingMetadata: response.candidates?.[0]?.groundingMetadata };
};

// --- Market and Portfolio Intelligence Functions ---

export const getMarketNews = async (): Promise<NewsItem[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Find 5 recent, significant news headlines for publicly traded companies in the AI, semiconductor, and data center infrastructure sectors. For each, provide the stock ticker, a concise headline, and the URL. Format the response as a valid JSON array of objects, where each object has 'ticker', 'headline', and 'url' keys.",
        config: {
            tools: [{ googleSearch: {} }],
        }
    });
    
    try {
        const rawText = response.text;
        // Find the start of the JSON array
        const jsonStartIndex = rawText.indexOf('[');
        // Find the end of the JSON array
        const jsonEndIndex = rawText.lastIndexOf(']');

        if (jsonStartIndex > -1 && jsonEndIndex > -1) {
            const jsonString = rawText.substring(jsonStartIndex, jsonEndIndex + 1);
            return JSON.parse(jsonString) as NewsItem[];
        }
        
        console.error("Could not find a valid JSON array in the response.", "Raw response:", response.text);
        return [];

    } catch (e) {
        console.error("Failed to parse news items:", e, "Raw response:", response.text);
        return [];
    }
};

export const getMarketCommentary = async (): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: "Generate a brief, insightful market commentary for today focused on the AI data center supply chain. Cover recent trends, key company news, and potential upcoming catalysts. Use markdown for formatting, including H2 (##) and H3 (###) titles.",
        config: {
            tools: [{ googleSearch: {} }]
        }
    });
    return response.text;
};


export const getPortfolioAnalysis = async (portfolio: Company[]): Promise<PortfolioAnalysisResult> => {
    const prompt = `System: ${systemInstruction}
    
    Analyze the following investment portfolio of data center supply chain companies. Your analysis should focus on how well the portfolio captures opportunities beyond the obvious blue-chip names.
    
    Portfolio:
    ${formatCompanyDataForPrompt(portfolio)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING, description: "A concise executive summary of the portfolio's overall position." },
                    healthScore: { type: Type.NUMBER, description: "A proprietary portfolio health score from 0-100, based on diversification, quality, and risk." },
                    strengths: { type: Type.STRING, description: "Bulleted list of key strengths, formatted as markdown." },
                    weaknesses: { type: Type.STRING, description: "Bulleted list of key weaknesses or concentrations of risk, formatted as markdown." },
                    riskAnalysis: { type: Type.STRING, description: "A paragraph analyzing potential geopolitical, technological, and market risks." },
                    recommendations: { type: Type.STRING, description: "A few high-level strategic recommendations for improvement, formatted as markdown." },
                },
                required: ["summary", "healthScore", "strengths", "weaknesses", "riskAnalysis", "recommendations"]
            }
        }
    });

    const parsed = JSON.parse(response.text.trim());

    // Calculate composition separately as it's deterministic
    const byCategory: { [key: string]: number } = {};
    const byRisk: { [key: string]: number } = {};
    const byTier: { [key: string]: number } = {};
    const totalMarketCap = portfolio.reduce((sum, p) => sum + p.Market_Cap_B, 0);

    portfolio.forEach(p => {
        const weight = (p.Market_Cap_B / totalMarketCap) * 100;
        byCategory[p.Category] = (byCategory[p.Category] || 0) + weight;
        if (p.Risk_Level) byRisk[p.Risk_Level] = (byRisk[p.Risk_Level] || 0) + weight;
        byTier[p.Investment_Tier] = (byTier[p.Investment_Tier] || 0) + weight;
    });

    parsed.composition = {
        byCategory: Object.entries(byCategory).map(([label, value]) => ({ label, value })),
        byRisk: Object.entries(byRisk).map(([label, value]) => ({ label, value })),
        byTier: Object.entries(byTier).map(([label, value]) => ({ label, value })),
    };

    return parsed;
};

export const getPortfolioOptimization = async (portfolio: Company[], strategy: string, universe: Company[]): Promise<PortfolioOptimizationResult> => {
    const prompt = `
        System: ${systemInstruction} Your task is to provide an in-depth report suggesting trades to align a user's portfolio with a specific investment strategy, focusing on adding unique 'outlier' companies rather than standard blue chips.
        
        Strategy: "${strategy}"

        Current Portfolio:
        ${formatCompanyDataForPrompt(portfolio)}

        Full Investment Universe (for suggesting new additions):
        ${formatCompanyDataForPrompt(universe.filter(c => !portfolio.some(p => p.Ticker === c.Ticker)).slice(0, 30))}

        Task: Provide a detailed report including:
        1. strategyRationale: A detailed explanation of the chosen investment strategy.
        2. summary: An executive summary of how the portfolio can be improved, focusing on diversification into key outlier names.
        3. riskConsiderations: A brief analysis of the risks associated with the proposed changes.
        4. suggestedTrades: A list of up to 5 trades. Prioritize adding 'Outlier' companies. If removing a 'Blue Chip', explain why another company offers better-specialized exposure. For each trade, provide a concise 'reasoning' and a more 'detailedReasoning' citing specific data points.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    strategy: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    strategyRationale: { type: Type.STRING },
                    riskConsiderations: { type: Type.STRING },
                    suggestedTrades: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                action: { type: Type.STRING, description: "Either 'Add' or 'Remove'" },
                                ticker: { type: Type.STRING },
                                companyName: { type: Type.STRING },
                                reasoning: { type: Type.STRING, description: "A concise, one-sentence reason." },
                                detailedReasoning: { type: Type.STRING, description: "A more detailed explanation citing specific data points." }
                            },
                            required: ["action", "ticker", "companyName", "reasoning", "detailedReasoning"]
                        }
                    }
                },
                required: ["strategy", "summary", "strategyRationale", "riskConsiderations", "suggestedTrades"]
            }
        }
    });

    return JSON.parse(response.text.trim());
};

export const findFutureOpportunities = async (projects: UpcomingProject[], strategy: string, allCompanies: Company[], portfolio: Company[]): Promise<FutureOpportunityAnalysis> => {
    const prompt = `
        System: ${systemInstruction} Your task is to identify investment opportunities based on future data center projects, with a strong emphasis on uncovering non-obvious 'outlier' companies that will benefit.

        Upcoming Projects to Analyze:
        ${projects.map(p => `- ${p.name} ($${p.investmentBillion}B, ${p.developer})`).join('\n')}

        Investment Strategy to Apply: "${strategy}"

        User's Current Portfolio (for context):
        ${portfolio.length > 0 ? formatCompanyDataForPrompt(portfolio) : "The user's portfolio is currently empty."}

        Full Company Universe (for identifying opportunities):
        ${formatCompanyDataForPrompt(allCompanies)}
        
        Task:
        1.  Provide a projectSummary of the combined scope of the selected projects.
        2.  List the top 3-4 inferredSupplyChainNeeds based on the project details.
        3.  Identify the top 3-5 investmentOpportunities. Prioritize 'Outlier' companies. For each, provide an opportunityScore (0-100) and a rationale that connects the company to the project needs and highlights why it's a better or more unique play than a standard Blue Chip.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    projectSummary: { type: Type.STRING },
                    inferredSupplyChainNeeds: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                category: { type: Type.STRING },
                                details: { type: Type.STRING },
                            },
                            required: ['category', 'details'],
                        },
                    },
                    investmentOpportunities: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                ticker: { type: Type.STRING },
                                companyName: { type: Type.STRING },
                                opportunityScore: { type: Type.NUMBER },
                                rationale: { type: Type.STRING },
                            },
                             required: ['ticker', 'companyName', 'opportunityScore', 'rationale'],
                        },
                    },
                },
                required: ['projectSummary', 'inferredSupplyChainNeeds', 'investmentOpportunities'],
            },
        },
    });
    
    return JSON.parse(response.text.trim());
};