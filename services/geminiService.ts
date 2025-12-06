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
          - Trip Type:
            - Identify if pickup or dropoff is a Deloitte office or major business park (keywords: Deloitte, Hiranandani, RMZ, Divyasree, Bagmane, DLF, Cyber City, Knowledge City, Mindspace, Panchshil, etc.).
            - If one location is an Office/Business Park and the other is not, label as "Home to Office" or "Office to Home".
            - Otherwise, infer "Commute", "Personal", "Business", etc. based on context.
          
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
          tripType: { type: Type.STRING },
        },
        required: ["date", "time", "amount"],
      },
    },
  });

  if (response.text) {
    const data = JSON.parse(response.text);

    // Enforce business logic for Trip Type
    let finalTripType = data.tripType || 'Commute';
    const p = (data.pickupLocation || '').toLowerCase();
    const d = (data.dropoffLocation || '').toLowerCase();

    // Keywords for Deloitte USI offices / Business Parks in India (Mumbai, Hyd, Blr, Pune, Chennai, Gurgaon etc)
    const officeKeywords = [
      'deloitte', 'hiranandani', 'business park', 'tech park', 'technopark', 
      'knowledge city', 'cyber city', 'dlf', 'rmz', 'divyasree', 'bagmane', 
      'panchshil', 'mindspace', 'embassy', 'sez', 'it park', 'office', 'corporate park'
    ];

    const isOffice = (loc: string) => officeKeywords.some(k => loc.includes(k));

    if (isOffice(d) && !isOffice(p)) {
      finalTripType = "Home to Office";
    } else if (isOffice(p) && !isOffice(d)) {
      finalTripType = "Office to Home";
    }

    return {
      id: crypto.randomUUID(),
      ...data,
      tripType: finalTripType
    };
  }

  throw new Error("Failed to parse receipt");
};