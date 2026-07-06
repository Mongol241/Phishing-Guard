from pydantic import BaseModel
from typing import List, Optional

class EmailPayload(BaseModel):
    subject: str
    sender: str
    body: str

class MeetingPayload(BaseModel):
    title: str
    start_time: str
    end_time: str
    attendees: List[str]

class CICDPayload(BaseModel):
    repo: str
    workflow_id: str
    ref: str = "main"

class TestPayload(BaseModel):
    suite: str = "all"

class ActionData(BaseModel):
    action: str
    payload: dict  # We'll parse this dynamically in the endpoint or let FastAPI handle it

