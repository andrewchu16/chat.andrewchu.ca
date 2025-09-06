export interface ChatInfo {
  chats_created: number;
  messages_received: number;
  average_response_time: number;
  average_first_token_time: number;
}

export interface MessageCacheInfo {
  id?: string;
  message_id?: string;
  hit: boolean;
  cache_timestamp?: string;
  num_hits: number;
}

export interface MessageProcessingInfo {
  id?: string;
  message_id?: string;
  start_timestamp?: string;
  first_token_timestamp?: string;
  end_timestamp?: string;
}

// Helper function to format response time for display
export function formatResponseTime(seconds: number): string {
  if (seconds < 1) {
    return `${(seconds * 1000).toFixed(0)}ms`;
  }
  return `${seconds.toFixed(2)}s`;
}

// Helper function to format numbers with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Helper function to calculate processing time from timestamps
export function calculateProcessingTime(startTime?: string, endTime?: string): number | null {
  if (!startTime || !endTime) return null;
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return (end - start) / 1000; // Return in seconds
}

// Helper function to calculate time to first token
export function calculateFirstTokenTime(startTime?: string, firstTokenTime?: string): number | null {
  if (!startTime || !firstTokenTime) return null;
  const start = new Date(startTime).getTime();
  const firstToken = new Date(firstTokenTime).getTime();
  return (firstToken - start) / 1000; // Return in seconds
}
