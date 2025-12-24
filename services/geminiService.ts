
import { GoogleGenAI } from "@google/genai";
import { NicheData } from "../types";

export const refineNicheStatement = async (data: NicheData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Based on these three inputs from a Product Manager:
    1. Problem they love solving: ${data.problem}
    2. Environment where they thrive: ${data.environment}
    3. How they naturally lead (Delivery Style): ${data.style}

    Create a single, powerful, professional "Niche Statement" for their LinkedIn or Resume.
    It must follow the spirit of: "[Problem You Solve] in [Environment], [How you deliver impact/Delivery Style]."
    
    Make it sound senior, punchy, and avoid generic buzzwords. 
    Return ONLY the refined statement text. No preamble or quotes.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || `I lead ${data.problem} in ${data.environment}, focusing on being ${data.style}.`;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `I lead ${data.problem} in ${data.environment}, focusing on being ${data.style}.`;
  }
};

export const optimizeInput = async (category: string, value: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are a world-class Executive PM Coach. 
    Convert this rough draft of a "${category}" into a professional, punchy, and high-impact PM phrase.
    
    Draft: "${value}"
    
    Rules:
    - Keep it under 8 words.
    - Use active verbs (e.g., Optimizing, Orchestrating, Scaling).
    - Make it sound senior and specific.
    - Return ONLY the optimized text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || value;
  } catch (error) {
    console.error("Optimization Error:", error);
    return value;
  }
};

export const generateNicheAvatar = async (statement: string, referenceImage?: { data: string, mimeType: string }): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Create a professional 3D stylized avatar representing a Product Manager specialized in: "${statement}". 
  ${referenceImage ? "Use the provided photo as a reference for facial features and style, but transform it into a high-quality 3D digital character." : "The avatar should be a clean, high-quality character bust."}
  Style: Modern tech aesthetic, friendly but authoritative, soft lighting, minimalist solid background. 
  No text. The character's attire and vibe should reflect the niche (e.g., professional for banking, casual/tech for SaaS).`;

  const parts: any[] = [{ text: prompt }];
  if (referenceImage) {
    parts.unshift({
      inlineData: {
        data: referenceImage.data,
        mimeType: referenceImage.mimeType
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No avatar data found in response");
  } catch (error) {
    console.error("Avatar Generation Error:", error);
    throw error;
  }
};
