
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

// Use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatSession: Chat | null = null;

export const initChat = () => {
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.8,
    },
  });
  return chatSession;
};

export const sendMessage = async (message: string): Promise<string> => {
  if (!chatSession) {
    initChat();
  }
  
  try {
    const response = await chatSession!.sendMessage({ message });
    // Use response.text property directly
    return response.text || "Meow? (I'm a bit lost for words...)";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Meow... (Having some trouble connecting to my cat brain!)";
  }
};

export const quickReaction = async (action: string, stats: any): Promise<string> => {
  const prompt = `Action: ${action}. My current stats are Hunger: ${stats.hunger}%, Happiness: ${stats.happiness}%, Energy: ${stats.energy}%. Give me a very short reaction (1 sentence).`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT + "\nKeep it under 10 words.",
      }
    });
    // Use response.text property directly
    return response.text || "Meow!";
  } catch (error) {
    return "Meow~";
  }
};