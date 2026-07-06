# Phishing-Guard

Phishing-Guard is a local-first AI agent project that helps detect phishing-style email content, provide safe reply suggestions, and support local workflow automation.

## What it includes
- A FastAPI backend for analysis endpoints
- A Chrome extension UI overlay
- Local security checks for risky actions
- Environment-based configuration for API keys and tokens

## Setup
1. Create a Python virtual environment.
2. Install dependencies from the project requirements file.
3. Copy .env.example to project/.env and fill in any real values you want to use.
4. Run the backend locally.

## Security note
Do not commit real API keys, tokens, or email credentials. Keep them in environment variables or a local .env file that is ignored by Git.
