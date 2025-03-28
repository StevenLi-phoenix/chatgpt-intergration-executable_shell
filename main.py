import fastapi
import uvicorn
import subprocess
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import logging
from dotenv import load_dotenv

logging.basicConfig(level=logging.DEBUG, filename="command.log", format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

if os.path.exists(".env"):
    load_dotenv()
    secret_key = os.getenv("SECRET_KEY")
else:
    secret_key = str(uuid.uuid4()).replace("-", "")[:12] # save only first 12 characters of the uuid
    with open(".env", "w") as f:
        f.write(f"SECRET_KEY={secret_key}")

logger.info(f"Secret key: {secret_key}")

app = fastapi.FastAPI()

# Allow requests from the ChatGPT domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://chatgpt.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Success"}

@app.post("/run/")
async def run(request: fastapi.Request):
    secret = request.headers["X-API-Key"]
    if secret != secret_key:
        logger.error(f"Authentication failed: Invalid API key {secret}")
        logger.error(f"Expected key: {secret_key}")
        raise fastapi.HTTPException(status_code=401, detail="Unauthorized")

    body = await request.json()
    code = body["code"]
    results = []

    for line in code.strip().split("\n"):
        try:
            logger.info(f"Running command: {line}")
            output = subprocess.run(line, capture_output=True, text=True, shell=True, cwd=os.path.expanduser('~'))
            logger.info(f"Command output: {output.stdout or output.stderr}")
            results.append(output.stdout or output.stderr)
        except Exception as e:
            logger.error(f"Command execution failed: {str(e)}")
            results.append(str(e))

    return "\n".join(results)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8080)
