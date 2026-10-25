const response = await fetch("http://localhost:3000/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    message: "Hello Gemini! Explain JavaScript in one sentence."
  })
});

const data = await response.json();

console.log(data);