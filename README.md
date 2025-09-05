# AI Chatbot

A simple, modern chatbot interface built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎨 Clean, modern UI with dark mode support
- 💬 Real-time chat interface with **streaming responses**
- 🔄 **Server-Sent Events (SSE)** for token-by-token streaming
- 📱 Responsive design (mobile-friendly)
- ⌨️ Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- 🔄 Message history display
- ⏳ Loading indicators and typing indicators for streaming responses
- 💫 Real-time cursor animation during streaming

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the chatbot.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts    # SSE streaming API endpoint
│   ├── globals.css         # Global styles and Tailwind configuration
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Main chatbot interface with streaming logic
```

## Technologies Used

- **Next.js 15** - React framework with App Router and API routes
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management (useState, useEffect, useRef)
- **Server-Sent Events (SSE)** - Real-time streaming communication
- **ReadableStream API** - For handling streaming responses

## Usage

1. Type your message in the input field at the bottom
2. Press Enter or click "Send" to send your message
3. Watch as the bot response streams in **token by token** in real-time
4. Use Shift+Enter to add line breaks in your message
5. The interface automatically scrolls to show new messages
6. A typing cursor and "Typing..." indicator show during streaming

## Customization

### Adding Real AI Integration

The chatbot is already set up for streaming! To connect to a real AI service, modify the API route in `src/app/api/chat/route.ts`:

**For OpenAI GPT:**
```typescript
// Replace the simulation in route.ts with:
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: message }],
  stream: true,
});

for await (const chunk of response) {
  const content = chunk.choices[0]?.delta?.content || '';
  if (content) {
    const data = JSON.stringify({ token: content, done: false });
    controller.enqueue(`data: ${data}\n\n`);
  }
}
```

**For Anthropic Claude:**
```typescript
// Use Anthropic's streaming API
const stream = anthropic.messages.stream({
  model: 'claude-3-sonnet-20240229',
  max_tokens: 1000,
  messages: [{ role: 'user', content: message }]
});

stream.on('text', (text) => {
  const data = JSON.stringify({ token: text, done: false });
  controller.enqueue(`data: ${data}\n\n`);
});
```

The frontend is already configured to handle streaming from any backend!

### Styling

The interface uses Tailwind CSS and automatically adapts to light/dark mode based on system preferences. Customize colors and layout by modifying the classes in `page.tsx`.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Browser Support

This chatbot works in all modern browsers and automatically adapts to different screen sizes.