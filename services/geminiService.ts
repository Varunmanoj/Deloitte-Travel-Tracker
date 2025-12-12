import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from "../types";

// Reverted to process.env.API_KEY so it works in Google AI Studio Preview
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const parseReceipt = async (file: File): Promise<ReceiptData> => {
  const filePart = await fileToGenerativePart(file);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        filePart,
        {
          text: `Analyze this travel/transport receipt (image or PDF). It could be from Uber, Ola, Rapido, Cityflo, or a generic taxi/travel invoice. Extract the following details:
          - Date (YYYY-MM-DD)
          - Time (HH:MM 24hr format)
          - Total Amount (numeric value only)
          - Currency (e.g., INR, USD)
          - Pickup Location (simplify to street/area name, use "N/A" if not applicable like for Cityflo pass or generic invoice)
          - Dropoff Location (simplify to street/area name, use "N/A" if not applicable)
          
          If the file is not a receipt or details are missing, do your best to infer or return empty strings/0.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          time: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          currency: { type: Type.STRING },
          pickupLocation: { type: Type.STRING },
          dropoffLocation: { type: Type.STRING },
        },
        required: ["date", "time", "amount"],
      },
    },
  });

  if (response.text) {
    const data = JSON.parse(response.text);

    return {
      id: crypto.randomUUID(),
      ...data
    };
  }

  throw new Error("Failed to parse receipt");
};