# AI Agent Overlay & Skills Implementation Plan (Local‑Only Version)

## Goal Description
Create a **Chrome extension** that overlays any web page, showing a preview of all tasks performed by the AI agent and allowing the user to revise them. Implement a suite of agent **skills** for corporate email handling, Excel‑based statistics visualisation, meeting management, CI/CD pipeline triggering, test execution, and email security. All components will run **locally** on the developer’s machine; no cloud hosting is required.

## User Review Required
> [!IMPORTANT]
> The solution will run entirely on `localhost`. The Chrome extension must communicate with a local FastAPI server over `http://127.0.0.1:<port>` (HTTPS is not required for localhost, but the extension will need the `http://127.0.0.1/*` permission in `manifest.json`). Ensure the user is comfortable keeping the server running while using the extension.

> [!WARNING]
> A new **Cyber‑Security Agent** will inspect every command/action the AI attempts before it is executed. This adds a safety layer but may introduce latency; verify the user accepts this trade‑off.

## Open Questions
- Which port would you like the FastAPI server to listen on (default `8000`)?
- Do you have any preferred OS‑level firewall settings to restrict the local server to loop‑back only?

## Proposed Changes (Local‑Only)
---
### Frontend – Chrome Extension (unchanged).
- `manifest.json`, `background.js`, `content_script.js`, `popup.html`, `styles.css`, `overlay.html` – same files as before, but the `permissions` field now includes `http://127.0.0.1/*`.

---
### Backend – Python FastAPI (localhost only)
- **[NEW] app.py** – FastAPI entry point listening on `127.0.0.1`.
- **[NEW] requirements.txt** – FastAPI, uvicorn, pandas, openpyxl, google‑api‑python‑client, PyGithub, scikit‑learn, etc.
- **[NEW] Dockerfile** – optional for reproducible local container.
- **[NEW] utils/** – shared utilities, **`permissions.py`** now also hosts the **Cyber‑Security Agent** logic.
- **[NEW] models/phishing_detector.pkl** – placeholder for custom ML model (trained locally).

---
### Skill Modules (same as before, now served locally)
- `skills/email_processor.py`
- `skills/secretary.py`
- `skills/ci_cd.py`
- `skills/test_runner.py`
- `skills/security_filter.py`

---
### New Cyber‑Security Agent
- **[NEW] security_agent.py** – module that runs before any skill execution.
  - Scans incoming requests for risky patterns (e.g., shell commands, SQL injection strings).
  - Uses a combination of rule‑based signatures and the custom ML phishing detector.
  - Returns **`allow`** or **`reject`** plus a rationale.
  - The frontend overlay will display a modal asking the user to confirm any **`reject`** actions.

---
### 3‑D Visualization (unchanged)
- Use **Chart.js with 3D plugin** as selected.

---
### CI/CD Integration (local only)
- The `ci_cd` skill triggers GitHub Actions **via the GitHub API** using a personal access token stored locally (in a `.env` file, never committed).
- No external CI runners are required; the skill simply creates a workflow file and pushes it to the repo, letting GitHub run it.

---
### Persistence & Storage
- **SQLite (`db.sqlite`)** remains the sole database for revision history, flagged items, and user preferences. It lives in the project root and requires no external service.

---
### Security & Permission Protocols (enhanced)
- Central **`PermissionManager`** (in `utils/permissions.py`) enforces a whitelist of allowed actions.
- The **Cyber‑Security Agent** intercepts every request; high‑risk actions (sending email, modifying calendar, executing shell commands) are presented to the user in the overlay for manual approval.
- All overridden permissions are logged to `security_log.txt` and displayed in a “Review Queue” tab of the extension.

---
### Testing & Validation (local)
- `tests/` with `pytest` covering each skill.
- CI pipeline (GitHub Actions) runs locally‑focused tests; no external services needed.

## Verification Plan
### Automated Tests
- Run `pytest` locally to ensure each endpoint returns the expected JSON.
- Use `curl http://127.0.0.1:8000/...` to hit each API endpoint and verify responses.

### Manual Verification
1. **Start the server**: `uvicorn app:app --host 127.0.0.1 --port 8000`.
2. **Load the Chrome extension** (Developer mode → Load unpacked).
3. Open any webpage, verify the overlay appears with a simulated task list.
4. Upload a sample Excel file via the UI; confirm a 3‑D chart renders.
5. Schedule a meeting; check Google Calendar for the event.
6. Trigger a GitHub Actions workflow; view the run on GitHub.
7. Send a test email containing phishing patterns; the security filter should flag it and require user confirmation before proceeding.

---
*End of revised implementation plan.*
