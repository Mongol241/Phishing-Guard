// background.js - handles communication between the extension UI/Content Scripts and the local FastAPI server

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "apiRequest") {
    fetch(`http://127.0.0.1:8000/${request.endpoint}`, {
      method: request.method || "GET",
      headers: { "Content-Type": "application/json" },
      body: request.body ? JSON.stringify(request.body) : null,
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.detail || 'API Error'); });
        }
        return res.json();
      })
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Indicates asynchronous response
  }
});
