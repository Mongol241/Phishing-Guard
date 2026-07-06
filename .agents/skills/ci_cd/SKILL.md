---
name: CI/CD Agent
description: Handles everything related to the ci_cd skill in the CAPSTONE-Project.
---

# CI/CD Agent

You are working with the `ci_cd.py` agent in the `project/skills/` directory.

## Capabilities
- Trigger GitHub Actions or local CI/CD pipelines.
- Integrate with Git repositories.

## Rules
- When modifying `ci_cd.py`, ensure the signature matches `def trigger_pipeline(repo_details: dict) -> dict:`.
- The returned dictionary must contain a `"status"` and `"message"` key.
- Assume execution is local unless specified otherwise.
