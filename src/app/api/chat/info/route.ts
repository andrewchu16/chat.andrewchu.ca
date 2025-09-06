interface ChatInfoResponse {
  chats_created: number;
  messages_received: number;
  average_response_time: number;
}

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      throw new Error('BACKEND_URL environment variable is not set');
    }

    console.log('Fetching chat info from backend...');
    
    const response = await fetch(`${backendUrl}/chat/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chat info: ${response.status} ${response.statusText}`);
    }

    const data: ChatInfoResponse = await response.json();
    console.log('Retrieved chat info:', data);

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

// Handle CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
