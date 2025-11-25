
import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string, image?: { data: string; mimeType: string; }) => void;
  onLiveModeClick: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onLiveModeClick }) => {
    const [message, setMessage] = useState('');
    const [image, setImage] = useState<{ data: string; mimeType: string; } | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'tr-TR';

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                  setMessage(prev => prev + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsRecording(false);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };
        }
    }, []);
    
    const handleSend = () => {
        if (message.trim() || image) {
            onSendMessage(message, image ?? undefined);
            setMessage('');
            setImage(null);
        }
    };

    const handleMicClick = () => {
        if (!recognitionRef.current) return;
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setMessage('');
            recognitionRef.current.start();
        }
        setIsRecording(!isRecording);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64String = (e.target?.result as string).split(',')[1];
                setImage({ data: base64String, mimeType: file.type });
            };
            reader.readAsDataURL(file);
        }
        event.target.value = ''; // Reset file input
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex-shrink-0 bg-black/30 backdrop-blur-sm p-4">
            <div className="container mx-auto">
                {image && (
                    <div className="relative mb-2 w-32">
                        <img src={`data:${image.mimeType};base64,${image.data}`} alt="Preview" className="rounded-lg w-full h-auto" />
                        <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">&times;</button>
                    </div>
                )}
                <div className="flex items-center bg-gray-800 rounded-full p-2">
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-orange-400" aria-label="Resim Ekle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Mesajınızı buraya yazın..."
                        rows={1}
                        className="flex-grow bg-transparent text-white placeholder-gray-500 focus:outline-none px-4 resize-none max-h-24"
                    />

                    <button onClick={handleMicClick} className={`p-2 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-orange-400'}`} aria-label={isRecording ? 'Kaydı Durdur' : 'Sesli Yaz'}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </button>
                    
                    <button onClick={onLiveModeClick} className="p-2 text-gray-400 hover:text-orange-400" aria-label="Canlı Mod">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    </button>
                    
                    <button onClick={handleSend} className="p-2 text-white bg-orange-600 rounded-full hover:bg-orange-700 ml-2" aria-label="Gönder">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
