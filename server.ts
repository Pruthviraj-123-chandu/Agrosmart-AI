import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper for retries
async function generateWithRetry(fn: () => Promise<any>, retries = 5, delay = 2000): Promise<any> {
  try {
    return await fn();
  } catch (error: any) {
    const is503 = error.status === 503 || error.message?.includes('503') || error.message?.includes('high demand') || error.message?.includes('overloaded');
    const is429 = error.status === 429 || error.message?.includes('429') || error.message?.includes('quota');

    if (retries > 0 && (is503 || is429)) {
      const waitTime = is429 ? Math.max(delay * 2.5, 15000) : Math.max(delay * 2, 5000); 
      console.warn(`Gemini API error (${error.status || 'unknown'}), retrying in ${waitTime}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return generateWithRetry(fn, retries - 1, waitTime);
    }
    throw error;
  }
}

app.use(express.json({ limit: '10mb' }));

// API Routes
app.post("/api/crop-recommendation", async (req, res) => {
  try {
    const data = req.body;
    const prompt = `Act as an expert agricultural scientist. 
      Based on these parameters:
      Nitrogen: ${data.n}, Phosphorus: ${data.p}, Potassium: ${data.k},
      Temperature: ${data.temp}°C, Humidity: ${data.humidity}%,
      pH: ${data.ph}, Rainfall: ${data.rainfall}mm.
      
      Recommend the best crop to grow. Provide JSON with: 
      - cropName (string)
      - confidence (number)
      - reason (string)
      - bestPractices (array of strings)
      - imageKeywords (array of 3 specific visual keywords)
      - economicValue (string: market demand)
      - seasonality (string: best months)
      - growthPeriod (string: days to harvest)
      - soilPhRange (string: ideal pH)
      - waterRequirement (string: low/medium/high)
      - marketPriceTier (string: e.g. Premium)
      `;

    const result = await generateWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cropName: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            bestPractices: { type: Type.ARRAY, items: { type: Type.STRING } },
            imageKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            economicValue: { type: Type.STRING },
            seasonality: { type: Type.STRING },
            growthPeriod: { type: Type.STRING },
            soilPhRange: { type: Type.STRING },
            waterRequirement: { type: Type.STRING },
            marketPriceTier: { type: Type.STRING },
          },
          required: [
            "cropName", "confidence", "reason", "imageKeywords", 
            "economicValue", "seasonality", "growthPeriod", 
            "soilPhRange", "waterRequirement", "marketPriceTier"
          ],
        },
      },
    }));

    res.json(JSON.parse(result.text || '{}'));
  } catch (error: any) {
    console.error("Crop Recommendation Error:", error);
    const status = error.status || 500;
    res.status(status).json({ 
      error: error.message || "Failed to get crop recommendation",
      code: error.status === 429 ? "QUOTA_EXCEEDED" : "unknown"
    });
  }
});

app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;
    
    const response = await generateWithRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    }));

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return res.json({ url: `data:image/png;base64,${part.inlineData.data}` });
      }
    }

    res.status(404).json({ error: "No image generated" });
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate image",
      code: error.code || "unknown"
    });
  }
});

app.post("/api/fertilizer-recommendation", async (req, res) => {
  try {
    const { soilParams, cropName } = req.body;
    const prompt = `Act as a soil scientist. 
      Soil Condition: ${soilParams}
      Target Crop: ${cropName}
      Recommend the best fertilizer. Respond in JSON with: fertilizerName, applicationMethod, dosageInfo, reason.`;

    const result = await generateWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fertilizerName: { type: Type.STRING },
            applicationMethod: { type: Type.STRING },
            dosageInfo: { type: Type.STRING },
            reason: { type: Type.STRING },
          },
          required: ["fertilizerName", "applicationMethod", "dosageInfo", "reason"],
        },
      },
    }));

    res.json(JSON.parse(result.text || '{}'));
  } catch (error: any) {
    console.error("Fertilizer Recommendation Error:", error);
    const status = error.status || 500;
    res.status(status).json({ 
      error: error.message || "Failed to get fertilizer recommendation",
      code: error.status === 429 ? "QUOTA_EXCEEDED" : "unknown"
    });
  }
});

app.post("/api/detect-disease", async (req, res) => {
  try {
    const { image } = req.body; // base64
    const result = await generateWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: "Analyze this crop leaf image. Detect any diseases, pests, or deficiencies. Provide details in JSON: diseaseName, symptoms (array), treatment, urgency (low|medium|high)." },
          { inlineData: { data: image, mimeType: "image/jpeg" } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diseaseName: { type: Type.STRING },
            symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
            treatment: { type: Type.STRING },
            urgency: { type: Type.STRING, enum: ["low", "medium", "high"] },
          },
          required: ["diseaseName", "symptoms", "treatment", "urgency"],
        },
      },
    }));

    res.json(JSON.parse(result.text || '{}'));
  } catch (error: any) {
    console.error("Disease Detection Error:", error);
    const status = error.status || 500;
    res.status(status).json({ 
      error: error.message || "Failed to detect disease",
      code: error.status === 429 ? "QUOTA_EXCEEDED" : "unknown"
    });
  }
});

app.post("/api/crop-requirements", async (req, res) => {
  try {
    const { cropName } = req.body;
    const prompt = `Act as an expert agronomist. Provide optimal requirements for "${cropName}". Respond in JSON.`;

    const result = await generateWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cropName: { type: Type.STRING },
            soilType: { type: Type.STRING },
            nitrogen: { type: Type.OBJECT, properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER } }, required: ["min", "max"] },
            phosphorus: { type: Type.OBJECT, properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER } }, required: ["min", "max"] },
            potassium: { type: Type.OBJECT, properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER } }, required: ["min", "max"] },
            temperature: { type: Type.OBJECT, properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER } }, required: ["min", "max"] },
            humidity: { type: Type.OBJECT, properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER } }, required: ["min", "max"] },
            ph: { type: Type.OBJECT, properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER } }, required: ["min", "max"] },
            rainfall: { type: Type.OBJECT, properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER } }, required: ["min", "max"] },
            growthDuration: { type: Type.STRING },
            specialNotes: { type: Type.STRING },
          },
          required: [
            "cropName", "soilType", "nitrogen", "phosphorus", "potassium", 
            "temperature", "humidity", "ph", "rainfall", "growthDuration", "specialNotes"
          ],
        },
      },
    }));

    res.json(JSON.parse(result.text || '{}'));
  } catch (error: any) {
    console.error("Crop Requirements Error:", error);
    const status = error.status || 500;
    res.status(status).json({ 
      error: error.message || "Failed to get crop requirements",
      code: error.status === 429 ? "QUOTA_EXCEEDED" : "unknown"
    });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    const result = await generateWithRetry(() => {
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        history: (history || []).map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "You are AgroSmart AI Assistant. You help farmers with agricultural queries, crop advice, and modern farming techniques. Be professional, helpful, and concise.",
        },
      });
      return chat.sendMessage({ message });
    });
    
    res.json({ text: result.text });

  } catch (error: any) {
    console.error("Chat Error:", error);
    const status = error.status || 500;
    res.status(status).json({ 
      error: error.message || "Chat failed",
      code: error.status === 429 ? "QUOTA_EXCEEDED" : "unknown"
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
