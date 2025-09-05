export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isStreaming?: boolean;
}

export type MessageSender = 'user' | 'bot';

// Type guard to check if a message is streaming
export function isStreamingMessage(message: Message): boolean {
  return message.isStreaming === true;
}

// Helper function to create a new message
export function createMessage(
  content: string,
  sender: MessageSender,
  id?: string,
  isStreaming: boolean = false
): Message {
  return {
    id: id || Date.now().toString(),
    content,
    sender,
    timestamp: new Date(),
    isStreaming,
  };
}

// Helper function to create a user message
export function createUserMessage(content: string, id?: string): Message {
  return createMessage(content, 'user', id);
}

// Helper function to create a bot message
export function createBotMessage(content: string, id?: string, isStreaming: boolean = false): Message {
  return createMessage(content, 'bot', id, isStreaming);
}
