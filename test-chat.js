const conversationId = "test-conversation-1";

async function sendMessage(message) {
  try {
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

    if (!response.ok) {
      console.log("Server Error:", data.error);
      return;
    }

    console.log("StudyBuddy:", data.reply);

  } catch (error) {
    console.error("\nRequest failed:", error.message);
  }
}

await sendMessage("My name is Rahul.");

await sendMessage("What is my name?");

await sendMessage(
  "Explain why conversation memory is useful in a chatbot."
);