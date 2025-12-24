
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
      model: 'gemini-2.5-flash-image', // Maps to "nano banana"
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

export const generateGithubReadme = async (statement: string, data: NicheData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Create a professional GitHub Profile README.md snippet for a Senior Product Manager.
    Niche Statement: "${statement}"
    Problem Area: ${data.problem}
    Environment: ${data.environment}
    Style: ${data.style}

    The README should include:
    1. A header with the niche statement.
    2. A "Superpowers" section (3 bullet points based on the style/problem).
    3. A "Current Focus" section (based on the environment).
    4. A call to action for collaboration.
    
    Format as beautiful Markdown. Use professional emojis. Avoid fluff.
    Return ONLY the raw Markdown content.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || `# Professional Product Manager\n\n${statement}`;
  } catch (error) {
    console.error("Gemini README Error:", error);
    return `# Professional Product Manager\n\n${statement}`;
  }
};
