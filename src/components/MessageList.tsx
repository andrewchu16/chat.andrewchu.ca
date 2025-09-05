import { forwardRef } from 'react';
import { Message } from '@/models';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isWaitingForStream: boolean;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, isWaitingForStream }, ref) => {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          <TypingIndicator isVisible={isWaitingForStream} />
          
          <div ref={ref} />
        </div>
      </div>
    );
  }
);

MessageList.displayName = 'MessageList';
