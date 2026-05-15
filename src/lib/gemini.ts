
export const getCropRecommendation = async (data: {
  n: number;
  p: number;
  k: number;
  temp: number;
  humidity: number;
  ph: number;
  rainfall: number;
}) => {
  const response = await fetch("/api/crop-recommendation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const getFertilizerRecommendation = async (soilParams: string, cropName: string) => {
  const response = await fetch("/api/fertilizer-recommendation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ soilParams, cropName }),
  });
  return response.json();
};

export const detectDisease = async (base64Image: string) => {
  const response = await fetch("/api/detect-disease", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64Image }),
  });
  return response.json();
};

export const agriculturalChat = async (history: { role: "user" | "model"; content: string }[], message: string, signal?: AbortSignal) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
    signal
  });
  const data = await response.json();
  if (data.error) return data;
  return data.text;
};

export const getCropRequirements = async (cropName: string) => {
  const response = await fetch("/api/crop-requirements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cropName }),
  });
  return response.json();
};

