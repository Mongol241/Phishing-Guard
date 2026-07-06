import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import os
import json
import sqlite3

from security_agent import security_agent
from skills import email_processor, secretary, ci_cd, test_runner, security_filter

load_dotenv()

# Configure Gemini
API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY and API_KEY != "your_api_key_here":
    genai.configure(api_key=API_KEY)
else:
    logging.warning("GEMINI_API_KEY is not set or is still the placeholder. LLM features will fail.")

app = FastAPI(title="AI Agent Backend")

# Allow CORS for the extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as exc:
        logging.exception("Unhandled exception")
        return JSONResponse(status_code=500, content={"detail": str(exc)})

class EmailData(BaseModel):
    subject: str
    sender: str
    body: str

@app.post("/api/analyze_email")
async def analyze_email(data: EmailData):
    # Pass through security agent first
    sec_eval = security_agent.intercept("analyze_email", data.dict())
    if not sec_eval["allowed"]:
        return JSONResponse(status_code=403, content={"error": "Security Block", "reason": sec_eval["reason"]})

    if not API_KEY or API_KEY == "your_api_key_here":
        raise HTTPException(status_code=500, detail="Gemini API Key not configured in backend .env")

    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    You are an AI Email Assistant. Analyze the following email and return a JSON object with EXACTLY this structure:
    {{
      "phishing": {{
        "is_threat": boolean,
        "score": integer (0 to 15, where >=5 is a threat),
        "reasons": [ "string reason 1", "string reason 2" ]
      }},
      "priority": {{
        "level": "critical" | "high" | "medium" | "low",
        "reason": "string explaining why"
      }},
      "replies": [
        {{ "label": "emoji + short action (e.g., ✅ Acknowledge)", "text": "Draft email response" }},
        {{ "label": "...", "text": "..." }},
        {{ "label": "...", "text": "..." }}
      ]
    }}

    Email Subject: {data.subject}
    Email Sender: {data.sender}
    Email Body:
    {data.body[:2000]}
    
    CRITICAL INSTRUCTION: Return ONLY valid JSON. Do not include markdown code blocks.
    """

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:]
        if text.endswith('```'):
            text = text[:-3]
            
        return json.loads(text.strip())
    except Exception as e:
        logging.error(f"LLM Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze email with LLM")

class ActionData(BaseModel):
    action: str
    payload: dict

@app.post("/api/execute_skill")
async def execute_skill(data: ActionData):
    sec_eval = security_agent.intercept(data.action, data.payload)
    if not sec_eval["allowed"]:
        return JSONResponse(status_code=403, content={"error": "Security Block", "reason": sec_eval["reason"]})
        
    result = {}
    if data.action == "trigger_cicd":
        result = ci_cd.trigger_pipeline(data.payload)
    elif data.action == "run_tests":
        result = test_runner.run_tests(data.payload)
    elif data.action == "schedule_meeting":
        result = secretary.schedule_meeting(data.payload)
    else:
        raise HTTPException(status_code=404, detail="Skill not found or not supported.")
        
    return result

DB_PATH = os.path.join(os.path.dirname(__file__), "db.sqlite")
if not os.path.exists(DB_PATH):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT)''')
    c.execute('INSERT INTO tasks (title, description) VALUES (?, ?)', ("Sample Task", "This is a demo task"))
    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/tasks")
def list_tasks():
    # Example of security intercept on read (if we want to restrict read access)
    sec_eval = security_agent.intercept("fetch_tasks", {})
    if not sec_eval["allowed"]:
        return JSONResponse(status_code=403, content={"error": "Security Block", "reason": sec_eval["reason"]})

    conn = get_db()
    tasks = conn.execute('SELECT * FROM tasks').fetchall()
    conn.close()
    return {"tasks": [dict(t) for t in tasks]}
