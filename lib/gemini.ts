import { GoogleGenAI, Type } from "@google/genai";
import { Company } from "./types";

// NOTE: This is a placeholder. A real API key would be handled by the environment.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface GeminiResponse {
    text: string;
    groundingMetadata?: any; // To hold citations
}

export interface PortfolioAnalysisResult {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    riskAnalysis: string[];
    composition: {
        byCategory: { label: string; value: number }[];
        byRisk: { label: string; value: number }[];
        byTier: { label: string; value: number }[];
    };
}


const getChatResponse = async (query: string, companies: Company[]): Promise<GeminiResponse> => {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a helpful AI assistant for the PDCI Dashboard, an expert financial analyst specializing in the data center supply chain.
    Your knowledge base consists of the following 41 companies:
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

const getDeepAnalysisResponse = async (query: string, companies: Company[]): Promise<GeminiResponse> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are Network Intelligence, an advanced AI investment analyst for the PDCI Dashboard. You specialize in complex, multi-constraint analysis of the data center supply chain.
    Your knowledge base consists of detailed data on 41 key companies.
    
    When a user asks a complex query (e.g., portfolio construction with multiple constraints, deep competitive analysis, supply chain mapping), you MUST:
    1.  Acknowledge the complexity and state that you are entering deep analysis mode.
    2.  Use the Google Search tool to gather the absolute latest market data, news, and financial information relevant to the query.
    3.  Break down your reasoning into a clear, step-by-step process. Use markdown headings for each step (e.g., "### Step 1: Analyzing Risk Profiles").
    4.  Explicitly state the trade-offs involved in any recommendation (e.g., "While TSMC offers a monopoly advantage, its geopolitical risk in Taiwan must be considered.").
    5.  Conclude with a final recommendation or summary.
    6.  Provide a 'Confidence Score' from 1 to 10 for your final recommendation, and briefly justify it.
    7.  Cite all web sources used in your analysis.`;
    
    const fullQuery = `
    Knowledge Base (41 Companies):
    ${JSON.stringify(companies, null, 2)}

    User Query:
    ${query}
    `;

    const response = await ai.models.generateContent({
        model,
        contents: fullQuery,
        config: {
            systemInstruction,
            tools: [{ googleSearch: {} }],
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });

    return {
        text: response.text,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata,
    };
};


const getPortfolioAnalysis = async (portfolio: Company[]): Promise<PortfolioAnalysisResult> => {
    const model = 'gemini-2.5-flash';
    const portfolioSummary = portfolio.map(c => ({
        Company: c.Company,
        Ticker: c.Ticker,
        Category: c.Category,
        Investment_Tier: c.Investment_Tier,
        Risk_Level: c.Risk_Level,
        Universal_Score: c.Universal_Score,
        Competitive_Position: c.Competitive_Position,
        SCSI: c.SCSI,
        Country: c.Country,
        Substitutability_Score: c.Substitutability_Score
    }));

    const prompt = `You are an AI investment analyst that uses the PDCI Business Intelligence Framework. Analyze the following portfolio of data center infrastructure companies:
    ${JSON.stringify(portfolioSummary, null, 2)}
    
    Based on the PDCI framework and the latest news from the Google Search tool, generate a comprehensive business intelligence report. Your analysis must:
    1.  Provide a high-level executive summary (2-3 sentences).
    2.  List 3-4 key strengths of the portfolio. Justify each point with specific company data (e.g., "Strong position in Computing, driven by TSMC's monopoly and high Universal Score").
    3.  List 3-4 key weaknesses or risks, paying attention to the portfolio's overall Substitutability Risk and any commodity exposure.
    4.  Provide a "Key Risk Analysis" section. Focus on the Geographic Concentration Risk (GCR), especially exposure to Taiwan and Korea. Also, discuss supply chain risks by highlighting companies with a high Supply Constraint Severity Index (SCSI) and what that implies for their pricing power and the portfolio's stability.
    5.  Offer 2-3 concrete, actionable recommendations for rebalancing or improvement.
    6.  Calculate the portfolio composition percentages by Category, Risk_Level, and Investment_Tier based on the count of companies in each group.

    Return the entire response as a single, minified JSON object. Do not include any text outside the JSON object.
    `;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING, description: "A high-level executive summary of the portfolio analysis." },
            strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of strings, each describing a key strength of the portfolio."
            },
            weaknesses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of strings, each describing a key weakness or risk."
            },
            recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of strings, each providing an actionable recommendation."
            },
            riskAnalysis: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of strings detailing key risks like geopolitical (GCR) and supply chain constraints (SCSI)."
            },
            composition: {
                type: Type.OBJECT,
                properties: {
                    byCategory: {
                        type: Type.ARRAY,
                        description: "Portfolio composition percentage by company category.",
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
                        description: "Portfolio composition percentage by risk level.",
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
                        description: "Portfolio composition percentage by investment tier.",
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
        required: ["summary", "strengths", "weaknesses", "recommendations", "riskAnalysis", "composition"]
    };

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        }
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PortfolioAnalysisResult;
    } catch (e) {
        console.error("Failed to parse Gemini JSON response:", e);
        console.error("Raw response text:", response.text);
        // Return a fallback error object
        return {
            summary: "Error: The AI response was not in the expected format. Please try again.",
            strengths: [],
            weaknesses: [],
            recommendations: [],
            riskAnalysis: [],
            composition: { byCategory: [], byRisk: [], byTier: [] }
        };
    }
};

const getMarketUpdate = async (): Promise<GeminiResponse> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Provide a brief market summary for the data center infrastructure sector based on the latest news from the last 7 days.
    Focus on major trends, supply chain news (e.g., copper, HBM memory, chips), and significant contract announcements.
    Use the Google Search tool extensively. Cite your sources.
    The response should be a concise summary, 3-4 paragraphs max.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    return {
        text: response.text,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata,
    };
};

export { getChatResponse, getDeepAnalysisResponse, getPortfolioAnalysis, getMarketUpdate };
