import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { LRUCache } from "lru-cache";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

// Cache setup to reduce API hits
const apiCache = new LRUCache({
  max: 200, // Increased capacity
  ttl: 1000 * 60 * 60, // 1 hour TTL
});

// Helper to generate a simple hash for large payload caching (like images)
function generateHash(data: string): string {
  return crypto.createHash('md5').update(data).digest('hex');
}

function normalize(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Initialize Gemini with recommended settings
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const MODELS_TO_TRY = [
  "gemini-3-flash-preview",
  "gemini-2.0-flash", // Keeping 2.0 flash as it's powerful, but fallback triggers if quota hit
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-1.5-flash-8b"
];

// Helper for retries and model fallback
async function generateWithRetry(fn: (model: string) => Promise<any>, retries = 2, delay = 1000): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please add it in the Settings > Secrets panel of AI Studio.");
  }

  let modelIndex = 0;
  let lastError: any = null;

  for (let i = 0; i <= retries; i++) {
    const currentModel = MODELS_TO_TRY[modelIndex];
    try {
      const result = await fn(currentModel);
      if (!result) throw new Error("Empty response from AI model");
      return result;
    } catch (error: any) {
      lastError = error;
      const errorBody = error.message?.toLowerCase() || '';
      console.error(`Attempt ${i + 1} with ${currentModel} failed:`, errorBody);

      const is429 = error.status === 429 || errorBody.includes('429') || errorBody.includes('quota') || errorBody.includes('resource_exhausted');
      const is404 = error.status === 404 || errorBody.includes('404') || errorBody.includes('not found') || errorBody.includes('not supported');
      const is403 = error.status === 403 || errorBody.includes('403') || errorBody.includes('permission') || errorBody.includes('unregistered');
      const isUnsupported = (error.status === 400 || error.status === 404 || error.status === 403) && (errorBody.includes('not supported') || errorBody.includes('unknown model') || errorBody.includes('invalid model') || errorBody.includes('unregistered') || is403);
      const isDailyLimit = (errorBody.includes('perday') || errorBody.includes('daily') || errorBody.includes('limit: 0') || errorBody.includes('limit: 20')) && !errorBody.includes('rate');
      
      // If model not found or restricted or unsupported, try next model in our list
      if ((is404 || isUnsupported || is403) && modelIndex < MODELS_TO_TRY.length - 1) {
        console.warn(`Model ${currentModel} unavailable/unsupported/restricted/unregistered, trying fallback ${MODELS_TO_TRY[modelIndex + 1]}...`);
        modelIndex++;
        i--; // Don't count as a retry attempt for the logic, just a model switch
        continue;
      }

      // If quota exceeded for a specific model, try the next one unless it's a global daily limit
      if (is429 && !isDailyLimit && modelIndex < MODELS_TO_TRY.length - 1) {
        console.warn(`Quota limit on ${currentModel}, switching to ${MODELS_TO_TRY[modelIndex + 1]}...`);
        modelIndex++;
        i--;
        continue;
      }

      // If we are at the last model and it's a daily limit, throw special error
      if (isDailyLimit || (is429 && modelIndex === MODELS_TO_TRY.length - 1)) {
        const quotaError = new Error("Daily free-tier quota reached. Please wait until tomorrow or provide your own API key in Settings > Secrets to increase limits.");
        (quotaError as any).status = 429;
        throw quotaError;
      }

      // Standard retry with delay for transient errors (503, or 429 for the same model if not daily limit)
      if (i < retries && (error.status === 503 || (is429 && !isDailyLimit))) {
        const waitTime = is429 ? Math.max(delay * 4, 10000) : Math.max(delay * 2, 1000); 
        console.warn(`Transient error on ${currentModel}, retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        delay = waitTime;
        continue;
      }
      
      throw error;
    }
  }
  throw lastError || new Error("All models and retries failed");
}

app.use(express.json({ limit: '10mb' }));

// API Routes
app.post("/api/crop-recommendation", async (req, res) => {
  try {
    const data = req.body;
    const cacheKey = `crop_${JSON.stringify(data)}`;
    const cachedResult = apiCache.get(cacheKey);
    if (cachedResult) return res.json(cachedResult);

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

    const result = await generateWithRetry((model) => ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
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

    const parsed = JSON.parse(result.text || '{}');
    apiCache.set(cacheKey, parsed);
    res.json(parsed);
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
    
    const response = await generateWithRetry((model) => ai.models.generateContent({
      model: model, 
      contents: {
        parts: [{ text: `Generate a high-quality agricultural image: ${prompt}` }],
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
    const cacheKey = `fertilizer_${normalize(soilParams)}_${normalize(cropName)}`;
    const cachedResult = apiCache.get(cacheKey);
    if (cachedResult) return res.json(cachedResult);

    const prompt = `Act as an expert soil scientist and agronomist. 
      Soil Condition: ${soilParams}
      Target Crop: ${cropName}
      
      Recommend the best fertilizer solution (synthetic and organic alternatives). 
      Provide detailed guidance on application, precautions, and expected benefits.
      
      Respond in JSON with:
      - fertilizerName (string)
      - applicationMethod (string)
      - dosageInfo (string)
      - reason (string)
      - alternativeOrganic (string: organic alternative recommendation)
      - bestApplicationTime (string: optimal time of day/growth stage)
      - precautions (array of strings: safety and environmental warnings)
      - expectedResults (string: what the farmer should see after application)
      - soilImpact (string: how it affects soil health in the long run)
      `;

    const result = await generateWithRetry((model) => ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fertilizerName: { type: Type.STRING },
            applicationMethod: { type: Type.STRING },
            dosageInfo: { type: Type.STRING },
            reason: { type: Type.STRING },
            alternativeOrganic: { type: Type.STRING },
            bestApplicationTime: { type: Type.STRING },
            precautions: { type: Type.ARRAY, items: { type: Type.STRING } },
            expectedResults: { type: Type.STRING },
            soilImpact: { type: Type.STRING },
          },
          required: [
            "fertilizerName", "applicationMethod", "dosageInfo", "reason", 
            "alternativeOrganic", "bestApplicationTime", "precautions", 
            "expectedResults", "soilImpact"
          ],
        },
      },
    }));

    const parsed = JSON.parse(result.text || '{}');
    apiCache.set(cacheKey, parsed);
    res.json(parsed);
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
    const imageHash = generateHash(image);
    const cacheKey = `disease_${imageHash}`;
    const cachedResult = apiCache.get(cacheKey);
    if (cachedResult) return res.json(cachedResult);

    const result = await generateWithRetry((model) => ai.models.generateContent({
      model: model,
      contents: [{
        role: 'user',
        parts: [
          { text: "Analyze this crop leaf image. Detect any diseases, pests, or deficiencies. Identify affected areas with bounding boxes [ymin, xmin, ymax, xmax] in normalized coordinates (0-1000). Provide details in JSON: diseaseName, symptoms (array of objects {text, confidence, box: [ymin, xmin, ymax, xmax]}), treatment, urgency (low|medium|high)." },
          { inlineData: { data: image, mimeType: "image/jpeg" } }
        ]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diseaseName: { type: Type.STRING },
            symptoms: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  box: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                }
              }
            },
            treatment: { type: Type.STRING },
            urgency: { type: Type.STRING, enum: ["low", "medium", "high"] },
          },
          required: ["diseaseName", "symptoms", "treatment", "urgency"],
        },
      },
    }));

    const parsed = JSON.parse(result.text || '{}');
    apiCache.set(cacheKey, parsed);
    res.json(parsed);
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
    const cacheKey = `requirements_${normalize(cropName)}`;
    const cachedResult = apiCache.get(cacheKey);
    if (cachedResult) return res.json(cachedResult);

    const prompt = `Act as an expert agronomist. Provide optimal requirements for "${cropName}". Respond in JSON.`;

    const result = await generateWithRetry((model) => ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
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

    const parsed = JSON.parse(result.text || '{}');
    apiCache.set(cacheKey, parsed);
    res.json(parsed);
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
    
    // Only cache simple generic queries without long history to avoid context mixups
    const isGeneric = !history || history.length === 0;
    const cacheKey = `chat_${generateHash(message.toLowerCase().trim())}`;
    
    if (isGeneric) {
      const cachedResult = apiCache.get(cacheKey);
      if (cachedResult) return res.json(cachedResult);
    }

    const result = await generateWithRetry((model) => {
      const chat = ai.chats.create({
        model: model,
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
    
    const responseData = { text: result.text };
    if (isGeneric) apiCache.set(cacheKey, responseData);
    res.json(responseData);

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
        port: PORT,
        host: '0.0.0.0',
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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`Error: Port ${PORT} is already in use. Please kill the process using this port or change it (e.g. PORT=3001 npm run dev).`);
      process.exit(1);
    }
  });
}

startServer();
