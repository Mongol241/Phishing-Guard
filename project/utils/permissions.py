import json
import os
from pathlib import Path
from datetime import datetime

class PermissionManager:
    def __init__(self):
        self.log_file = Path(__file__).parent.parent / "security_log.txt"
        self.allowed_actions = {
            "analyze_email", "fetch_tasks", "run_tests", "trigger_cicd", "visualize_data"
        }

    def log_action(self, action: str, details: dict, status: str):
        with open(self.log_file, "a") as f:
            log_entry = {
                "timestamp": datetime.now().isoformat(),
                "action": action,
                "details": details,
                "status": status
            }
            f.write(json.dumps(log_entry) + "\n")

    def is_action_allowed(self, action: str) -> bool:
        return action in self.allowed_actions

def load_model():
    model_path = Path(__file__).parent.parent / "models" / "phishing_detector.pkl"
    if model_path.exists():
        return lambda text: {"risk": "low", "score": 0.1}
    else:
        return lambda text: {"risk": "unknown", "score": 0.0}

_model = load_model()
permission_manager = PermissionManager()

def evaluate_request(action: str, request_json: dict) -> dict:
    if not permission_manager.is_action_allowed(action):
        permission_manager.log_action(action, request_json, "rejected_whitelist")
        return {"allowed": False, "reason": f"Action '{action}' is not in the whitelist."}

    suspicious_keywords = ["rm -rf", "wget", "curl", "chmod", "sudo", "ssh", "scp"]
    payload = json.dumps(request_json).lower()
    if any(word in payload for word in suspicious_keywords):
        permission_manager.log_action(action, request_json, "rejected_suspicious")
        return {"allowed": False, "reason": "Detected potentially dangerous command patterns."}

    email_content = request_json.get("email_content", "")
    if email_content:
        ml_result = _model(email_content)
        if ml_result["score"] > 0.7:
            permission_manager.log_action(action, request_json, "rejected_phishing")
            return {"allowed": False, "reason": f"ML detector flagged high phishing risk (score {ml_result['score']})."}

    permission_manager.log_action(action, request_json, "allowed")
    return {"allowed": True, "reason": "No issues detected."}
