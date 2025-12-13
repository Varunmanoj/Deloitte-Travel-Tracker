import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from "../types";

// Reverted to process.env.API_KEY so it works in Google AI Studio Preview
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Custom error class for categorized receipt processing errors
export class ReceiptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReceiptError';
  }
}

// Helper to convert File to Base64 with size validation
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  // 20MB limit check (Gemini API limit)
  if (file.size > 20 * 1024 * 1024) {
    throw new ReceiptError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is 20MB.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: file.type,
          },
        });
      } else {
        reject(new ReceiptError("Failed to read file data."));
      }
    };
    reader.onerror = () => reject(new ReceiptError("Error reading file."));
    reader.readAsDataURL(file);
  });
};

export const parseReceipt = async (file: File): Promise<ReceiptData> => {
  try {
    const filePart = await fileToGenerativePart(file);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          filePart,
          {
            text: `Analyze this travel/transport receipt (image or PDF). It could be from Uber, Ola, Rapido, Cityflo, or a generic taxi/travel invoice. Extract the following details:
          - Date: Extract the PICKUP/START Date (YYYY-MM-DD). Do NOT use the dropoff or invoice generation date.
          - Time: Extract the PICKUP/START Time (HH:MM 24hr format). Do NOT use the dropoff time.
          - Total Amount (numeric value only)
          - Currency (e.g., INR, USD)
          - Pickup Location (simplify to street/area name, use "N/A" if not applicable like for Cityflo pass or generic invoice)
          - Dropoff Location (simplify to street/area name, use "N/A" if not applicable)
          
          If the file is not a receipt or details are missing, do your best to infer or return empty strings/0.`
          }
        ]
      },
      config: {
        temperature: 0, // Deterministic output
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

    if (!response.text) {
        throw new ReceiptError("The AI model returned an empty response. The image might be unclear.");
    }

    try {
        const data = JSON.parse(response.text);
        
        // Validation of critical fields
        if (!data.date) throw new Error("Missing Date");
        if (data.amount === undefined || data.amount === null) throw new Error("Missing Amount");

        return {
          id: crypto.randomUUID(),
          ...data
        };
    } catch (parseError) {
        console.error("Parsing Error:", parseError);
        throw new ReceiptError("Failed to extract valid receipt data. Please ensure the image is a clear receipt.");
    }
  } catch (error: any) {
    console.error("Receipt Processing Error:", error);
    
    // Pass through our custom errors
    if (error instanceof ReceiptError) {
        throw error;
    }

    // Map Gemini/Network errors to user-friendly messages
    const msg = (error.message || error.toString()).toLowerCase();

    if (msg.includes('429') || msg.includes('quota') || msg.includes('exhausted')) {
        throw new ReceiptError("Service is busy (Rate Limit Exceeded). Please wait a moment and try again.");
    }
    if (msg.includes('401') || msg.includes('key') || msg.includes('auth')) {
        throw new ReceiptError("Authentication failed. Please check your API Key configuration.");
    }
    if (msg.includes('503') || msg.includes('unavailable')) {
        throw new ReceiptError("Service temporarily unavailable. Please try again later.");
    }
    if (msg.includes('fetch') || msg.includes('network')) {
        throw new ReceiptError("Network error. Please check your internet connection.");
    }
    if (msg.includes('candidate') || msg.includes('block')) {
        throw new ReceiptError("The receipt content was flagged or blocked by safety settings.");
    }

    throw new ReceiptError("An unexpected error occurred while processing the receipt.");
  }
};