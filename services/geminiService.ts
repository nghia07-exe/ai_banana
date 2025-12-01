import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ImageSize } from "../types";

// Helper to ensure we get a fresh instance with the latest key if needed
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateColoringPage = async (theme: string, size: ImageSize): Promise<string> => {
  const ai = getAI();
  
  // Prompt engineering for coloring book style
  const prompt = `
    Create a black and white coloring book page for children. 
    Theme: ${theme}. 
    Style: Thick clear outlines, pure white background, no shading, no greyscale, simple shapes suitable for coloring. 
    High contrast line art.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size,
        },
      },
    });

    // Extract image from response
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64Data = part.inlineData.data;
          // Determine mime type if available, default to png (Gemini usually returns png for images)
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64Data}`;
        }
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};

export const createChatSession = (): Chat => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a friendly assistant for a children's coloring book app. Help parents come up with creative themes for coloring pages or answer questions about art and creativity for kids.",
    },
  });
};

export const sendMessage = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Oops! Something went wrong with the chat.";
  }
};
