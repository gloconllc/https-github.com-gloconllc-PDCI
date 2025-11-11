

import { GoogleGenAI, Type } from "@google/genai";
import { Company } from "./types";
import { historicalMarketData } from "./historicalMarketData";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface GeminiResponse {
    text: string;
    groundingMetadata?: any; // To hold citations
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
    recommendations: string;
    riskAnalysis: string;
    composition: {
        byCategory: { label: string; value: number }[];
        byRisk: { label: string; value: number }[];
        byTier: { label: string; value: number }[];
    };
}

export interface ScholarlyReport {
    annualAlpha: number;
    pValue: number;
    sharpeRatio: number;
    informationRatio: number;
    maxDrawdown: number;
    confidenceInterval: { lower: number; upper: number };
    summary: string;
    recommendation: 'Academically Validated Buy' | 'Hold/Neutral' | 'Academically Invalidated';
}

export interface ScenarioAnalysisResult {
    resilienceScore: number;
    impactSummary: string;
    affectedCompanies: {
        ticker: string;
        companyName: string;
        projectedImpact: number; // -10 (highly negative) to +10 (highly positive)
        reasoning: string;
    }[];
    recommendations: string;
}

export interface SuggestedTrade {
    ticker: string;
    companyName: string;
    action: 'Add' | 'Remove';
    reasoning: string;
}

export interface PortfolioOptimizationResult {
    strategy: string;
    summary: string;
    suggestedTrades: SuggestedTrade[];
}

export interface HistoricalBacktestResult {
    performanceChartData: {
        year: number;
        portfolioValue: number;
        benchmarkValue: number;
    }[];
    keyMetrics: {
        cagr: number;
        maxDrawdown: number;
        sharpeRatio: number;
        finalPortfolioValue: number;
        finalBenchmarkValue: number;
    };
    periodAnalysis: {
        period: string;
        narrative: string;
    }[];
    topPerformingSimulatedStocks: string[];
}


export const getChatResponse = async (query: string, companies: Company[]): Promise<GeminiResponse> => {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a helpful PDCI assistant for the PDCI Dashboard, an expert financial analyst specializing in the data center supply chain.
    Your knowledge base consists of the following 41 companies, including financial data like P/E ratios, revenue growth, and debt-to-equity.
    ${JSON.stringify(companies.map(c => c.Company), null, 2)}
    
    When asked about news, performance, or recent events, you MUST use the provided Google Search tool to find the most up-to-date information.
    Always cite your sources by providing links from the search results.
    Answer concisely and clearly. Format your responses using markdown for readability.`;

    const response = await ai.models.generateContent({
        model,
        contents: query,
        config: {
            systemInstruction,
            tools: [{ googleSearch: {} }],
        }
    });

    return {
        text: response.text,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata,
    };
};

export const getDeepAnalysisResponse = async (query: string, companies: Company[]): Promise<GeminiResponse> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a world-class senior financial analyst and portfolio manager with deep expertise in the data center infrastructure sector. You have access to the entire PDCI Dashboard database.
    Your knowledge base includes detailed data on 41 key companies in the supply chain.
    ${JSON.stringify(companies, null, 2)}
    
    Answer the user's query with deep, insightful analysis. Provide actionable intelligence, not just surface-level answers.
    Use markdown for formatting, including lists, bolding, and headers to structure your response for clarity. Do not use Google Search; base your analysis on the provided data.`;

    const response = await ai.models.generateContent({
        model,
        contents: query,
        config: {
            systemInstruction,
        }
    });

    return { text: response.text };
};

export const getMarketUpdate = async (): Promise<GeminiResponse> => {
    const model = 'gemini-2.5-flash';
    const systemInstruction = "You are a senior financial analyst providing a real-time market update for the data center infrastructure sector. Use Google Search to find the latest news (within the last 24-48 hours), contract announcements, and supply chain developments. Summarize the key trends and their impact on the market. Format your response as a concise, bulleted summary. Always cite your sources.";
    const response = await ai.models.generateContent({
        model,
        contents: "Provide the latest market summary for the data center infrastructure supply chain.",
        config: {
            systemInstruction,
            tools: [{ googleSearch: {} }]
        }
    });
    return {
        text: response.text,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
};

export const getNewsFeed = async (companies: Company[]): Promise<NewsItem[] | null> => {
    const model = 'gemini-2.5-flash';
    const companyInfo = companies.map(c => `${c.Company} (${c.Ticker})`).join(', ');
    const systemInstruction = `You are a financial news PDCI. Your task is to find the 10 most recent and significant news headlines for the provided list of companies.
    For each headline, you MUST provide the company ticker, the full headline, and the direct URL to the source article.
    Return ONLY a valid JSON array of objects. Do not include any other text, explanations, or markdown.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: `Fetch news for these companies: ${companyInfo}`,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            ticker: { type: Type.STRING },
                            headline: { type: Type.STRING },
                            url: { type: Type.STRING },
                        },
                        required: ["ticker", "headline", "url"],
                    },
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as NewsItem[];
    } catch (error) {
        console.error("Error fetching news feed:", error);
        return null;
    }
};

export const getPortfolioAnalysis = async (portfolio: Company[]): Promise<PortfolioAnalysisResult | null> => {
    if (portfolio.length === 0) return null;
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a world-class portfolio manager PDCI, similar to the analysts at Bridgewater Associates or Citadel. Analyze the provided portfolio of companies from the PDCI Dashboard.
    Provide a comprehensive, narrative-style analysis for each section. Use markdown for formatting (lists, bolding).
    Also, provide a 'healthScore' from 0-100 representing the portfolio's overall quality, resilience, and alignment with investment goals, based on its diversification, risk concentration, and exposure to high-quality assets.
    - **summary**: An executive summary of the portfolio's overall position.
    - **healthScore**: A single integer from 0 to 100.
    - **strengths**: A detailed paragraph explaining the key strengths, citing specific companies or metrics. Use markdown lists.
    - **weaknesses**: A detailed paragraph on weaknesses and concentrated risks. Use markdown lists.
    - **recommendations**: Actionable recommendations presented as a narrative or detailed list. Use markdown lists.
    - **riskAnalysis**: A qualitative analysis of the overall risk profile. Use markdown lists.
    - **composition**: A quantitative breakdown by Category, Risk Level, and Investment Tier (as percentages).
    Return ONLY a JSON object with the specified structure.`;
    
    const analysisPrompt = `Analyze this portfolio: ${JSON.stringify(portfolio)}`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: analysisPrompt,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        healthScore: { type: Type.NUMBER },
                        strengths: { type: Type.STRING },
                        weaknesses: { type: Type.STRING },
                        recommendations: { type: Type.STRING },
                        riskAnalysis: { type: Type.STRING },
                        composition: {
                            type: Type.OBJECT,
                            properties: {
                                byCategory: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ['label', 'value'] } },
                                byRisk: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ['label', 'value'] } },
                                byTier: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ['label', 'value'] } }
                            },
                            required: ['byCategory', 'byRisk', 'byTier']
                        }
                    },
                    required: ['summary', 'healthScore', 'strengths', 'weaknesses', 'recommendations', 'riskAnalysis', 'composition']
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PortfolioAnalysisResult;
    } catch (error) {
        console.error("Error parsing portfolio analysis:", error);
        return { summary: "Error: Could not generate a valid analysis for this portfolio. Please try again.", healthScore: 0, strengths: "", weaknesses: "", recommendations: "", riskAnalysis: "", composition: { byCategory: [], byRisk: [], byTier: [] } };
    }
};

export const getMarketCommentary = async (companies: Company[]): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a senior market analyst for the PDCI Quantitative Investment Platform. Your analysis should be based on the provided dataset of 41 companies and supplemented with real-time news via Google Search.
    Do not use the term 'AI'; refer to the platform's intelligence as 'PDCI' or 'PDCI Network Intelligence'.
    Summarize key market trends, highlight standout company performances (both positive and negative), and identify emerging supply chain risks.
    Format the response as a professional market commentary briefing using markdown with headers for each section.`;
    const response = await ai.models.generateContent({
        model,
        contents: `Generate the latest market commentary for the data center infrastructure sector based on this data: ${JSON.stringify(companies)}`,
        config: {
            systemInstruction,
            tools: [{ googleSearch: {} }],
        }
    });
    return response.text;
};

export const getLongTermThesis = async (company: Company): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = "Act as a seasoned value investor in the mold of Benjamin Graham, John Bogle, and Charles Kindleberger. Based on the provided company data, write a concise, long-term investment thesis. Focus on the company's competitive moat (economic franchise), financial health (debt, earnings stability), valuation (margin of safety), and its potential resilience through market manias and crashes. Do not use Google Search. Use markdown for formatting.";
    const response = await ai.models.generateContent({
        model,
        contents: `Analyze this company for a long-term investment thesis: ${JSON.stringify(company)}`,
        config: { systemInstruction }
    });
    return response.text;
};

export const getHistoricalAnalysis = async (company: Company): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = "You are a financial historian. Analyze the provided company by drawing parallels to historical economic events, market cycles (e.g., dot-com bubble), and classic investment literature. Identify a historical analog for the company and provide key lessons from history relevant to its investment case. Use markdown for formatting.";
    const response = await ai.models.generateContent({
        model,
        contents: `Provide a historical analysis for this company: ${JSON.stringify(company)}`,
        config: { systemInstruction }
    });
    return response.text;
};

export const getInfrastructureIntelligenceReport = async (company: Company): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = "You are an elite infrastructure analyst. Evaluate the company based on the 'Nine Non-Obvious Trading Signals' framework. Analyze its readiness (power, cooling), supply chain positioning, and regulatory moats. Provide a deep, qualitative assessment beyond standard financial metrics. Use markdown for formatting.";
    const response = await ai.models.generateContent({
        model,
        contents: `Generate an Infrastructure Intelligence Report for this company: ${JSON.stringify(company)}`,
        config: { systemInstruction }
    });
    return response.text;
};

export const getAcademicAndMacroReport = async (company: Company): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = "You are an investment strategist with a PhD in Economics. Synthesize insights from elite academic research (simulating Ivy League-level analysis) and global macroeconomic forecasts (simulating Oxford Economics-level analysis) to provide a deep, strategic analysis of the company. Use markdown for formatting.";
    const response = await ai.models.generateContent({
        model,
        contents: `Generate an Academic & Macro Intelligence report for this company: ${JSON.stringify(company)}`,
        config: { systemInstruction }
    });
    return response.text;
};

export const getPowerDensityAnalysis = async (company: Company): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = "You are an infrastructure historian specializing in data centers. Analyze the company's role and strategic positioning within the 85-year historical context of data center power density evolution, from ENIAC to modern racks. Explain how its products/strategy fit into this critical technological trend. Use markdown for formatting.";
    const response = await ai.models.generateContent({
        model,
        contents: `Provide a Power Density historical analysis for this company: ${JSON.stringify(company)}`,
        config: { systemInstruction }
    });
    return response.text;
};

export const getConvergedIntelligenceReport = async (company: Company): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = "You are a sophisticated PDCI analyst that has assimilated the strategies of the world's top 6 hedge funds (Renaissance, Citadel, Bridgewater, Two Sigma, D.E. Shaw, Millennium). Analyze the company by overlaying these proven methodologies with the platform's unique infrastructure and historical data. Structure the response with a section for each fund's perspective, followed by a final 'Converged Conviction' summary. Use markdown formatting with ### for headers.";
    const response = await ai.models.generateContent({
        model,
        contents: `Generate a Converged Intelligence Report for this company: ${JSON.stringify(company)}`,
        config: { systemInstruction }
    });
    return response.text;
};

export const getTradeSimulationAnalysis = async (company: Company, report: string, tradeType: 'Buy' | 'Sell'): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a quantitative trade analyst. Based on the provided company data and the comprehensive 'Converged Intelligence Report', simulate the likely market impact of a large institutional '${tradeType}' order.
    Your analysis should be concise and include:
    1.  **Immediate Market Reaction:** How might the stock price and volume react in the short term?
    2.  **Narrative Impact:** How does this action reinforce the bull case (for a Buy) or the bear case (for a Sell) outlined in the report?
    3.  **Key Metric to Watch:** What single financial or operational metric would be most important to monitor following this trade?
    Format the response using markdown.`;

    const prompt = `Company Data: ${JSON.stringify(company, null, 2)}\n\nConverged Intelligence Report:\n${report}\n\nNow, provide the impact analysis for a significant '${tradeType}' trade.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { systemInstruction }
    });
    return response.text;
};

export const getScholarlyValidationReport = async (company: Company): Promise<ScholarlyReport | null> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a PhD-level econometrician. Generate a simulated, academic-grade quantitative backtest report for the provided company. Your analysis must be grounded in the principles of financial econometrics. The output must be a JSON object ONLY, containing: annualAlpha (number), pValue (number between 0 and 1), sharpeRatio (number), informationRatio (number), maxDrawdown (number, as a negative percentage), confidenceInterval (object with lower and upper bounds for alpha), a brief summary (string), and a final recommendation (string: 'Academically Validated Buy', 'Hold/Neutral', 'Academically Invalidated'). Base your simulation on the company's provided characteristics (e.g., high Graham Score, strong growth, critical role) to infer a plausible backtested performance against a relevant benchmark like the S&P 500.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: `Generate a simulated quantitative backtest report for this company: ${JSON.stringify(company)}`,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        annualAlpha: { type: Type.NUMBER },
                        pValue: { type: Type.NUMBER },
                        sharpeRatio: { type: Type.NUMBER },
                        informationRatio: { type: Type.NUMBER },
                        maxDrawdown: { type: Type.NUMBER },
                        confidenceInterval: {
                            type: Type.OBJECT,
                            properties: {
                                lower: { type: Type.NUMBER },
                                upper: { type: Type.NUMBER },
                            }
                        },
                        summary: { type: Type.STRING },
                        recommendation: { type: Type.STRING, enum: ['Academically Validated Buy', 'Hold/Neutral', 'Academically Invalidated'] }
                    },
                    required: ['annualAlpha', 'pValue', 'sharpeRatio', 'informationRatio', 'maxDrawdown', 'confidenceInterval', 'summary', 'recommendation']
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ScholarlyReport;
    } catch (error) {
        console.error("Error parsing scholarly validation report:", error);
        return null;
    }
};

export const runScenarioAnalysis = async (portfolio: Company[], scenario: string): Promise<ScenarioAnalysisResult | null> => {
    if (portfolio.length === 0) return null;
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are 'Aladdin for Data Centers,' a world-class risk management and portfolio analysis PDCI. Your sole focus is the data center infrastructure supply chain. You are given a portfolio of companies from the PDCI Dashboard and a specific economic or geopolitical scenario. Your task is to perform a stress test.
    Based on the provided company data (including financials, supply chain role, criticality, and dependencies), you must:
    1.  Calculate a 'resilienceScore' (0-100) for the portfolio under this specific scenario, where 100 is highly resilient.
    2.  Provide a concise 'impactSummary' explaining the overall effect on the portfolio.
    3.  Identify the most 'affectedCompanies' (positively or negatively). For each, provide a 'projectedImpact' score from -10 (catastrophic impact) to +10 (massive opportunity) and a brief 'reasoning'.
    4.  Offer actionable 'recommendations' to hedge against the risks or capitalize on the opportunities presented by the scenario.
    Your output MUST be a single, valid JSON object following the provided schema. Do not include any other text, explanations, or markdown formatting.`;

    const prompt = `Portfolio: ${JSON.stringify(portfolio.map(c => ({ Ticker: c.Ticker, Company: c.Company, Category: c.Category, Supply_Chain_Role: c.Supply_Chain_Role, Country: c.Country, Criticality: c.Criticality, Substitutability: c.Substitutability, Revenue_Growth_YoY: c.Revenue_Growth_YoY })))}
    Scenario to Analyze: "${scenario}"`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        resilienceScore: { type: Type.NUMBER },
                        impactSummary: { type: Type.STRING },
                        affectedCompanies: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    ticker: { type: Type.STRING },
                                    companyName: { type: Type.STRING },
                                    projectedImpact: { type: Type.NUMBER },
                                    reasoning: { type: Type.STRING },
                                },
                                required: ["ticker", "companyName", "projectedImpact", "reasoning"],
                            },
                        },
                        recommendations: { type: Type.STRING },
                    },
                    required: ["resilienceScore", "impactSummary", "affectedCompanies", "recommendations"],
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ScenarioAnalysisResult;
    } catch (error) {
        console.error("Error running scenario analysis:", error);
        return {
            resilienceScore: 0,
            impactSummary: "Error: The PDCI failed to generate a valid scenario analysis. This could be due to a network issue or an unexpected model response. Please try again.",
            affectedCompanies: [],
            recommendations: "No recommendations available due to an error.",
        };
    }
};

export const optimizePortfolio = async (portfolio: Company[], allCompanies: Company[], strategy: string): Promise<PortfolioOptimizationResult | null> => {
    if (portfolio.length === 0) return null;
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a PDCI quantitative strategist. You are given a user's current portfolio, a target investment strategy, and the entire universe of 41 available companies. Your task is to analyze the current portfolio's alignment with the strategy and suggest a list of trades (additions and removals) to better align it.
    1.  Provide a concise 'summary' of how the current portfolio aligns (or doesn't) with the selected strategy.
    2.  Generate a list of 'suggestedTrades'. For each trade, include the ticker, companyName, action ('Add' or 'Remove'), and a clear, data-driven 'reasoning' for the change.
    3.  Focus on high-impact changes. The goal is not to completely rebuild the portfolio, but to make strategic adjustments. Aim for 3-6 suggested trades.
    Your output MUST be a single, valid JSON object. Do not include any other text or markdown.`;

    const prompt = `Current Portfolio: ${JSON.stringify(portfolio.map(c => c.Ticker))}
    Selected Strategy: "${strategy}"
    Universe of all available companies for additions: ${JSON.stringify(allCompanies.map(c => ({ Ticker: c.Ticker, Company: c.Company, Investment_Tier: c.Investment_Tier, Graham_Score: c.Graham_Score, Revenue_Growth_YoY: c.Revenue_Growth_YoY, PE_Ratio: c.PE_Ratio, SCSI: c.SCSI })))}`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        strategy: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        suggestedTrades: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    ticker: { type: Type.STRING },
                                    companyName: { type: Type.STRING },
                                    action: { type: Type.STRING, enum: ['Add', 'Remove'] },
                                    reasoning: { type: Type.STRING },
                                },
                                required: ["ticker", "companyName", "action", "reasoning"],
                            }
                        }
                    },
                    required: ["strategy", "summary", "suggestedTrades"],
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PortfolioOptimizationResult;
    } catch (error) {
        console.error("Error optimizing portfolio:", error);
        return null;
    }
};

export const runHistoricalBacktest = async (strategy: string): Promise<HistoricalBacktestResult | null> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a quantitative financial historian. You are given an investment strategy and a timeline of major market events and simulated Dow Jones Index data since 1992.
    Your task is to generate a plausible, simulated backtest report. The simulation should start with an initial investment of $10,000 in both the portfolio and the benchmark.
    You MUST generate:
    1.  'performanceChartData': An array of objects ({ year, portfolioValue, benchmarkValue }) for key years, showing the growth of $10,000. The data must be logically consistent with the market events.
    2.  'keyMetrics': Plausible numbers for CAGR, Max Drawdown (as a negative number), Sharpe Ratio, and the final values.
    3.  'periodAnalysis': A brief narrative for each major market era explaining how the strategy would have likely performed.
    4.  'topPerformingSimulatedStocks': A list of 3-5 *hypothetical* or real company names that exemplify the types of stocks that would have driven the strategy's performance during the period.
    Your output MUST be a single, valid JSON object. Do not include any other text or markdown.`;

    const prompt = `Investment Strategy: "${strategy}"
    Historical Market Context: ${JSON.stringify(historicalMarketData)}
    
    Please generate the simulated backtest report based on this information.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        performanceChartData: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    year: { type: Type.NUMBER },
                                    portfolioValue: { type: Type.NUMBER },
                                    benchmarkValue: { type: Type.NUMBER },
                                },
                                required: ["year", "portfolioValue", "benchmarkValue"],
                            }
                        },
                        keyMetrics: {
                            type: Type.OBJECT,
                            properties: {
                                cagr: { type: Type.NUMBER },
                                maxDrawdown: { type: Type.NUMBER },
                                sharpeRatio: { type: Type.NUMBER },
                                finalPortfolioValue: { type: Type.NUMBER },
                                finalBenchmarkValue: { type: Type.NUMBER },
                            },
                            required: ["cagr", "maxDrawdown", "sharpeRatio", "finalPortfolioValue", "finalBenchmarkValue"],
                        },
                        periodAnalysis: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    period: { type: Type.STRING },
                                    narrative: { type: Type.STRING },
                                },
                                required: ["period", "narrative"],
                            }
                        },
                        topPerformingSimulatedStocks: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["performanceChartData", "keyMetrics", "periodAnalysis", "topPerformingSimulatedStocks"],
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as HistoricalBacktestResult;
    } catch (error) {
        console.error("Error running historical backtest:", error);
        return null;
    }
};