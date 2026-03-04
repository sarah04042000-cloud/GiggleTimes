from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "GiggleTimes Kids Audio Story API is running 🚀",
        "docs": "/docs"
    }