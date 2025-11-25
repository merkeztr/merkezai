
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import SettingsModal from './components/SettingsModal';
import LiveModeSelectionModal from './components/LiveModeSelectionModal';
import LiveModeOverlay from './components/LiveModeOverlay';
import { Role, type Message, type Settings } from './types';
import { sendMessage, generateSpeech } from './services/geminiService';
import { playAudio } from './utils/audioUtils';
import { backgroundImages } from './assets/image_data';

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: Role.Model,
            content: "Türkiye Cumhuriyeti'nin kurucusu ulu önder Mustafa Kemal Atatürk'ü saygı, sevgi ve özlemle anıyorum."
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isLiveModeSelectionOpen, setIsLiveModeSelectionOpen] = useState(false);
    const [isLiveModeActive, setIsLiveModeActive] = useState(false);
    const [settings, setSettings] = useState<Settings>({
        recognitionLanguage: 'tr-TR',
        enableTTS: true,
        ttsVoice: 'Kore',
        enableHotword: false,
    });
    const [backgroundImage, setBackgroundImage] = useState('');

    useEffect(() => {
        const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
        setBackgroundImage(randomImage);
    }, []);

    const handleSendMessage = useCallback(async (content: string, image?: { data: string; mimeType: string; }) => {
        if (!content.trim() && !image) return;

        const userMessage: Message = {
            role: Role.User,
            content,
            image,
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const modelResponse = await sendMessage(content, messages, image);

            const modelMessage: Message = {
                role: Role.Model,
                content: modelResponse,
            };
            setMessages(prev => [...prev, modelMessage]);

            if (settings.enableTTS && modelResponse) {
                const audioBase64 = await generateSpeech(modelResponse, settings.ttsVoice);
                if (audioBase64) {
                    playAudio(audioBase64);
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                role: Role.Model,
                content: 'Üzgünüm, bir hatayla karşılaştım. Lütfen tekrar deneyin.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, settings.enableTTS, settings.ttsVoice]);

    return (
        <div className="flex flex-col h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div className="relative flex flex-col h-full z-10">
                <Header onSettingsClick={() => setIsSettingsModalOpen(true)} />
                <MessageList messages={messages} isLoading={isLoading} />
                <ChatInput onSendMessage={handleSendMessage} onLiveModeClick={() => setIsLiveModeSelectionOpen(true)} />

                <SettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={() => setIsSettingsModalOpen(false)}
                    settings={settings}
                    onSettingsChange={setSettings}
                />
                
                <LiveModeSelectionModal
                    isOpen={isLiveModeSelectionOpen}
                    onClose={() => setIsLiveModeSelectionOpen(false)}
                    onSelect={(mode) => {
                        setIsLiveModeSelectionOpen(false);
                        // For this implementation, both modes just activate the same overlay
                        if (mode === 'audio' || mode === 'video') {
                            setIsLiveModeActive(true);
                        }
                    }}
                />

                {isLiveModeActive && (
                    <LiveModeOverlay
                        settings={settings}
                        onClose={() => setIsLiveModeActive(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default App;