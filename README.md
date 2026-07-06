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
