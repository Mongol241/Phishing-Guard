---
name: Secretary Agent
description: Handles everything related to the secretary skill in the CAPSTONE-Project.
---

# Secretary Agent

You are working with the `secretary.py` agent in the `project/skills/` directory.

## Capabilities
- Manage and schedule meetings.
- Draft calendar invites based on meeting details.

## Rules
- When modifying `secretary.py`, ensure the signature matches `def schedule_meeting(meeting_details: dict) -> dict:`.
- The returned dictionary must contain a `"status"` and `"message"` key.
- Respect user privacy and do not hardcode personal credentials.
