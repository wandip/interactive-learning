# Interactive Video Platform

An interactive educational video platform that transforms YouTube videos into engaging learning experiences. The platform segments videos into logical chapters and generates interactive coding playgrounds and quizzes for each segment.

## Project Structure

- **backend/**: Python/FastAPI backend for video processing, AI generation (Gemini), and state management.
- **frontend/**: React frontend for the interactive user interface.

## Setup Instructions

### Backend

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Create a `.env` file in the `backend/` directory with your Google API key:
    ```env
    GOOGLE_API_KEY=your_api_key_here
    ```

5.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```

### Frontend

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

## Features

-   **Video Segmentation**: Automatically breaks down videos into chapters.
-   **Interactive Playgrounds**: Generates Python code execises relevant to the video content.
-   **Quizzes**: Creates quizzes to test understanding.
-   **Notebook Style**: Presents content in a clean, linear notebook format.
