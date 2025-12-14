import os
import json
from typing import List, Dict, Optional

STORAGE_DIR = "saved_notebooks"

def _ensure_storage_dir():
    if not os.path.exists(STORAGE_DIR):
        os.makedirs(STORAGE_DIR)

def save_notebook(name: str, data: dict) -> str:
    _ensure_storage_dir()
    safe_name = "".join([c for c in name if c.isalnum() or c in (' ', '-', '_')]).strip()
    filename = f"{safe_name}.json"
    filepath = os.path.join(STORAGE_DIR, filename)
    
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)
    
    return filename

def list_notebooks() -> List[Dict[str, str]]:
    _ensure_storage_dir()
    notebooks = []
    files = [f for f in os.listdir(STORAGE_DIR) if f.endswith('.json')]
    
    for filename in sorted(files):
        filepath = os.path.join(STORAGE_DIR, filename)
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
                video_id = data.get("video_id", "")
                
                # Construct thumbnail URL
                thumbnail = ""
                if video_id:
                    thumbnail = f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg"
                
                notebooks.append({
                    "filename": filename.replace('.json', ''),
                    "video_title": data.get("video_title", "Untitled Video"),
                    "video_id": video_id,
                    "thumbnail": thumbnail
                })
        except Exception as e:
            print(f"Error reading {filename}: {e}")
            
    return notebooks

def load_notebook(name: str) -> Optional[dict]:
    _ensure_storage_dir()
    filename = f"{name}.json"
    filepath = os.path.join(STORAGE_DIR, filename)
    
    if not os.path.exists(filepath):
        return None
        
    with open(filepath, 'r') as f:
        return json.load(f)

def delete_notebook(name: str) -> bool:
    _ensure_storage_dir()
    filename = f"{name}.json"
    filepath = os.path.join(STORAGE_DIR, filename)
    
    if os.path.exists(filepath):
        os.remove(filepath)
        return True
    return False
