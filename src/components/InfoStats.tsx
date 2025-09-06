'use client';

import { useState, useEffect } from 'react';
import { ChatInfo, formatResponseTime, formatNumber } from '@/models';

export function InfoStats() {
  const [stats, setStats] = useState<ChatInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Make API call to the backend info endpoint
      const response = await fetch('/api/chat/info', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      const data: ChatInfo = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching chat stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    // const interval = setInterval(fetchStats, 30000);
    
    // return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="px-4 py-2">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400 opacity-50"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-2">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-xs text-gray-400">Stats unavailable</span>
          <button
            onClick={fetchStats}
            className="text-xs text-gray-400 hover:text-gray-500 underline"
          >
            retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
        <span>
          {formatNumber(stats.chats_created)} chats
        </span>
        <span className="text-gray-300 dark:text-gray-600">•</span>
        <span>
          {formatNumber(stats.messages_received)} messages
        </span>
        <span className="text-gray-300 dark:text-gray-600">•</span>
        <span>
          {formatResponseTime(stats.average_response_time)} avg response
        </span>
        <span className="text-gray-300 dark:text-gray-600">•</span>
        <span>
          {formatResponseTime(stats.average_first_token_time)} avg first token
        </span>
        <button
          onClick={fetchStats}
          className="text-gray-300 hover:text-gray-400 ml-2"
          title="Refresh stats"
        >
          ↻
        </button>
      </div>
    </div>
  );
}
