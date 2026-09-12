import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_INSTRUCTION = `You are a world-class frontend engineer and UI/UX designer. 
Your goal is to generate modern, high-fidelity, and production-grade UI using Tailwind CSS.

Requirements:
- Use clean, semantic HTML5.
- Use Tailwind CSS (v4) for all styling.
- Focus on a "premium" aesthetic: generous whitespace, elegant typography, subtle shadows, and refined color palettes.
- Make the layout fully responsive and mobile-friendly.
- Use Lucide icons where appropriate (assume lucide-react is available via CDN or script).
- Include interactive elements like hover states, transitions, and focus rings.
- Ensure all components used are standard HTML elements styled with Tailwind.
- Implement simple JavaScript state management (e.g., tabs, modals) within the same HTML file using vanilla JS.
- PERFORMANCE: Use loading="lazy" for all images. Avoid deeply nested DOM structures.
- ACCESSIBILITY: Ensure proper color contrast, use ARIA labels where necessary, and maintain a logical heading structure.
- STABILITY: Wrap all custom scripts in try-catch blocks.

Return a complete, standalone HTML file that I can render in an iframe.
The HTML must include:
1. <!DOCTYPE html>
2. <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
3. <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
4. Lucide icons script: <script src="https://unpkg.com/lucide@latest"></script>
5. A script to initialize lucide icons: <script>lucide.createIcons();</script>

Do not include any markdown code blocks or explanations. Just the raw HTML.`;

export async function convertSketchToCode(imageBase64: string, mimeType: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: SYSTEM_INSTRUCTION },
            { text: "Convert this hand-drawn sketch into a modern, high-fidelity UI." },
            {
              inlineData: {
                data: imageBase64.split(",")[1],
                mimeType: mimeType
              }
            }
          ]
        }
      ]
    });

    return response.text.trim() || "<!-- Failed to generate code -->";
  } catch (error) {
    console.error("Error converting sketch:", error);
    throw error;
  }
}

export async function modifyCodeWithPrompt(currentCode: string, userPrompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: SYSTEM_INSTRUCTION },
            { text: `Current Code:\n${currentCode}` },
            { text: `User Modification Request: ${userPrompt}` },
            { text: "Modify the current code based on the user request. Maintain the same structure but apply the requested changes intelligently. Return the full updated HTML." }
          ]
        }
      ]
    });

    return response.text.trim() || currentCode;
  } catch (error) {
    console.error("Error modifying code:", error);
    throw error;
  }
}

export async function enhanceUI(currentCode: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: SYSTEM_INSTRUCTION },
            { text: `Current Code:\n${currentCode}` },
            { text: "Analyze the current UI and enhance it to be more modern, premium, and accessible. Improve spacing, color usage, typography, and add subtle animations where appropriate. Return the full updated HTML." }
          ]
        }
      ]
    });

    return response.text.trim() || currentCode;
  } catch (error) {
    console.error("Error enhancing UI:", error);
    throw error;
  }
}

export async function getUISuggestions(code: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "You are a UI/UX auditor. Analyze the following HTML/Tailwind code and provide 3-4 concise, actionable suggestions for improving accessibility, design, or performance. Return only a JSON array of strings." },
            { text: `Code to analyze:\n${code}` }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text.trim()) || [];
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return [];
  }
}

export async function validateAndFixCode(code: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "You are a code validator. Your task is to ensure the following HTML/Tailwind code is valid, has all necessary scripts, and won't crash when rendered in an iframe." },
            { text: `Code to validate:\n${code}` },
            { text: "If there are syntax errors, missing scripts (Tailwind, Lucide), or broken tags, fix them. Ensure it is a complete standalone HTML file. Return only the fixed HTML." }
          ]
        }
      ]
    });

    return response.text.trim() || code;
  } catch (error) {
    console.error("Error validating code:", error);
    return code;
  }
}
