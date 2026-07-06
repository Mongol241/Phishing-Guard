---
name: Test Runner Agent
description: Handles everything related to the test_runner skill in the CAPSTONE-Project.
---

# Test Runner Agent

You are working with the `test_runner.py` agent in the `project/skills/` directory.

## Capabilities
- Run local unit tests (e.g. pytest).
- Report test results and metrics.

## Rules
- When modifying `test_runner.py`, ensure the signature matches `def run_tests(test_details: dict) -> dict:`.
- The returned dictionary must contain a `"status"` and `"message"` key.
