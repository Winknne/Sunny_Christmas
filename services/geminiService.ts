import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateHolidayBlessing = async (name: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are the spirit of the "Arix Signature Christmas Tree", a symbol of ultimate luxury, elegance, and timeless beauty.
      Write a short, poetic, and highly sophisticated holiday blessing for a guest named "${name}".
      
      Tone: Aristocratic, warm, magical, opulent. Use words like "golden", "emerald", "eternal", "prosperity".
      Length: Maximum 2 sentences.
      Output: Just the text of the blessing.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "May the golden glow of the season illuminate your path with eternal prosperity.";
  }
};
