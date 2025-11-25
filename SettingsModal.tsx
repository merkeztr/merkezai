import React from 'react';
import type { Settings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  if (!isOpen) return null;
  
  const handleSettingChange = (key: keyof Settings, value: string | boolean) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 border border-orange-500/30 rounded-lg shadow-xl p-6 w-full max-w-md animate-slide-in-bottom" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-orange-400">Ayarlar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Hotword Detection */}
           <div className="flex items-center justify-between">
            <div>
                <span className="text-sm font-medium text-gray-300">Sıcak Kelime Algılama ("MERKEZ")</span>
                <p className="text-xs text-gray-500">Uygulamayı eller serbest başlatın.</p>
            </div>
            <label htmlFor="hotword-toggle" className="inline-flex relative items-center cursor-pointer">
              <input type="checkbox" id="hotword-toggle" className="sr-only peer" 
                checked={settings.enableHotword}
                onChange={(e) => handleSettingChange('enableHotword', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          {/* Recognition Language */}
          <div>
            <label htmlFor="language-select" className="block mb-2 text-sm font-medium text-gray-300">
              Ses Tanıma Dili
            </label>
            <select
              id="language-select"
              value={settings.recognitionLanguage}
              onChange={(e) => handleSettingChange('recognitionLanguage', e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
            >
              <option value="tr-TR">Türkçe</option>
              <option value="en-US">English (US)</option>
              <option value="de-DE">Deutsch</option>
              <option value="es-ES">Español</option>
            </select>
          </div>

          {/* Enable TTS */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Yapay Zeka Seslendirmesi (TTS)</span>
            <label htmlFor="tts-toggle" className="inline-flex relative items-center cursor-pointer">
              <input type="checkbox" id="tts-toggle" className="sr-only peer" 
                checked={settings.enableTTS}
                onChange={(e) => handleSettingChange('enableTTS', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          {/* TTS Voice Selection */}
          {settings.enableTTS && (
            <div>
              <label htmlFor="voice-select" className="block mb-2 text-sm font-medium text-gray-300">
                Ses Seçimi
              </label>
              <select
                id="voice-select"
                value={settings.ttsVoice}
                onChange={(e) => handleSettingChange('ttsVoice', e.target.value)}
                className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
              >
                <option value="Kore">Kore (Erkek)</option>
                <option value="Puck">Puck (Kadın)</option>
                <option value="Charon">Charon (Erkek)</option>
                <option value="Fenrir">Fenrir (Kadın)</option>
                <option value="Zephyr">Zephyr (Erkek)</option>
              </select>
            </div>
          )}

        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 transition-colors duration-200"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;