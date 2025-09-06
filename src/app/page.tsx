'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, createUserMessage, createBotMessage } from '@/models';
import { Header, MessageList, ChatInput, InfoStats } from '@/components';
import { fetchMessageStats } from '@/utils/messageStats';

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    createBotMessage('Hi there! I am `andrewchu-1b-chat`. Ask me questions about Andrew\'s work, projects, and life. Please note my responses may be innacurate due to model size constraints and quantization. I am running on a raspberry pi 4 with 8gb of ram.', '1'),
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForStream, setIsWaitingForStream] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = createUserMessage(inputValue.trim(), undefined, true); // Enable stats for user messages

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue.trim();
    setInputValue('');
    setIsLoading(true);
    setIsWaitingForStream(true);

    try {
      // Simulate 2 second delay before starting the stream
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create initial bot message for streaming
      const botMessageId = (Date.now() + 1).toString();
      const initialBotMessage = createBotMessage('', botMessageId, true, true); // Enable stats for AI responses

      setMessages(prev => [...prev, initialBotMessage]);
      setIsWaitingForStream(false); // Hide typing bubble when stream starts

      // Start SSE connection
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageContent,
          chatId: chatId 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'chat_id') {
                // Store the chat ID for future messages
                setChatId(data.chat_id);
                console.log('Received chat ID:', data.chat_id);
              } else if (data.type === 'token') {
                if (data.done) {
                  // Streaming completed
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === botMessageId 
                        ? { ...msg, isStreaming: false }
                        : msg
                    )
                  );
                  setIsLoading(false);
                  
                  // Fetch processing stats for the completed message
                  setTimeout(async () => {
                    try {
                      const stats = await fetchMessageStats(botMessageId);
                      setMessages(prev => 
                        prev.map(msg => 
                          msg.id === botMessageId 
                            ? { 
                                ...msg, 
                                processingInfo: stats.processingInfo || undefined,
                                cacheInfo: stats.cacheInfo || undefined
                              }
                            : msg
                        )
                      );
                    } catch (error) {
                      console.warn('Failed to fetch processing stats:', error);
                    }
                  }, 1000); // Delay to allow backend to save stats
                  
                  break;
                } else if (data.token) {
                  // Add token to accumulated content
                  accumulatedContent += data.token;
                  
                  // Update the streaming message
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === botMessageId 
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                }
              } else if (data.type === 'error') {
                // Handle errors from backend
                console.error('Backend error:', data.error);
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error streaming response:', error);
      
      // Show error message
      const errorMessage = createBotMessage('Sorry, there was an error getting a response. Please try again.', undefined, false, false);
      
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      setIsWaitingForStream(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Chat with Andrew Chu!" chatId={chatId} />
      
      <MessageList 
        messages={messages}
        isWaitingForStream={isWaitingForStream}
        ref={messagesEndRef}
      />
      
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        onKeyPress={handleKeyPress}
        disabled={isLoading}
      />
      
      <InfoStats />
    </div>
  );
}