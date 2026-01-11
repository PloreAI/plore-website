# Plore

A clean, ChatGPT-style AI chat interface powered by OpenRouter.

## Features

- 🎨 **ChatGPT-like UI** - Clean, professional dark theme with solid colors
- 💬 **Conversation History** - Save and load your chats
- 🔄 **Configurable AI Models** - Set via environment variables
- ⚡ **Fast & Responsive** - Built with Next.js 16
- 🎯 **Simple Setup** - Just add your API key

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Your `.env` file is already set up with:

```bash
NEXT_PUBLIC_OPENROUTER_API_KEY="your-api-key"
NEXT_PUBLIC_OPENROUTER_MODEL="openai/gpt-3.5-turbo"
```

Get your API key from [OpenRouter.ai](https://openrouter.ai/keys)

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Models

You can use any model from OpenRouter by changing `NEXT_PUBLIC_OPENROUTER_MODEL`:

- `openai/gpt-3.5-turbo` (Default, Fast & Affordable)
- `openai/gpt-4` (Most Capable)
- `openai/gpt-4-turbo` (Fast GPT-4)
- `anthropic/claude-3-sonnet` (Balanced)
- `anthropic/claude-3-opus` (Most Capable Claude)
- `mistralai/mistral-7b-instruct` (Fast & Open)
- `google/gemini-pro` (Google's Model)
- `meta-llama/llama-3-70b-instruct` (Open Source)

## Project Structure

```
plore/
├── app/
│   ├── page.tsx           # Main chat interface
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── .env                   # Your environment variables
├── package.json
└── README.md
```

## Usage

### Start a New Chat

Click the "New chat" button in the sidebar or just start typing.

### View Chat History

Your conversations are automatically saved in the sidebar. Click any conversation to load it.

### Change Models

Update `NEXT_PUBLIC_OPENROUTER_MODEL` in your `.env` file and restart the server:

```bash
# Stop the server (Ctrl+C)
# Edit .env
npm run dev
```

## Keyboard Shortcuts

- `Enter` - Send message
- `Shift + Enter` - New line in message

## Design

- **No Gradients** - Clean solid colors only
- **Dark Theme** - Easy on the eyes
- **ChatGPT Style** - Familiar, professional interface
- Colors: `#343541` (main), `#202123` (sidebar), `#444654` (assistant messages)

## Troubleshooting

### "Please set NEXT_PUBLIC_OPENROUTER_API_KEY" Error

Make sure your `.env` file has a valid API key. After updating, restart the server.

### Messages Not Sending

1. Check your API key is valid at [OpenRouter.ai](https://openrouter.ai)
2. Verify you have credits in your account
3. Check the browser console for errors (F12)

## Building for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **OpenRouter API** - AI model access

## License

MIT

---

**Plore - Clean AI conversations**