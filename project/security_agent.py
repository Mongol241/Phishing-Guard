from utils.permissions import evaluate_request
import logging

class SecurityAgent:
    """Cyber-Security Agent that intercepts skill executions."""

    def __init__(self):
        self.logger = logging.getLogger("SecurityAgent")

    def intercept(self, action: str, request_json: dict) -> dict:
        """
        Intercepts the request, evaluates it against the PermissionManager
        and returns allow/reject + rationale.
        """
        self.logger.info(f"Intercepting action '{action}' with data: {request_json}")
        
        result = evaluate_request(action, request_json)
        
        if not result["allowed"]:
            self.logger.warning(f"Action '{action}' REJECTED. Reason: {result['reason']}")
            # In a real system, you might notify the UI or prompt for override here
        else:
            self.logger.info(f"Action '{action}' ALLOWED.")
            
        return result

security_agent = SecurityAgent()
