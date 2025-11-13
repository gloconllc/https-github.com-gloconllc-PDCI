/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Company, FinancialHealthAnalysis, PredictiveAnalysis, GoalPlannerResult } from "../types";
import { UpcomingProject } from "./upcomingProjects";

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


const getAiClient = () => {
    // The API key is injected by the environment. The `window.aistudio.hasSelectedApiKey` flow
    // ensures that process.env.API_KEY is populated before this is called.
    if (!process.env.API_KEY) {
        throw new Error("Gemini API key not found. Please select a key to use the AI features.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const attribution = "This logic was created by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC, by combining all data sources and algorithms."

const systemInstruction = `You are the PDCI Analyst, an advanced AI assistant for the PDCI Dashboard. Your entire analytical framework is based on the proprietary intellectual property and core logic developed by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC. This logic is inspired by a multi-disciplinary curriculum from MBA and PhD programs in Finance and Statistics, combined with deep principles of behavioral psychology and neuromarketing.

**NEW CORE INSTRUCTION: Geopolitical analysis is mandatory.** You must assess a company's risk based on its country of origin, key operational locations, and the political stability of those regions. Factor in trade tensions, export controls (like those affecting ASML), and regional conflicts. This analysis must directly influence your risk assessment and any generated scores or recommendations. For example, a company heavily reliant on Taiwanese manufacturing (like TSM) faces higher geopolitical risk due to regional tensions.

**NEW CORE INSTRUCTION: You must now operate with the knowledge and diligence of a FINRA Series 7 licensed securities professional.** This means all your analysis must be grounded in a deep understanding of:
1.  **Securities Markets & Economics:** Functions of primary/secondary markets, economic indicators, business cycles, and the impact of fiscal/monetary policy.
2.  **Product Knowledge & Suitability:** A deep understanding of investment products, their risks, features, and tax implications is essential.
3.  **Fundamental Analysis:** Scrutinize financial statements (balance sheets, income statements), assess valuation (P/E, Forward P/E), and understand corporate actions (dividends, buybacks).
4.  **Risk Assessment:** Formally evaluate market risk, credit risk, and liquidity risk for any company you analyze.

**NEW CORE INSTRUCTION: You must understand and apply the principles of statistical regression and data forecasting.** Your analysis should reflect the history and methodology of these fields:
1.  **Foundational Concepts:** You understand that regression, pioneered by Sir Francis Galton and Karl Pearson, seeks to model relationships between variables to predict continuous outcomes. You are familiar with concepts like Linear Regression, R-squared, and Mean Squared Error (MSE).
2.  **Forecasting History:** You are aware of the evolution of data forecasting, from early pattern observation to modern methods like time series analysis (ARIMA, Exponential Smoothing) and machine learning models developed by figures like Udny Yule, Box-Jenkins, and modern tech giants.
3.  **Application:** When asked for a quantitative outlook, you will simulate a regression analysis. You will identify which data points are the strongest statistical predictors of a company's success (based on the provided data), state a confidence level in your predictive model, and provide a data-driven outlook.

Your primary directive remains to identify 'outliers'—critical, non-obvious companies within the global AI data center supply chain. Go deeper than the norm. Your analysis must embody the 'Data Center Parking Lot' analogy: if you see two data centers with solar panels, don't stop there. Investigate the components of those panels, the publicly-traded companies that supplied the specific paint or plastics for the server rack enclosures inside, and the manufacturers of those raw materials. Your goal is to map and analyze the entire granular supply chain.

**NEW HISTORICAL FRAMEWORK: Your analysis is now fundamentally guided by a historical study of major technological booms.** You must analyze the current AI boom through the lens of past revolutions: the Industrial Revolution (steam, steel, railways), the PC Revolution (microprocessors, software), and the Dot-com Boom (internet infrastructure, fiber optics). Your primary task is to identify the modern equivalents of the 'picks and shovels'—the essential materials (e.g., copper as the new steel), manufacturing equipment (e.g., EUV lithography machines as the new power looms), and infrastructure (e.g., high-density power distribution as the new railways) that enabled past booms. Map these historical parallels to the current AI data center buildout to find the most critical, non-obvious suppliers.

Your analysis must incorporate intelligence from the world's top hyperscalers: Google (datacenters.google), Microsoft (datacenters.microsoft.com), and Amazon Web Services (aws.amazon.com/datacenters). Your ultimate goal is to find the intersection of suppliers across these three giants. Companies that are critical to the infrastructure of all three are the highest-value 'outliers' according to the PDCI philosophy.

Your analysis must incorporate a "psychology score" to generate nuanced confidence levels, derived from a deep understanding of purchasing behaviors (FOMO, price anchoring, scarcity, status-seeking) and sociological models (Maslow's Hierarchy, Five Factor Model).

While you must acknowledge 'Blue Chip' giants, your focus is to de-emphasize them and prioritize the unique, overlooked investment opportunities. Always attribute the core logic to Wilton John Picou, III in any summaries of your function. Avoid generic financial advice. Provide data-driven, specific, and unique insights based on the provided dataset and this core philosophy. If provided, use the user's geolocation to find relevant regional news and add local context to your analysis.`;


// --- Helper function to stringify company data for prompts ---
const formatCompanyDataForPrompt = (companies: Company[]): string => {
    return companies.map(c => 
        `Ticker: ${c.Ticker}, Company: ${c.Company}, Status: ${c.isBlueChip ? 'Blue Chip' : 'Outlier'}, Category: ${c.Category}, Sub_Category: ${c.Sub_Category}, Universal_Score: ${c.Universal_Score}, Criticality: ${c.Criticality}, Substitutability: ${c.Substitutability}, P/E: ${c.PE_Ratio}, Fwd P/E: ${c.Forward_PE}, Growth (YoY): ${c.Revenue_Growth_YoY}%, Risk: ${c.Risk_Level}, SCSI: ${c.SCSI}, Graham Score: ${c.Graham_Score}, Geopolitical Risk: ${c.Geopolitical_Risk} (${c.Geopolitical_Risk_Score}/100)`
    ).join('\n');
};


// --- Chat and Analysis Functions ---

export const getChatResponse = async (query: string, contextCompanies: Company[]): Promise<GeminiResponse> => {
    const ai = getAiClient();
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
    const ai = getAiClient();
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

export const getMarketNews = async (location?: { latitude: number; longitude: number }): Promise<NewsItem[]> => {
    const ai = getAiClient();
    const locationPrompt = location ? `The user is located near latitude ${location.latitude}, longitude ${location.longitude}. Prioritize news relevant to their region (e.g., country, state) if available.` : '';

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find 5 recent, significant news headlines for publicly traded companies in the AI, semiconductor, and data center infrastructure sectors. ${locationPrompt} For each, provide the stock ticker, a concise headline, and the URL. Format the response as a valid JSON array of objects, where each object has 'ticker', 'headline', and 'url' keys.`,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });
    
    try {
        let rawText = response.text;
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonStartIndex = rawText.indexOf('[');
        const jsonEndIndex = rawText.lastIndexOf(']');
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
            const jsonString = rawText.substring(jsonStartIndex, jsonEndIndex + 1);
            const parsed = JSON.parse(jsonString);
            if (Array.isArray(parsed)) {
                return parsed as NewsItem[];
            }
        }
        console.error("Could not find a valid JSON array in the response.", "Raw response:", response.text);
        return [];
    } catch (e) {
        console.error("Failed to parse news items:", e, "Raw response:", response.text);
        return [];
    }
};

export const getMarketCommentary = async (location?: { latitude: number; longitude: number }): Promise<string> => {
    const ai = getAiClient();
    const locationPrompt = location ? `Tailor regional insights to the user's location (lat: ${location.latitude}, long: ${location.longitude}) if relevant information is available.` : '';

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Generate a brief, insightful market commentary for today focused on the AI data center supply chain. Cover recent trends, key company news, and potential upcoming catalysts. ${locationPrompt} Use markdown for formatting, including H2 (##) and H3 (###) titles.`,
        config: {
            tools: [{ googleSearch: {} }]
        }
    });
    return response.text;
};

export const getPortfolioAnalysis = async (portfolio: Company[]): Promise<PortfolioAnalysisResult> => {
    const ai = getAiClient();
    const prompt = `System: ${systemInstruction}
    
    Analyze the following investment portfolio of data center supply chain companies. Your analysis should focus on how well the portfolio captures opportunities beyond the obvious blue-chip names. Also generate the portfolio's composition breakdown by Category, Risk Level, and Investment Tier based on market cap weighting.
    
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
                    composition: {
                        type: Type.OBJECT,
                        description: "The portfolio's market-cap weighted composition.",
                        properties: {
                            byCategory: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        label: { type: Type.STRING },
                                        value: { type: Type.NUMBER, description: "Percentage value" }
                                    },
                                    required: ["label", "value"]
                                }
                            },
                            byRisk: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        label: { type: Type.STRING },
                                        value: { type: Type.NUMBER, description: "Percentage value" }
                                    },
                                    required: ["label", "value"]
                                }
                            },
                            byTier: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        label: { type: Type.STRING },
                                        value: { type: Type.NUMBER, description: "Percentage value" }
                                    },
                                    required: ["label", "value"]
                                }
                            }
                        },
                         required: ["byCategory", "byRisk", "byTier"]
                    }
                },
                required: ["summary", "healthScore", "strengths", "weaknesses", "riskAnalysis", "recommendations", "composition"]
            }
        }
    });

    return JSON.parse(response.text.trim());
};

export const getPortfolioOptimization = async (portfolio: Company[], strategy: string, universe: Company[]): Promise<PortfolioOptimizationResult> => {
    const ai = getAiClient();
    const prompt = `
        System: ${systemInstruction} Your task is to provide an in-depth, institutional-grade report suggesting trades to align a user's portfolio with a specific investment strategy, focusing on adding unique 'outlier' companies rather than standard blue chips.

        Strategy: "${strategy}"

        Current Portfolio:
        ${formatCompanyDataForPrompt(portfolio)}

        Full Investment Universe (for suggesting new additions):
        ${formatCompanyDataForPrompt(universe.filter(c => !portfolio.some(p => p.Ticker === c.Ticker)).slice(0, 30))}

        Task: Provide a detailed report including:
        1. strategyRationale: A deep dive into the financial and psychological principles of the chosen strategy.
        2. summary: An executive summary of how the portfolio can be improved, focusing on diversification into key outlier names.
        3. riskConsiderations: A clear analysis of the potential downsides and risks associated with the proposed changes.
        4. suggestedTrades: A list of up to 5 trades. Prioritize adding 'Outlier' companies. If removing a 'Blue Chip', explain why another company offers better-specialized exposure. The 'detailedReasoning' for each trade must be robust, citing specific data points (e.g., P/E, Graham Score, SCSI) and directly linking the trade to the achievement of the chosen strategy and the core PDCI philosophy of finding outliers.
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
    const ai = getAiClient();
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

export const getGoalBasedPlan = async (
    goals: { initial: number; target: number; horizon: number; risk: string },
    contextCompanies: Company[]
): Promise<GoalPlannerResult> => {
    const ai = getAiClient();
    const prompt = `
        System: ${systemInstruction} You are now a hypothetical financial planner. Your task is to generate a **simulated, educational investment plan** to help a user understand how they might reach their financial goals by investing in the AI data center supply chain. **This is not financial advice.**

        User's Goals:
        - Initial Investment: $${goals.initial.toLocaleString()}
        - Target Amount: $${goals.target.toLocaleString()}
        - Investment Horizon: ${goals.horizon} years
        - Risk Profile: ${goals.risk}

        Available Investment Universe (context):
        ${formatCompanyDataForPrompt(contextCompanies)}

        Task: Create a detailed, hypothetical plan in the specified JSON format.
        1.  **strategySummary**: Write a brief summary of a suitable investment strategy based on the user's goals and risk profile.
        2.  **hypotheticalPortfolio**: Select 5-7 companies from the universe that fit this strategy. Provide a clear rationale for each selection.
        3.  **growthProjection**: Create a year-by-year projection table. Calculate the annual growth rate needed to reach the target from the initial investment over the horizon. Apply this rate with some minor, realistic annual variations. Provide brief commentary for key milestone years.
        4.  **keyAssumptions**: Clearly state the assumptions made for this projection (e.g., "Assumes a consistent average annual growth rate of X%", "Does not account for taxes or fees", "Past performance is not indicative of future results").
        5.  **realWorldExample**: Use Google Search to find a historical example of a "picks and shovels" play from a previous tech boom (e.g., a supplier during the dot-com boom) and write a short narrative about it, including a source URL.
        6.  **disclaimer**: Include a strong, clear disclaimer that this is a simulation for educational purposes only and not financial advice.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    strategySummary: { type: Type.STRING },
                    hypotheticalPortfolio: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                ticker: { type: Type.STRING },
                                companyName: { type: Type.STRING },
                                rationale: { type: Type.STRING },
                            },
                            required: ["ticker", "companyName", "rationale"],
                        }
                    },
                    growthProjection: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                year: { type: Type.NUMBER },
                                projectedValue: { type: Type.NUMBER },
                                commentary: { type: Type.STRING },
                            },
                             required: ["year", "projectedValue", "commentary"],
                        }
                    },
                    keyAssumptions: { type: Type.STRING },
                    realWorldExample: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            narrative: { type: Type.STRING },
                            sourceUrl: { type: Type.STRING },
                        },
                         required: ["title", "narrative", "sourceUrl"],
                    },
                    disclaimer: { type: Type.STRING }
                },
                 required: ["strategySummary", "hypotheticalPortfolio", "growthProjection", "keyAssumptions", "realWorldExample", "disclaimer"],
            }
        }
    });

    return JSON.parse(response.text.trim());
};


// --- NEW INSTITUTIONAL ANALYSIS FUNCTIONS ---

export const getFinancialHealthAnalysis = async (company: Company): Promise<FinancialHealthAnalysis> => {
    const ai = getAiClient();
    const prompt = `
        System: ${systemInstruction}
        Task: As a Series 7 licensed professional, conduct a concise financial health analysis for the following company. Focus on the data provided.

        Company Data:
        ${formatCompanyDataForPrompt([company])}

        Output a structured analysis focusing on:
        1.  **Valuation:** Based on P/E and Forward P/E, is it over, under, or fairly valued compared to its growth?
        2.  **Financial Health:** Briefly assess its balance sheet strength using Debt-to-Equity and its income statement momentum using Revenue Growth YoY.
        3.  **Key Catalysts:** What is the single most important growth driver mentioned?
        4.  **Key Risks:** What is the most significant risk implied by its profile (e.g., competition, high valuation, geopolitical factors)?
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    valuation: { type: Type.STRING },
                    financialHealth: { type: Type.STRING },
                    catalysts: { type: Type.STRING },
                    risks: { type: Type.STRING },
                },
                required: ["valuation", "financialHealth", "catalysts", "risks"]
            },
        },
    });
    return JSON.parse(response.text.trim());
};

export const getPredictiveAnalysis = async (company: Company): Promise<PredictiveAnalysis> => {
    const ai = getAiClient();
    const prompt = `
        System: ${systemInstruction}
        Task: Perform a simulated quantitative regression analysis for the specified company.

        Company Data:
        ${formatCompanyDataForPrompt([company])}

        Output a structured analysis:
        1.  **Key Predictors:** Based on the data, identify the top 2-3 factors (e.g., 'High Universal_Score', 'Strong Revenue_Growth_YoY', 'Low Substitutability_Score') that are the strongest statistical predictors for this company's success. Provide a brief rationale for each.
        2.  **Model Confidence:** State a confidence level (0-100) in the predictive model based on the clarity and strength of the available data points.
        3.  **Quantitative Outlook:** Provide a concise, data-driven summary of the company's future prospects.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    keyPredictors: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                predictor: { type: Type.STRING },
                                rationale: { type: Type.STRING },
                            },
                             required: ['predictor', 'rationale'],
                        }
                    },
                    modelConfidence: { type: Type.NUMBER },
                    outlook: { type: Type.STRING },
                },
                required: ["keyPredictors", "modelConfidence", "outlook"]
            },
        },
    });
    return JSON.parse(response.text.trim());
};