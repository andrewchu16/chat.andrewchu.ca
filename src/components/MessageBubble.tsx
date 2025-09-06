import { Message } from '@/models';
import { calculateProcessingTime, calculateFirstTokenTime, formatResponseTime } from '@/models/chatInfo';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  // Process the content to handle escaped newlines
  const processedContent = message.content
    .replace(/\\n/g, '\n')  // Convert literal \n to actual newlines
    .replace(/\n/g, '  \n'); // Convert newlines to markdown line breaks

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
        <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              // Customize paragraph styling to preserve line breaks
              p: ({ children }) => (
                <p className="mb-2 last:mb-0 leading-relaxed whitespace-pre-line">{children}</p>
              ),
              // Customize code block styling
              pre: ({ children }) => (
                <pre className="bg-gray-100 dark:bg-gray-900 rounded p-2 overflow-x-auto text-xs my-2">
                  {children}
                </pre>
              ),
              // Customize inline code styling
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="bg-gray-100 dark:bg-gray-900 px-1 rounded text-xs">
                    {children}
                  </code>
                ) : (
                  <code className={className}>{children}</code>
                );
              },
              // Customize list styling
              ul: ({ children }) => (
                <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
              ),
              // Customize heading styling
              h1: ({ children }) => (
                <h1 className="text-lg font-bold mb-2">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-bold mb-2">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-bold mb-1">{children}</h3>
              ),
              // Customize blockquote styling
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-3 italic my-2">
                  {children}
                </blockquote>
              ),
              // Customize link styling
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-blue-400 hover:text-blue-300 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              // Add explicit line break handling
              br: () => <br />,
            }}
          >
            {processedContent}
          </ReactMarkdown>
        </div>
        <div className="text-xs opacity-70 mt-1">
          <div className="flex items-center space-x-2">
            <span>
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {message.isStreaming && (
              <span className="text-xs">Typing...</span>
            )}
          </div>
          
          {/* Show processing stats if available and enabled */}
          {message.showStats && message.processingInfo && !message.isStreaming && (
            <div className="flex items-center space-x-3 mt-1 text-xs opacity-60">
              {/* Processing time */}
              {(() => {
                const processingTime = calculateProcessingTime(
                  message.processingInfo.start_timestamp,
                  message.processingInfo.end_timestamp
                );
                return processingTime !== null ? (
                  <span title="Total processing time">
                    ⏱ {formatResponseTime(processingTime)}
                  </span>
                ) : null;
              })()}
              
              {/* Time to first token */}
              {(() => {
                const firstTokenTime = calculateFirstTokenTime(
                  message.processingInfo.start_timestamp,
                  message.processingInfo.first_token_timestamp
                );
                return firstTokenTime !== null ? (
                  <span title="Time to first token">
                    🚀 {formatResponseTime(firstTokenTime)}
                  </span>
                ) : null;
              })()}
              
              {/* Cache hit info */}
              {message.cacheInfo && (
                <span title={`Cache hits: ${message.cacheInfo.num_hits}`}>
                  {message.cacheInfo.hit ? '💾 hit' : '💾 miss'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
