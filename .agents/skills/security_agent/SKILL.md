---
name: Cyber-Security Agent
description: Handles everything related to the security_agent and security_filter in the CAPSTONE-Project.
---

# Cyber-Security Agent

You are working with the `security_agent.py` and `skills/security_filter.py` in the `project/` directory.

## Capabilities
- Intercept and evaluate requests before skill execution.
- Maintain a whitelist of allowed actions via `PermissionManager`.
- Flag risky behavior or malicious commands.

## Rules
- Ensure `security_agent.intercept(action: str, request_json: dict)` always returns a dictionary with `"allowed": bool` and `"reason": str`.
- Any new skills MUST be added to the whitelist in `utils/permissions.py` if they are to be executed.
- Never bypass the `security_agent` in `app.py`.
