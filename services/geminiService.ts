import { GoogleGenAI } from "@google/genai";
import { ScrapPrice, MetalSpotPrice } from "../types";

export const generateMarketAnalysis = async (
  prices: ScrapPrice[],
  spotPrices: MetalSpotPrice[]
): Promise<string> => {
  // The API key must be obtained exclusively from the environment variable process.env.API_KEY
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API_KEY environment variable is missing.");
    return "Market analysis is currently unavailable due to missing configuration.";
  }

  // Initialize Client
  const ai = new GoogleGenAI({ apiKey });

  const priceSummary = prices.slice(0, 10).map(p => 
    `- ${p.material}: £${p.pricePerKg}/kg (${p.trend === 'up' ? '+' : ''}${p.changePercentage}%)`
  ).join('\n');

  const spotSummary = spotPrices.map(s => 
    `- ${s.metal}: £${s.priceGbpPerKg}/kg (Spot)`
  ).join('\n');

  const prompt = `
    You are a Senior Commodities Analyst specializing in the UK Scrap Metal market.
    Analyze the following current scrap yard prices against the global spot prices.
    
    Current UK Scrap Yard Prices (Sample):
    ${priceSummary}
    
    Current Global Spot Prices (LME Derived):
    ${spotSummary}
    
    Please provide a concise Professional Market Report (max 200 words) covering:
    1. The spread between spot prices and scrap prices (yard margins).
    2. Notable trends (which metals are rising/falling).
    3. A brief recommendation for scrap dealers or sellers (e.g., "Hold Copper", "Sell Lead").
    
    Format the output with Markdown for headers and bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to generate market analysis. Please try again later.";
  }
};