
import React from 'react';

interface LiveModeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mode: 'audio' | 'video') => void;
}

const LiveModeSelectionModal: React.FC<LiveModeSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 border border-orange-500/30 rounded-lg shadow-xl p-8 w-full max-w-sm animate-slide-in-bottom text-center" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-orange-400 mb-6">Canlı Modu Başlat</h2>
        <p className="text-gray-400 mb-8">Lütfen bir etkileşim modu seçin.</p>
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => onSelect('audio')}
            className="w-full px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            <span>Sadece Ses</span>
          </button>
          <button
            onClick={() => onSelect('video')}
            className="w-full px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-3"
            disabled // Video mode is not implemented in this version
            title="Yakında"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            <span>Ses ve Görüntü (Yakında)</span>
          </button>
        </div>
         <button
            onClick={onClose}
            className="mt-8 text-gray-400 hover:text-white transition-colors"
        >
            İptal
        </button>
      </div>
    </div>
  );
};

export default LiveModeSelectionModal;
