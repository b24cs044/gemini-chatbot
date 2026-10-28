# Gemini Chatbot (StudyBuddy)

A web-based, multi-turn chatbot built with Node.js, Express and the Google Gemini API. The assistant, StudyBuddy, is an AI tutor that explains concepts in simple language. The server keeps a separate conversation history for each chat session and limits how much of that history is sent to the model on every request.

## Features

- Real Gemini API integration through the `@google/genai` SDK
- Multi-turn conversations with server-side memory
- Separate memory for each conversation, identified by a conversation ID
- Context-window management: only the most recent messages are sent to the model
- Custom system prompt that defines the StudyBuddy tutor persona
- Browser chat interface in plain HTML, CSS and JavaScript
- Replies rendered as Markdown (lists, code blocks, tables), sanitized before display
- Loading indicator and friendly error messages for API and network failures
- API key kept on the server in `.env`, never sent to the browser

## Tech Stack

- Node.js (ES modules)
- Express 5
- Google Gemini API (`@google/genai`)
- dotenv
- Vanilla HTML, CSS and JavaScript
- marked and DOMPurify (bundled in `public/vendor/`) for safe Markdown rendering

## Project Structure

```text
gemini-chatbot/
  public/
    index.html
    style.css
    script.js
    vendor/
      marked.min.js
      purify.min.js
  server.js
  package.json
  package-lock.json
  .env            (not committed)
  .gitignore
  README.md
```

## Setup

1. Install Node.js 18 or later.
2. Clone the repository and install dependencies:

   ```bash
   git clone <your-repository-url>
   cd gemini-chatbot
   npm install
   ```

3. Get a Gemini API key from Google AI Studio.
4. Create a file named `.env` in the project root:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

   Make sure `.env` is listed in `.gitignore` so the key is never committed.

## Running the App

```bash
node server.js
```

Open http://localhost:3000 in a browser.

## How Conversation Memory Works

The browser generates one conversation ID when the page loads and sends it with every message. The server stores conversations in an in-memory `Map`, keyed by that ID. Each entry is a list of messages in the Gemini format (`role` of `user` or `model`, plus the text). Each new user message and each model reply is appended to the list for its conversation, so different IDs never share history.

Because the storage is in memory, conversations are lost when the server restarts or when the page is reloaded (a reload creates a new ID).

If a Gemini request fails, the unanswered user message is removed from history so the stored conversation stays consistent and the user can retry.

## How Context Management Works

The full history for a conversation is kept on the server, but only the most recent messages are sent to Gemini:

```js
const MAX_HISTORY_MESSAGES = 10;
const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);
```

If the slice would begin with a model message, that message is dropped so the request always starts with a user message. This limit is based on message count, not tokens. Information older than the window is no longer visible to the model.

## API

### POST /api/chat

Request body:

```json
{
  "conversationId": "9b5eb198-68ff-4a9c-9f44-b6489d4fd675",
  "message": "What is a Python decorator?"
}
```

Success response (200):

```json
{
  "reply": "A decorator is a function that wraps another function..."
}
```

Error responses:

| Status | Meaning |
|---|---|
| 400 | `conversationId` or `message` is missing or empty |
| 502 | Gemini returned no text for the request |
| 503 | Gemini is temporarily unavailable due to high demand |
| 500 | Any other failure while generating a response |

Every error response has the form `{ "error": "message" }`.

## Future Improvements

- Persist conversations in a database so they survive restarts
- Count tokens instead of messages, or summarize older messages
- Stream replies as they are generated
- Syntax highlighting and a copy button for code blocks
- Math rendering for formulas
- A button to start a new conversation