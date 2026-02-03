
import { GoogleGenAI } from "@google/genai";
import { Category } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const getModel = (modelName: string) => {
    // This is a placeholder for potential future logic to switch models
    return modelName;
}

const callGenerativeModelForText = async (model: string, prompt: string) => {
    if (!API_KEY) {
        return Promise.resolve("AI functionality is disabled. Please configure your API key.");
    }
     try {
        const response = await ai.models.generateContent({
            model: getModel(model),
            contents: prompt,
        });
        return response.text ?? 'Could not get a valid response from AI.';
    } catch (error) {
        console.error(`Error calling Gemini model ${model} for text:`, error);
        return "An error occurred during AI processing.";
    }
}


const callGenerativeModel = async (model: string, prompt: string, imageBase64: string, mimeType: string) => {
    if (!API_KEY) {
        return Promise.resolve("AI functionality is disabled. Please configure your API key.");
    }
    try {
        const imagePart = { inlineData: { mimeType, data: imageBase64 } };
        const textPart = { text: prompt };
        
        const response = await ai.models.generateContent({
            model: getModel(model),
            contents: { parts: [imagePart, textPart] },
        });
        
        return response.text ?? 'Could not get a valid response from AI.';
    } catch (error) {
        console.error(`Error calling Gemini model ${model}:`, error);
        return "An error occurred during the AI analysis. Please try again.";
    }
}

export interface ProductAnalysis {
    name: string;
    description: string;
    specs: Record<string, string>;
    quality: 'Standard' | 'Excellent';
    categoryId: string;
}

export const analyzeProductForListing = async (imageBase64: string, categories: Category[]): Promise<ProductAnalysis> => {
    const model = 'gemini-3-flash-preview';
    const categoryList = categories.map(c => `'${c.id}' (${c.name})`).join(', ');

    const prompt = `You are an expert listing assistant for "Dozo", a rental marketplace in India. Analyze the provided image of an item and return a JSON object with the following fields: "name", "description", "specs", "quality", and "categoryId".

    - name: A clear, concise, and marketable name for the item.
    - description: A brief, appealing description (20-30 words).
    - specs: An object of 3-4 key technical specifications. Keys should be short and capitalized (e.g., "Resolution", "Material").
    - quality: Assess the item's visual condition. If it looks new, pristine, or in top-tier condition, return "Excellent". Otherwise, return "Standard".
    - categoryId: The most appropriate category ID from this list: [${categoryList}].

    Return ONLY the raw JSON object, with no extra text or markdown formatting.
    Example response:
    {
      "name": "Sony Alpha 7 IV Camera",
      "description": "A powerful full-frame mirrorless camera, ideal for both professional photography and high-quality video shoots. Versatile and reliable.",
      "specs": { "Resolution": "33MP", "Video": "4K 60p", "Sensor": "Full-Frame" },
      "quality": "Excellent",
      "categoryId": "electronics"
    }`;

    try {
        const result = await callGenerativeModel(model, prompt, imageBase64, 'image/jpeg');
        const jsonString = result.replace(/```json|```/g, '').trim();
        const parsedResult = JSON.parse(jsonString);
        
        const validIds = [...categories.map(c => c.id)];
        if (!validIds.includes(parsedResult.categoryId)) {
            parsedResult.categoryId = 'lifestyle'; // Default to a safe category
        }
        
        if (parsedResult.name && parsedResult.description && parsedResult.quality && parsedResult.categoryId) {
            return parsedResult;
        } else {
            throw new Error("Parsed JSON is missing required fields.");
        }
    } catch (error) {
        console.error("Error analyzing product for listing:", error);
        return {
            name: '',
            description: '',
            specs: { '': '' },
            quality: 'Standard',
            categoryId: 'lifestyle'
        };
    }
};

// FIX: Added the missing suggestCategoryForImage function which was causing an import error.
export const suggestCategoryForImage = async (imageBase64: string, categories: Category[]): Promise<string> => {
    const analysis = await analyzeProductForListing(imageBase64, categories);
    return analysis.categoryId;
};

export const analyzeImageCondition = async (imageBase64: string, itemName: string): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  const prompt = `You are an AI Damage Guard for a rental marketplace called Dozo. Your task is to analyze the condition of this "${itemName}" based on the provided image. Note any visible scuffs, scratches, dents, or signs of wear. Present your findings as a concise, objective, bulleted list in Markdown format. If the item appears to be in excellent condition with no visible flaws, state that clearly.`;
  return callGenerativeModel(model, prompt, imageBase64, 'image/jpeg');
};

export const verifyIdDocument = async (imageBase64: string): Promise<{confidence: 'High' | 'Medium' | 'Low'}> => {
    const model = 'gemini-3-flash-preview';
    const prompt = `As an AI verification agent for Dozo, analyze this image of a potential government-issued ID card. Focus solely on the document's physical characteristics to determine if it's a real, physical card and not a screenshot or a poor quality photo. Do not read or return any personal information. Conclude with a single-line summary on a new line: "Verification confidence: [High/Medium/Low]."`;
    const result = await callGenerativeModel(model, prompt, imageBase64, 'image/jpeg');
    const lowerResult = result.toLowerCase();
    if (lowerResult.includes("verification confidence: high")) return { confidence: 'High' };
    if (lowerResult.includes("verification confidence: medium")) return { confidence: 'Medium' };
    return { confidence: 'Low' };
}

export const verifyLiveIdPhoto = async (imageBase64: string): Promise<boolean> => {
    const model = 'gemini-3-flash-preview';
    const prompt = `Analyze this image. Is it a clear, in-focus photo of a physical ID card? Check for glare, blurriness, and screen reflections to ensure it's not a photo of a screen. Respond with only 'Yes' or 'No'.`;
    const result = await callGenerativeModel(model, prompt, imageBase64, 'image/jpeg');
    return result.toLowerCase().includes('yes');
};


export const generateSearchQueryFromImage = async (imageBase64: string): Promise<string> => {
    const model = 'gemini-3-flash-preview';
    const prompt = `Describe the primary object in this image in a short, generic phrase suitable for a product search engine. For example: "modern grey sofa", "professional DSLR camera", "electric hammer drill".`;
    return callGenerativeModel(model, prompt, imageBase64, 'image/jpeg');
}

export const estimateProductValue = async (productName: string, productDescription: string): Promise<number> => {
    const model = 'gemini-3-flash-preview';
    const prompt = `You are an expert product appraiser for an Indian rental marketplace. Based on the item name "${productName}" and description "${productDescription}", estimate its current market value for a new, similar item in Indian Rupees (INR). Provide only the numerical value, without any currency symbols, commas, or explanatory text. For example: 45000`;
    const result = await callGenerativeModelForText(model, prompt);
    const parsedValue = parseInt(result.replace(/[^0-9]/g, ''), 10);
    return isNaN(parsedValue) ? 0 : parsedValue;
};

export const assessCommissionRate = async (productName: string, category: string, value: number): Promise<number> => {
    const model = 'gemini-3-flash-preview';
    const prompt = `You are a risk assessment AI for Dozo, a rental marketplace. You must determine the platform commission percentage for a new item. Higher risk items get higher commissions.
    - High-risk (15-18%): Expensive, fragile, or complex items like high-end electronics, cameras, drones.
    - Medium-risk (12-14%): Most furniture, appliances, power tools.
    - Low-risk (8-11%): Simple, durable, low-value items like camping gear, lifestyle goods.

    Item Details:
    - Name: ${productName}
    - Category: ${category}
    - Estimated Value: ₹${value}

    Based on these details, what is the appropriate commission percentage? Your answer must be a single integer number between 8 and 18, representing the percentage. The company prefers to maximize its revenue, so lean towards the higher end of the appropriate risk bracket. For example, for a high-risk item, prefer 17 or 18 over 15.`;
    
    const result = await callGenerativeModelForText(model, prompt);
    const parsedRate = parseInt(result.replace(/[^0-9]/g, ''), 10);
    
    if (isNaN(parsedRate) || parsedRate < 8 || parsedRate > 18) {
        return 0.15; // Default to 15% if parsing fails
    }
    return parsedRate / 100;
};
