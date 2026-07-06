---
name: Email Processor Agent
description: Handles everything related to the email_processor skill in the CAPSTONE-Project.
---

# Email Processor Agent

You are working with the `email_processor.py` agent in the `project/skills/` directory.

## Capabilities
- Analyze incoming emails.
- Detect priority levels.
- Prepare or mock processing logic for email triage.

## Rules
- When modifying `email_processor.py`, ensure the signature matches `def process_email(email_data: dict) -> dict:`.
- The returned dictionary must contain a `"status"` and `"message"` key.
- Never directly execute shell commands here. Leave security considerations to the `security_agent`.
