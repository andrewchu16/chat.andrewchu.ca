import { NextRequest } from 'next/server';

interface ChatCreateResponse {
  id: number;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, chatId } = await request.json();
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      throw new Error('BACKEND_URL environment variable is not set');
    }

    let currentChatId = chatId;

    // If no chatId provided, create a new chat
    if (!currentChatId) {
      console.log('Creating new chat...');
      const createResponse = await fetch(`${backendUrl}/chat/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create chat: ${createResponse.status} ${createResponse.statusText}`);
      }

      const chatData: ChatCreateResponse = await createResponse.json();
      currentChatId = chatData.id;
      console.log(`Created chat with ID: ${currentChatId}`);
    }

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      start(controller) {
        const streamFromBackend = async () => {
          try {
            console.log(`Starting stream for chat ${currentChatId} with message: "${message}"`);
            
            // Send chat_id to client first
            const chatIdData = JSON.stringify({
              type: 'chat_id',
              chat_id: currentChatId,
              done: false,
              timestamp: new Date().toISOString()
            });
            controller.enqueue(`data: ${chatIdData}\n\n`);

            // Make request to backend streaming endpoint
            const streamUrl = new URL(`${backendUrl}/chat/stream`);
            streamUrl.searchParams.set('chat_id', currentChatId.toString());
            streamUrl.searchParams.set('message_content', message);

            const streamResponse = await fetch(streamUrl.toString(), {
              method: 'POST',
              headers: {
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache',
              },
            });

            if (!streamResponse.ok) {
              throw new Error(`Stream request failed: ${streamResponse.status} ${streamResponse.statusText}`);
            }

            const reader = streamResponse.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
              throw new Error('No reader available from backend stream');
            }

            while (true) {
              const { done, value } = await reader.read();
              
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const eventData = line.slice(6);
                  
                  if (eventData === '[END]') {
                    // Send completion signal
                    const doneData = JSON.stringify({ 
                      type: 'token',
                      token: '',
                      done: true,
                      timestamp: new Date().toISOString()
                    });
                    controller.enqueue(`data: ${doneData}\n\n`);
                    return;
                  } else if (eventData !== 'streaming') {
                    // Forward the token from backend
                    const tokenData = JSON.stringify({
                      type: 'token',
                      token: eventData,
                      done: false,
                      timestamp: new Date().toISOString()
                    });
                    controller.enqueue(`data: ${tokenData}\n\n`);
                  }
                } else if (line.startsWith('event: ')) {
                  // Handle event lines (start, done, etc.)
                  const event = line.slice(7);
                  if (event === 'done') {
                    const doneData = JSON.stringify({ 
                      type: 'token',
                      token: '',
                      done: true,
                      timestamp: new Date().toISOString()
                    });
                    controller.enqueue(`data: ${doneData}\n\n`);
                    return;
                  }
                }
              }
            }
          } catch (error) {
            console.error('Backend streaming error:', error);
            
            // Send error to client
            const errorData = JSON.stringify({
              type: 'error',
              error: error instanceof Error ? error.message : 'Unknown streaming error',
              done: true,
              timestamp: new Date().toISOString()
            });
            controller.enqueue(`data: ${errorData}\n\n`);
          } finally {
            controller.close();
          }
        };

        streamFromBackend();
      }
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
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
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
