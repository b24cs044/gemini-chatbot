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

## Future Improvements

- Persist conversations in a database so they survive restarts
- Count tokens instead of messages, or summarize older messages
- Stream replies as they are generated
- Syntax highlighting and a copy button for code blocks
- Math rendering for formulas
- A button to start a new conversation