from google import genai
from google.genai import types
import os
import json
from typing import List, Dict, Any, Optional, Literal
import urllib.request
import json

from pydantic import BaseModel
import base64

# Configure Gemini
# api_key = os.getenv("GEMINI_API_KEY")
# if api_key:
#     genai.configure(api_key=api_key)

class InteractiveContent(BaseModel):
    # For quiz
    question: Optional[str] = None
    options: Optional[List[str]] = None
    answer: Optional[str] = None
    # For code
    instruction: Optional[str] = None
    initial_code: Optional[str] = None
    solution: Optional[str] = None
    # For infographic
    infographic_title: Optional[str] = None
    infographic_description: Optional[str] = None
    image_prompt: Optional[str] = None
    # For graph
    graph_title: Optional[str] = None
    graph_description: Optional[str] = None
    equations: Optional[List[str]] = None
    x_label: Optional[str] = "x"
    graph_description: Optional[str] = None
    equations: Optional[List[str]] = None
    x_label: Optional[str] = "x"
    y_label: Optional[str] = "y"
    # For 3D Model
    three_d_model_code: Optional[str] = None
    three_d_model_description: Optional[str] = None

class Segment(BaseModel):
    start_time: float
    end_time: float
    title: str
    summary: str
    interactive_type: Literal["quiz", "code", "infographic", "graph", "three_d_model"]
    content: InteractiveContent

class VideoAnalysisResponse(BaseModel):
    segments: List[Segment]
    video_id: str
    video_title: str


# New models for Step 1
class VideoChapter(BaseModel):
    start_time: float
    end_time: float
    chapter_name: str
    chapter_summary: str

class ChapterList(BaseModel):
    chapters: List[VideoChapter]

def get_video_id(url: str) -> str:
    """Extracts video ID from YouTube URL."""
    if "v=" in url:
        return url.split("v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    return url

def get_video_title(video_url: str) -> str:
    """Fetches video title using YouTube oEmbed."""
    try:
        oembed_url = f"https://www.youtube.com/oembed?url={video_url}&format=json"
        req = urllib.request.Request(
            oembed_url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        )
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            return data.get("title", "Untitled Video")
    except Exception as e:
        print(f"Error fetching video title: {e}")
        return "Untitled Video"


def _get_video_chapters(video_url: str) -> List[VideoChapter]:
    """Step 1: Divide the video into sections (chapters)."""
    prompt = """
    You are an educational AI assistant.
    Analyze the YouTube video from the provided URL and divide it into logical learning segments (chapters).
    Generate a maximum of 5 chapters.
    
    Return a list of chapters with their start/end times and names.
    """
    print(prompt)

    client = genai.Client()
    
    try:
        response = client.models.generate_content(
            model="gemini-3-pro-preview",
            contents=types.Content(
                parts=[
                    types.Part(
                        file_data=types.FileData(file_uri=video_url)
                    ),
                    types.Part(text=prompt)
                ]
            ),
            config={
                "response_mime_type": "application/json",
                "response_schema": ChapterList.model_json_schema(),
                "temperature": 0.2,
            }
        )
        # print(response.text)
        data = ChapterList.model_validate_json(response.text)
        return data.chapters
    except Exception as e:
        print(f"Error in step 1 (chapters): {e}")
        return []

def _generate_segment_content(video_url: str, start_time: float, end_time: float) -> tuple[str, InteractiveContent]:
    """Step 2: Generate interactive content for a specific segment."""
    client = genai.Client()
    
    prompt = f"""
    You are an educational AI assistant.
    Analyze the video segment from {start_time}s to {end_time}s.

    Based on the content of this segment, decide whether to generate a 'quiz', an 'infographic', a 'graph', or a 'three_d_model'.
    
    - If there are clear facts to test, generate a 'quiz'.
    - If the content is about any mathematical functions, equations, or data trends that can be plotted, generate a 'graph'.
    - If the content describes a physical object, a 3D geometric shape, or a spatial concept that is best understood in 3D (e.g., a cube, a molecule, the solar system), generate a 'three_d_model'.
    - Otherwise, if the content is conceptual or visual, generate an 'infographic' summary.
    
    Return the result as a JSON object matching the InteractiveContent schema.
    Also return a field "type" which is "quiz", "infographic", "graph", or "three_d_model".
    The priority is to generate a 'three_d_model' or 'graph' if possible.
    
    For Infographic, provide a 'infographic_title', 'infographic_description', and a detailed 'image_prompt'.
    For Quiz, provide 'question', 'options', and 'answer'.
    For Graph, provide 'graph_title', 'graph_description', 'equations' (a list of LaTeX string representations), 'x_label', and 'y_label'.
    
    For three_d_model:
    - Provide a 'three_d_model_description' explaining what the model represents.
    - Provide 'three_d_model_code'. This MUST be a valid JavaScript code string.
    - The code should assume a standard Three.js setup is available via global 'THREE' variable.
    - The code must implement a function `init3D(scene)` where `scene` is a `THREE.Scene` object passed from the host environment.
    - Inside `init3D`, create meshes, lights, or helpers and add them to the `scene`.
    - Do NOT create a renderer, camera, or animation loop; the host environment handles that.
    - Example:
      ```javascript
      function init3D(scene) {{
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( {{ color: 0x00ff00 }} );
        const cube = new THREE.Mesh( geometry, material );
        scene.add( cube );
        
        // Optional: Return an update function for animation if needed
        return {{
           update: (time) => {{ cube.rotation.x = time; cube.rotation.y = time; }}
        }};
      }}
      ```
    - Ensure the code string ONLY contains the function definition(s) needed, primarily `init3D`.
    """

    class ContentResponse(BaseModel):
        type: Literal["quiz", "infographic", "graph", "three_d_model"]
        content: InteractiveContent

    try:
        response = client.models.generate_content(
            model="gemini-3-pro-preview",
            contents=types.Content(
                parts=[
                    types.Part(
                        file_data=types.FileData(file_uri=video_url)
                    ),
                    types.Part(text=prompt)
                ]
            ),
            config={
                "response_mime_type": "application/json",
                "response_schema": ContentResponse.model_json_schema(),
                "temperature": 0.3,
            }
        )
        data = ContentResponse.model_validate_json(response.text)
        return data.type, data.content
    except Exception as e:
        print(f"Error in generating segment content: {e}")
        # Fallback
        return "quiz", InteractiveContent(
            question="Could not generate content. What is this video regarding?",
            options=["Topic A", "Topic B", "Topic C"],
            answer="Topic A"
        )

def generate_interactive_segments(video_url: str) -> Dict[str, Any]:
    """Uses Gemini to analyze video URL and generate interactive content."""
    video_id = get_video_id(video_url)
    
    if not os.getenv("GEMINI_API_KEY"):
        return {
            "video_id": video_id,
            "segments": [
                 {
                    "start_time": 0, "end_time": 60, "title": "Intro", "summary": "Intro",
                    "interactive_type": "infographic",
                    "content": {
                        "infographic_title": "Welcome",
                        "infographic_description": "This is a demo.",
                        "image_prompt": "A welcome banner"
                    }
                }
            ]
        }
    
    print("Step 1: Get Chapters")
    chapters = _get_video_chapters(video_url)
    
    if not chapters:
        print("No chapters found in step 1.")
        # Fallback if no chapters found
        return {"video_id": video_id, "video_title": "Demo Video", "segments": []}


    print("Step 2: Generate Content per Chapter")
    segments = []
    for i, chapter in enumerate(chapters):
        print(f"Processing chapter {i+1}/{len(chapters)}: {chapter.chapter_name}")
        interactive_type, content = _generate_segment_content(video_url, chapter.start_time, chapter.end_time)

        segment = Segment(
            start_time=chapter.start_time,
            end_time=chapter.end_time,
            title=chapter.chapter_name,
            summary=chapter.chapter_summary,
            interactive_type=interactive_type,
            content=content
        )
        segments.append(segment)

    video_title = get_video_title(video_url)
    return VideoAnalysisResponse(segments=segments, video_id=video_id, video_title=video_title).model_dump()


def generate_image_from_prompt(prompt: str) -> Optional[str]:
    """Generates an image using Gemini 3 Pro Image Preview."""
    if not prompt:
        return None
        
    client = genai.Client()
    try:
        print(f"Generating image for prompt: {prompt}")
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE'],
                image_config=types.ImageConfig(
                    aspect_ratio="16:9",
                )
            )
        )
        
        for part in response.parts:
            # Check if there is an image part? 
            # The SDK behavior for `as_image()` or inspecting parts:
            if part.inline_data:
                # Return base64 string directly
                return base64.b64encode(part.inline_data.data).decode('utf-8')
            # Alternatively if it comes as file_uri or similar, we might need handling.
            # But usually inline_data for small generations.
            
    except Exception as e:
        print(f"Error generating image: {e}")
        return None
    return None
