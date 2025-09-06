import { MessageProcessingInfo, MessageCacheInfo } from '@/models/chatInfo';

export async function fetchMessageProcessingInfo(messageId: string): Promise<MessageProcessingInfo | null> {
  try {
    const response = await fetch(`/api/chat/messages/${messageId}/processing`);
    if (!response.ok) {
      console.warn(`Failed to fetch processing info for message ${messageId}:`, response.status);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn(`Error fetching processing info for message ${messageId}:`, error);
    return null;
  }
}

export async function fetchMessageCacheInfo(messageId: string): Promise<MessageCacheInfo | null> {
  try {
    const response = await fetch(`/api/chat/messages/${messageId}/cache`);
    if (!response.ok) {
      console.warn(`Failed to fetch cache info for message ${messageId}:`, response.status);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn(`Error fetching cache info for message ${messageId}:`, error);
    return null;
  }
}

export async function fetchMessageStats(messageId: string): Promise<{
  processingInfo: MessageProcessingInfo | null;
  cacheInfo: MessageCacheInfo | null;
}> {
  const [processingInfo, cacheInfo] = await Promise.all([
    fetchMessageProcessingInfo(messageId),
    fetchMessageCacheInfo(messageId),
  ]);

  return { processingInfo, cacheInfo };
}
