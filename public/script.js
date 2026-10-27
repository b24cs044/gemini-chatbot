// StudyBuddy frontend. Talks only to POST /api/chat on the same server.
// Conversation memory and context-window management live on the backend.

const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

const API_URL = "/api/chat";

// One ID for this page session. Sent with every message so the backend
// keeps using the same conversation history. A page reload starts a new one.
const conversationId = createConversationId();

let isWaiting = false;

function createConversationId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return "conv-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
}

// Open links from model replies in a new tab.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

// Convert the model's Markdown to HTML, then sanitize it so a reply can
// never inject scripts or unsafe markup into the page.
function renderMarkdown(text) {
  const rawHtml = marked.parse(text, { gfm: true, breaks: true });
  return DOMPurify.sanitize(rawHtml);
}

// Build a message element. User text and errors use textContent. Only
// StudyBuddy replies (type "bot") are rendered as sanitized Markdown.
function createMessageElement(type, author, text) {
  const wrapper = document.createElement("div");
  wrapper.className = "message " + type;

  const authorEl = document.createElement("div");
  authorEl.className = "message-author";
  authorEl.textContent = author;

  const textEl = document.createElement("div");
  textEl.className = "message-text";

  if (type === "bot") {
    textEl.classList.add("markdown");
    textEl.innerHTML = renderMarkdown(text);
  } else {
    textEl.textContent = text;
  }

  wrapper.append(authorEl, textEl);
  return wrapper;
}

function addMessage(type, author, text) {
  const element = createMessageElement(type, author, text);
  chatWindow.appendChild(element);
  scrollToBottom();
  return element;
}

function showLoadingIndicator() {
  const element = createMessageElement("bot loading", "StudyBuddy", "");
  const textEl = element.querySelector(".message-text");
  textEl.textContent = "StudyBuddy is thinking";

  const dots = document.createElement("span");
  dots.className = "dots";
  dots.innerHTML = "<span></span><span></span><span></span>";
  textEl.appendChild(dots);

  chatWindow.appendChild(element);
  scrollToBottom();
  return element;
}

function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function setWaiting(waiting) {
  isWaiting = waiting;
  sendButton.disabled = waiting;
  userInput.disabled = waiting;
  if (!waiting) {
    userInput.focus();
  }
}

// Grow the textarea with its content, up to the max-height set in CSS.
function resizeInput() {
  userInput.style.height = "auto";
  userInput.style.height = userInput.scrollHeight + "px";
}

// Turn a failed HTTP response into a message that is safe to show.
function messageForFailure(status, serverMessage) {
  if (serverMessage) {
    return serverMessage;
  }
  if (status === 400) {
    return "The message could not be processed. Please try again.";
  }
  if (status === 503) {
    return "StudyBuddy is temporarily unavailable due to high demand. Please try again.";
  }
  return "Something went wrong while generating a response. Please try again.";
}

async function sendMessage(message) {
  addMessage("user", "You", message);
  setWaiting(true);
  const loadingElement = showLoadingIndicator();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, message })
    });

    // The server may return non-JSON on unexpected failures.
    let data = null;
    try {
      data = await response.json();
    } catch (parseError) {
      data = null;
    }

    loadingElement.remove();

    if (!response.ok) {
      addMessage("error", "StudyBuddy", messageForFailure(response.status, data && data.error));
      return;
    }

    if (!data || typeof data.reply !== "string" || data.reply.trim() === "") {
      addMessage("error", "StudyBuddy", "StudyBuddy returned an empty response. Please try again.");
      return;
    }

    addMessage("bot", "StudyBuddy", data.reply);
  } catch (networkError) {
    loadingElement.remove();
    addMessage(
      "error",
      "StudyBuddy",
      "Unable to connect to the server. Please check that the backend is running and try again."
    );
  } finally {
    setWaiting(false);
  }
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = userInput.value.trim();
  if (!message || isWaiting) {
    return;
  }

  userInput.value = "";
  resizeInput();
  sendMessage(message);
});

// Enter sends, Shift+Enter adds a new line.
userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

userInput.addEventListener("input", resizeInput);

userInput.focus();