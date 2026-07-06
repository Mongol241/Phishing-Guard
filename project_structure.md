# Project Structure (artifact location)

All source files are stored in the agent’s artifact directory, **not** on your Desktop.

```
C:\Users\virla\.gemini\antigravity\brain\fdeceeb3-cc8f-49d7-8aaa-26eddebe2b05\project\
│   app.py               # FastAPI backend (see code below)
│   manifest.json        # Chrome extension manifest
│   background.js        # Extension background service worker
│   content_script.js    # Injected overlay UI
│   popup.html           # Extension popup UI
│   styles.css           # Glass‑morphism CSS
│   requirements.txt     # Python dependencies
│   utils\
│       __init__.py
│       permissions.py   # Cyber‑security agent
│   models\
│       phishing_detector.pkl  # Placeholder model file
└── icons\               # (add your icons here)
```

You can open any file directly, e.g., the backend code:

[app.py](file:///C:/Users/virla/.gemini/antigravity/brain/fdeceeb3-cc8f-49d7-8aaa-26eddebe2b05/project/app.py)

To run the server, execute the command shown below from the `project` directory.
