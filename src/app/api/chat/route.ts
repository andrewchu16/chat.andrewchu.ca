import { NextRequest } from 'next/server';

interface ChatCreateResponse {
  id: number;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, includeProcessingInfo = true } = await request.json();
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
            streamUrl.searchParams.set('include_processing_info', includeProcessingInfo.toString());

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

            let currentEvent = '';
            let lastMessageId = '';
            
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('event: ')) {
                  // Store the current event type
                  currentEvent = line.slice(7).trim();
                } else if (line.startsWith('data: ')) {
                  const eventData = line.slice(6);
                  
                  try {
                    const parsedData = JSON.parse(eventData);
                    
                    if (currentEvent === 'start') {
                      // Handle start event - just log for now
                      console.log('Stream started:', parsedData);
                      
                    } else if (currentEvent === 'message_created') {
                      // Store message_id and forward processing event
                      lastMessageId = parsedData.message_id;
                      const processingData = JSON.stringify({
                        type: 'processing_event',
                        event: 'message_created',
                        data: parsedData,
                        timestamp: new Date().toISOString()
                      });
                      controller.enqueue(`data: ${processingData}\n\n`);
                      
                    } else if (currentEvent === 'processing_started') {
                      const processingData = JSON.stringify({
                        type: 'processing_event',
                        event: 'processing_started',
                        data: parsedData,
                        timestamp: new Date().toISOString()
                      });
                      controller.enqueue(`data: ${processingData}\n\n`);
                      
                    } else if (currentEvent === 'first_token') {
                      const processingData = JSON.stringify({
                        type: 'processing_event',
                        event: 'first_token',
                        data: parsedData,
                        timestamp: new Date().toISOString()
                      });
                      controller.enqueue(`data: ${processingData}\n\n`);
                      
                    } else if (currentEvent === 'processing_completed') {
                      const processingData = JSON.stringify({
                        type: 'processing_event',
                        event: 'processing_completed',
                        data: parsedData,
                        timestamp: new Date().toISOString()
                      });
                      controller.enqueue(`data: ${processingData}\n\n`);
                      
                    } else if (currentEvent === 'done') {
                      // Handle completion
                      if (parsedData.content === '[END]') {
                        const doneData = JSON.stringify({ 
                          type: 'token',
                          token: '',
                          done: true,
                          message_id: parsedData.message_id || lastMessageId,
                          timestamp: new Date().toISOString()
                        });
                        controller.enqueue(`data: ${doneData}\n\n`);
                        return;
                      }
                      
                    } else if (currentEvent === '' && parsedData.type === 'token') {
                      // Handle token data (no event, just data)
                      const tokenData = JSON.stringify({
                        type: 'token',
                        token: parsedData.content,
                        done: false,
                        message_id: lastMessageId,
                        timestamp: new Date().toISOString()
                      });
                      controller.enqueue(`data: ${tokenData}\n\n`);
                    }
                    
                  } catch (parseError) {
                    console.warn('Error parsing SSE data:', parseError, 'Raw data:', eventData);
                  }
                  
                  // Reset event after processing data
                  currentEvent = '';
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
