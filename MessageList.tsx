import React, { useRef, useEffect } from 'react';
import type { Message } from '../types';
import { Role } from '../types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const TypingIndicator: React.FC = () => (
  <div className="flex justify-start animate-slide-in-bottom">
      <div className="bg-gray-800 rounded-2xl rounded-bl-none px-5 py-4 max-w-lg">
          <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
          </div>
      </div>
  </div>
);


const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-grow overflow-y-auto p-6 space-y-6">
      <div className="container mx-auto space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === Role.User ? 'justify-end' : 'justify-start'} animate-slide-in-bottom`}>
            <div className={`p-4 rounded-2xl max-w-lg break-words text-white shadow-lg ${
              msg.role === Role.User
                ? 'bg-orange-600 rounded-br-none'
                : 'bg-gray-800 rounded-bl-none'
            }`}>
              {msg.image && (
                <img
                    src={`data:${msg.image.mimeType};base64,${msg.image.data}`}
                    alt="Yüklenen içerik"
                    className="rounded-lg mb-2 max-w-full h-auto max-h-80 object-contain"
                />
              )}
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;