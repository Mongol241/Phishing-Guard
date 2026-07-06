# AI-Powered Email Agent & Automation Assistant

This repository houses a local-first AI agent ecosystem that pairs a **Chrome Extension (Manifest v3)** for Gmail with a robust **FastAPI backend**. Powered by the Gemini API, the system automatically analyzes email content, surfaces phishing alerts, highlights priorities, drafts contextual replies, and routes actionable tasks to a secure, multi-agent skill execution engine.

---

## 🚀 Key Features

*   **Intelligent Email Overlay:** Injects phishing indicators, high-priority badges, and AI-generated smart reply UI components directly into the Gmail web interface.
*   **Multi-Agent Skill Architecture:** Pluggable execution framework supporting specific workflows via isolated skill subroutines (`CI/CD`, `Test Runner`, `Secretary/Scheduling`, and `Email Processing`).
*   **Zero-Trust Security Gatekeeper:** Every incoming action request is intercepted by a dedicated `security_agent` and evaluated against a `PermissionManager` whitelist and static pattern heuristics before execution.
*   **Automated Workspace Setup:** Single-command PowerShell orchestrator script (`run_all.ps1`) initializes virtual environments, installs Python dependencies, spins up the backend, and boots an isolated Chrome debugging profile preconfigured with the extension.

---

## 📂 Repository Structure

The core codebase is separated cleanly into frontend extension components, backend application logic, and declarative agent metadata.

```text
├── .agents/                 # Copilot skill definitions and metadata (SKILL.md)
├── project/                 # FastAPI Backend & System Logic
│   ├── alembic/             # Database migration environments
│   ├── models/              # SQLAlchemy data models (e.g., Task)
│   ├── skills/              # Executable mock agent subroutines
│   ├── utils/               # Permission engines and validation helpers
│   ├── app.py               # Main FastAPI server entry point
│   ├── config.py            # Pydantic environment configuration settings
│   └── requirements.txt     # Python ecosystem dependencies
├── background.js            # Service worker proxying extension requests
├── content_script.js        # DOM manipulator injecting UI and alerts into Gmail
├── manifest.json            # Manifest v3 definition for the Chrome Extension
├── popup.html               # Standard extension action dropdown UI
└── run_all.ps1              # Automation script for local system initialization
# AI-Powered Email Agent & Automation Assistant

This repository houses a local-first AI agent ecosystem that pairs a **Chrome Extension (Manifest v3)** for Gmail with a robust **FastAPI backend**. Powered by the Gemini API, the system automatically analyzes email content, surfaces phishing alerts, highlights priorities, drafts contextual replies, and routes actionable tasks to a secure, multi-agent skill execution engine.

---

## 🚀 Key Features

*   **Intelligent Email Overlay:** Injects phishing indicators, high-priority badges, and AI-generated smart reply UI components directly into the Gmail web interface.
*   **Multi-Agent Skill Architecture:** Pluggable execution framework supporting specific workflows via isolated skill subroutines (`CI/CD`, `Test Runner`, `Secretary/Scheduling`, and `Email Processing`).
*   **Zero-Trust Security Gatekeeper:** Every incoming action request is intercepted by a dedicated `security_agent` and evaluated against a `PermissionManager` whitelist and static pattern heuristics before execution.
*   **Automated Workspace Setup:** Single-command PowerShell orchestrator script (`run_all.ps1`) initializes virtual environments, installs Python dependencies, spins up the backend, and boots an isolated Chrome debugging profile preconfigured with the extension.

---

## 📂 Repository Structure

The core codebase is separated cleanly into frontend extension components, backend application logic, and declarative agent metadata.

```text
├── .agents/                 # Copilot skill definitions and metadata (SKILL.md)
├── project/                 # FastAPI Backend & System Logic
│   ├── alembic/             # Database migration environments
│   ├── models/              # SQLAlchemy data models (e.g., Task)
│   ├── skills/              # Executable mock agent subroutines
│   ├── utils/               # Permission engines and validation helpers
│   ├── app.py               # Main FastAPI server entry point
│   ├── config.py            # Pydantic environment configuration settings
│   └── requirements.txt     # Python ecosystem dependencies
├── background.js            # Service worker proxying extension requests
├── content_script.js        # DOM manipulator injecting UI and alerts into Gmail
├── manifest.json            # Manifest v3 definition for the Chrome Extension
├── popup.html               # Standard extension action dropdown UI
└── run_all.ps1              # Automation script for local system initialization
```

## 🛠️ Environment Configuration

Before running the application, clone the example environment template and populate it with your specific operational credentials.

```bash
cp .env.example project/.env
```

| Environment Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Authentication key providing access to the generative AI models. |
| `GITHUB_PAT` | Personal Access Token used by the CI/CD agent for repo interactions. |
| `EMAIL_USER` | Target email address credential used by the local processing node. |
| `EMAIL_PASS` | Application-specific password allowing secure IMAP/SMTP access. |

---

## ⚡ Quick Start

### The Automated Way (Windows/PowerShell)
The root directory includes a helper script that automates Python virtual environment provisioning, backend execution, and Chrome extension attachment:

```powershell
./run_all.ps1
```

### The Manual Way

#### 1. Spin up the FastAPI Backend
```bash
cd project
python -m venv venv
source venv/bin/activate  # On Windows use: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload
```
The local server will instantiate an isolated SQLite database (`db.sqlite`), apply migrations, and host endpoints at `http://127.0.0.1:8000`.

#### 2. Load the Extension in Chrome
1. Navigate to `chrome://extensions/` in your browser.
2. Toggle **Developer mode** on in the upper-right corner.
3. Click **Load unpacked** in the upper-left corner.
4. Select the root folder of this repository (the directory containing `manifest.json`).

---

## 🛡️ Core API Architecture

The FastAPI app exposes specific endpoints handling both analysis and downstream task execution:

### 1. `POST /api/analyze_email`
*   **Payload:** Contains raw email headers, body strings, and subject text.
*   **Behavior:** Pipes contents safely to the Gemini LLM. It computes heuristic indicators using a localized `phishing_detector.pkl` serialization model to return status flags, severity arrays, and contextual response payloads.

### 2. `POST /api/execute_skill`
*   **Payload:** Dictates target skill execution routing variables (e.g., scheduling details, repository trigger paths).
*   **Behavior:** Directs requests to the `security_agent.py` firewall layer. If the payload avoids suspicious action blocks and passes the `PermissionManager` criteria, it maps directly to corresponding tasks within the `skills/` directory.

---

> **Security Warning:** The local AI execution architecture processes context parsed straight out of active browser DOM structures. Ensure that any manual overrides inside `utils/permissions.py` explicitly whitelist only known safe URLs and verified external development actions.
