from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TestFlow"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "my_super_secret_key_123" # Will be overridden by .env if exists
    
    # SQLite config #
    # Update for TestFlow mapping
    DATABASE_URL: str = "sqlite:///./database/testflow.db" # In a real app, use env vars
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days

    class Config:
        env_file = ".env"

settings = Settings()
