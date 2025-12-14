from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
from services.video_service import get_video_id, generate_interactive_segments, generate_image_from_prompt
from services.storage_service import save_notebook, list_notebooks, load_notebook, delete_notebook

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VideoRequest(BaseModel):
    youtube_url: str

class ProcessedVideoResponse(BaseModel):
    video_id: str
    video_title: Optional[str] = "Untitled Video"
    segments: List[Dict[str, Any]]

class ImageGenerationRequest(BaseModel):
    prompt: str

class ImageGenerationResponse(BaseModel):
    image_base64: Optional[str]

class SaveNotebookRequest(BaseModel):
    name: str
    data: Dict[str, Any]

@app.get("/")
def read_root():
    return {"message": "Interactive Video Platform API"}

@app.post("/process-video", response_model=ProcessedVideoResponse)
async def process_video(request: VideoRequest):
    video_id = get_video_id(request.youtube_url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    
    # Direct video analysis using URL
    segments = generate_interactive_segments(request.youtube_url)
    
    return segments

@app.post("/generate-image", response_model=ImageGenerationResponse)
async def generate_image(request: ImageGenerationRequest):
    try:
        if not request.prompt:
             raise HTTPException(status_code=400, detail="Prompt is required")
        
        image_data = generate_image_from_prompt(request.prompt)
        if not image_data:
             raise HTTPException(status_code=500, detail="Failed to generate image")
        return {"image_base64": image_data}
    except Exception as e:
        print(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save-notebook")
async def save_notebook_endpoint(request: SaveNotebookRequest):
    try:
        filename = save_notebook(request.name, request.data)
        return {"message": "Notebook saved successfully", "filename": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/notebooks")
async def list_notebooks_endpoint():
    try:
        notebooks = list_notebooks()
        return {"notebooks": notebooks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/notebooks/{name}")
async def load_notebook_endpoint(name: str):
    data = load_notebook(name)
    if not data:
        raise HTTPException(status_code=404, detail="Notebook not found")
    return data

@app.delete("/notebooks/{name}")
async def delete_notebook_endpoint(name: str):
    success = delete_notebook(name)
    if not success:
        raise HTTPException(status_code=404, detail="Notebook not found")
    return {"message": "Notebook deleted successfully"}

