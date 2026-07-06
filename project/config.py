from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import os

class Settings(BaseSettings):
    # API Keys
    GEMINI_API_KEY: str = Field(default="your_api_key_here")
    GITHUB_PAT: str = Field(default="")
    
    # Email Integration
    EMAIL_USER: str = Field(default="")
    EMAIL_PASS: str = Field(default="")
    
    # DB
    DATABASE_URL: str = Field(default="sqlite:///./db.sqlite")

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
