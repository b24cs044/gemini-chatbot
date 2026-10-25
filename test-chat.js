const conversationId = "test-conversation-1";

async function sendMessage(message) {
  const response = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      conversationId,
      message
    })
  });

  const data = await response.json();

  console.log("\nUser:", message);
  console.log("StudyBuddy:", data.reply);
}

await sendMessage("My name is Rahul.");

await sendMessage("What is my name?");

await sendMessage("Can you explain why remembering information across messages is useful in a chatbot?");