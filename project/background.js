// background.js - handles communication between the extension UI and the local FastAPI server

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "apiRequest") {
    fetch(`http://127.0.0.1:8000/${request.endpoint}`, {
      method: request.method || "GET",
      headers: { "Content-Type": "application/json" },
      body: request.body ? JSON.stringify(request.body) : null,
    })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});
