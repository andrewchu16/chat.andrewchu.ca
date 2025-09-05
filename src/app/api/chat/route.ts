import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      start(controller) {
        // Simulate streaming response (replace this with your actual AI API call)
        const simulateStreaming = async () => {
          // Example response that will be streamed token by token
          const response = `I received your message: "${message}". This is a streaming response that demonstrates how tokens are sent one by one. Each word appears as it's "generated" by the AI model. You can replace this logic with calls to OpenAI, Anthropic, or any other AI service that supports streaming.`;
          
          const tokens = response.split(' ');
          
          for (let i = 0; i < tokens.length; i++) {
            const token = i === 0 ? tokens[i] : ' ' + tokens[i];
            
            // Send the token as SSE data
            const data = JSON.stringify({ 
              token,
              done: false,
              timestamp: new Date().toISOString()
            });
            
            controller.enqueue(`data: ${data}\n\n`);
            
            // Simulate network delay between tokens
            await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
          }
          
          // Send completion signal
          const doneData = JSON.stringify({ 
            token: '',
            done: true,
            timestamp: new Date().toISOString()
          });
          controller.enqueue(`data: ${doneData}\n\n`);
          
          controller.close();
        };

        simulateStreaming().catch(error => {
          console.error('Streaming error:', error);
          controller.error(error);
        });
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
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
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
