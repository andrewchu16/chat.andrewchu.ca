import { Message } from '@/models';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={`flex ${
        message.sender === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
          message.sender === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">
          {message.content}
        </p>
        <span className="text-xs opacity-70 mt-1 block">
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {message.isStreaming && (
            <span className="ml-2 text-xs">Typing...</span>
          )}
        </span>
      </div>
    </div>
  );
}
