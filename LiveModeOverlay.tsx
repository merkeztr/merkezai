import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, LiveSession } from '@google/genai';
import type { Settings } from '../types';
import { decode } from '../utils/audioUtils';

// Fix: Implement audio decoding and encoding functions as per Gemini API guidelines for raw PCM data.
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

interface LiveModeOverlayProps {
  settings: Settings;
  onClose: () => void;
}

const LiveModeOverlay: React.FC<LiveModeOverlayProps> = ({ settings, onClose }) => {
    const [isConnecting, setIsConnecting] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [userSaid, setUserSaid] = useState('');
    const [modelSaid, setModelSaid] = useState('');
    const sessionRef = useRef<LiveSession | null>(null);
    const fullUserTranscript = useRef('');
    const fullModelTranscript = useRef('');

    useEffect(() => {
        let stream: MediaStream;
        let inputAudioContext: AudioContext;
        let outputAudioContext: AudioContext;
        let scriptProcessor: ScriptProcessorNode;
        let sourceNode: MediaStreamAudioSourceNode;
        let nextStartTime = 0;
        const sources = new Set<AudioBufferSourceNode>();
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const connect = async () => {
            try {
                inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });

                outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                const outputNode = outputAudioContext.createGain();
                outputNode.connect(outputAudioContext.destination);

                const systemInstruction = "Senin adın MERKEZ AI. Sen Türkiye'yi çok seven, arkadaş canlısı bir yapay zekasın. Kullanıcılarla sohbet etmekten keyif alıyorsun. Favori yemeğin menemen, favori içeceğin ise Türk kahvesi. Her zaman nazik, yardımsever ve biraz da esprili bir tavırla konuş. Eğer kullanıcı uygunsuz, küfürlü veya saygısız bir dil kullanırsa, onu 'Terbiyesiz, seni şikayet edeceğim. Yasal mercilere paylaşacağım.' diyerek uyar.";

                const sessionPromise = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                    callbacks: {
                        onopen: () => {
                            setIsConnecting(false);
                            setIsListening(true);
                            sourceNode = inputAudioContext.createMediaStreamSource(stream);
                            scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                            
                            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const l = inputData.length;
                                const int16 = new Int16Array(l);
                                for (let i = 0; i < l; i++) {
                                    int16[i] = inputData[i] * 32768;
                                }
                                const pcmBlob: Blob = {
                                    data: encode(new Uint8Array(int16.buffer)),
                                    mimeType: 'audio/pcm;rate=16000',
                                };
                                
                                sessionPromise.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            };
                            
                            sourceNode.connect(scriptProcessor);
                            scriptProcessor.connect(inputAudioContext.destination);
                        },
                        onmessage: async (message: LiveServerMessage) => {
                            if (message.serverContent?.inputTranscription) {
                                fullUserTranscript.current += message.serverContent.inputTranscription.text;
                                setUserSaid(fullUserTranscript.current);
                            }
                            if (message.serverContent?.outputTranscription) {
                                fullModelTranscript.current += message.serverContent.outputTranscription.text;
                                setModelSaid(fullModelTranscript.current);
                            }
                            if (message.serverContent?.turnComplete) {
                                fullUserTranscript.current = '';
                                fullModelTranscript.current = '';
                            }

                            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData.data;
                            if (base64Audio) {
                                nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                                const source = outputAudioContext.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputNode);
                                source.addEventListener('ended', () => { sources.delete(source); });
                                source.start(nextStartTime);
                                nextStartTime += audioBuffer.duration;
                                sources.add(source);
                            }

                            if (message.serverContent?.interrupted) {
                                for (const source of sources.values()) {
                                    source.stop();
                                }
                                sources.clear();
                                nextStartTime = 0;
                            }
                        },
                        onerror: (e) => {
                            console.error('Live session error:', e);
                            setIsConnecting(false);
                            setIsListening(false);
                        },
                        onclose: () => {
                            setIsListening(false);
                        },
                    },
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: {
                            voiceConfig: { prebuiltVoiceConfig: { voiceName: settings.ttsVoice } },
                        },
                        inputAudioTranscription: {},
                        outputAudioTranscription: {},
                        systemInstruction,
                    },
                });

                sessionRef.current = await sessionPromise;

            } catch (error) {
                console.error('Failed to start live session:', error);
                setIsConnecting(false);
            }
        };

        connect();

        return () => {
            sessionRef.current?.close();
            stream?.getTracks().forEach(track => track.stop());
            if (scriptProcessor) scriptProcessor.disconnect();
            if (sourceNode) sourceNode.disconnect();
            inputAudioContext?.close().catch(console.error);
            outputAudioContext?.close().catch(console.error);
        };
    }, [settings.ttsVoice]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-50 animate-fade-in p-4">
            <div className="text-center">
                <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-orange-500/20' : 'bg-gray-700/20'}`}>
                    <div className={`absolute inset-0 border-4 rounded-full ${isListening ? 'border-orange-500 animate-pulse-slow' : 'border-gray-600'}`}></div>
                     <svg className={`h-16 w-16 ${isListening ? 'text-orange-400' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </div>
                <div className="mt-8 text-white h-32 w-full max-w-2xl">
                    {isConnecting ? <p className="text-xl">Bağlanıyor...</p> : 
                     isListening ? <p className="text-xl">Dinliyorum...</p> :
                     <p className="text-xl text-red-500">Bağlantı kesildi.</p> 
                    }
                    <div className="mt-4 space-y-2 text-left">
                        <p className="text-gray-400 truncate"><span className="font-bold">Siz:</span> {userSaid}</p>
                        <p className="text-orange-400 truncate"><span className="font-bold">Model:</span> {modelSaid}</p>
                    </div>
                </div>
            </div>

            <button
                onClick={onClose}
                className="absolute bottom-10 px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors"
            >
                Canlı Modu Kapat
            </button>
        </div>
    );
};

export default LiveModeOverlay;
