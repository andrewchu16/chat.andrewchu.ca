import { MessageProcessingInfo, MessageCacheInfo } from './chatInfo';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  processingInfo?: MessageProcessingInfo;
  cacheInfo?: MessageCacheInfo;
  showStats?: boolean; // Whether to show processing stats for this message
}

export type MessageSender = 'user' | 'assistant';

// Type guard to check if a message is streaming
export function isStreamingMessage(message: Message): boolean {
  return message.isStreaming === true;
}

// Helper function to create a new message
export function createMessage(
  content: string,
  sender: MessageSender,
  id?: string,
  isStreaming: boolean = false,
  showStats: boolean = false
): Message {
  return {
    id: id || Date.now().toString(),
    content,
    sender,
    timestamp: new Date(),
    isStreaming,
    showStats,
  };
}

// Helper function to create a user message
export function createUserMessage(content: string, id?: string, showStats: boolean = false): Message {
  return createMessage(content, 'user', id, false, showStats);
}

// Helper function to create a bot message
export function createBotMessage(content: string, id?: string, isStreaming: boolean = false, showStats: boolean = false): Message {
  return createMessage(content, 'assistant', id, isStreaming, showStats);
}
