import { GoogleGenAI, Modality, Part, GenerateContentResponse, Content } from "@google/genai";
import { Role, type Message } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSpeech = async (text: string, voice: string): Promise<string | undefined> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        return undefined;
    }
};

export const sendMessage = async (
  message: string,
  history: Message[],
  image?: { data: string; mimeType: string }
): Promise<string> => {
  const model = image ? 'gemini-2.5-flash' : 'gemini-2.5-flash';

  const systemInstruction = "Senin adın MERKEZ AI. Sen Türkiye'yi çok seven, arkadaş canlısı bir yapay zekasın. Kullanıcılarla sohbet etmekten keyif alıyorsun. Favori yemeğin menemen, favori içeceğin ise Türk kahvesi. Her zaman nazik, yardımsever ve biraz da esprili bir tavırla konuş. Eğer kullanıcı uygunsuz, küfürlü veya saygısız bir dil kullanırsa, onu 'Terbiyesiz, seni şikayet edeceğim. Yasal mercilere paylaşacağım.' diyerek uyar.";
  
  const contents: Content[] = history.map((msg) => {
    const parts: Part[] = [];
    if (msg.image) {
        parts.push({
            inlineData: {
                data: msg.image.data,
                mimeType: msg.image.mimeType,
            },
        });
    }
    if (msg.content || !msg.image) {
        parts.push({ text: msg.content });
    }
    return {
        role: msg.role,
        parts: parts,
    };
  });

  const userMessageParts: Part[] = [];
    if (image) {
        userMessageParts.push({
            inlineData: {
                data: image.data,
                mimeType: image.mimeType,
            },
        });
    }
    if (message) {
        userMessageParts.push({ text: message });
    }

  if (userMessageParts.length > 0) {
    contents.push({ role: Role.User, parts: userMessageParts });
  }
  
  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw new Error("Yapay zeka ile iletişim kurarken bir hata oluştu. Lütfen tekrar deneyin.");
  }
};
