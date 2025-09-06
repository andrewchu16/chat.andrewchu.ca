import { NextRequest } from 'next/server';

interface MessageProcessingInfoResponse {
  id?: string;
  message_id?: string;
  start_timestamp?: string;
  first_token_timestamp?: string;
  end_timestamp?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      throw new Error('BACKEND_URL environment variable is not set');
    }

    const { messageId } = await params;
    console.log(`Fetching processing info for message ${messageId}...`);
    
    const response = await fetch(`${backendUrl}/chat/messages/${messageId}/processing`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return new Response(JSON.stringify({ 
          error: 'Processing info not found' 
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Failed to fetch processing info: ${response.status} ${response.statusText}`);
    }

    const data: MessageProcessingInfoResponse = await response.json();
    console.log('Retrieved processing info:', data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
