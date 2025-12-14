import React, { useState } from 'react';
import axios from 'axios';
import VideoPlayer from './components/VideoPlayer';
import QuizComponent from './components/QuizComponent';
import CodeSandbox from './components/CodeSandbox';
import InfographicComponent from './components/InfographicComponent';
import GraphInteractive from './components/GraphInteractive';
import ThreeDModel from './components/ThreeDModel';
import { Play, BookOpen, Code, BrainCircuit, Image, Save, Trash2, FolderOpen, Activity, Box } from 'lucide-react';

const API_URL = 'http://localhost:8000';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [savedNotebooks, setSavedNotebooks] = useState([]);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  React.useEffect(() => {
    fetchSavedNotebooks();
  }, []);

  const fetchSavedNotebooks = async () => {
    try {
      const response = await axios.get(`${API_URL}/notebooks`);
      setSavedNotebooks(response.data.notebooks);
    } catch (error) {
      console.error("Error fetching notebooks:", error);
    }
  };

  const saveNotebook = async () => {
    if (!saveName) {
      alert("Please enter a name for the notebook.");
      return;
    }
    try {
      await axios.post(`${API_URL}/save-notebook`, {
        name: saveName,
        data: videoData
      });
      alert("Notebook saved successfully!");
      setShowSaveInput(false);
      setSaveName('');
      fetchSavedNotebooks();
    } catch (error) {
      console.error("Error saving notebook:", error);
      alert("Failed to save notebook.");
    }
  };

  const loadNotebook = async (name) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/notebooks/${name}`);
      setVideoData(response.data);
    } catch (error) {
      console.error("Error loading notebook:", error);
      alert("Failed to load notebook.");
    } finally {
      setLoading(false);
    }
  };

  const deleteNotebook = async (name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await axios.delete(`${API_URL}/notebooks/${name}`);
      fetchSavedNotebooks();
    } catch (error) {
      console.error("Error deleting notebook:", error);
      alert("Failed to delete notebook.");
    }
  };

  const processVideo = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/process-video`, { youtube_url: url });
      setVideoData(response.data);
    } catch (error) {
      console.error("Error processing video:", error);
      alert("Failed to process video. Please check the URL and backend.");
    } finally {
      setLoading(false);
    }
  };

  if (!videoData) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-3xl w-full text-center space-y-8">

          <div className="flex justify-center">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <BrainCircuit size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Learn Interactive</h1>
          <p className="text-gray-400">Transform any YouTube video into an interactive coding course.</p>

          <div className="relative group">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all group-hover:border-gray-700"
            />
            <button
              onClick={processVideo}
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Start Learning'}
            </button>
          </div>

          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Play size={14} /> Video Segments</span>
            <span className="flex items-center gap-1"><BookOpen size={14} /> Quizzes</span>
            <span className="flex items-center gap-1"><Code size={14} /> Coding Exercises</span>
          </div>

          {savedNotebooks.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-800 w-full animate-fade-in">
              <h3 className="text-xl font-semibold mb-4 text-left flex items-center gap-2">
                <FolderOpen size={20} className="text-blue-500" /> Saved Courses
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {savedNotebooks.map((notebook) => (
                  <div key={notebook.filename} className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all flex flex-col shadow-lg hover:shadow-xl hover:-translate-y-1">
                    {/* Thumbnail Area */}
                    <div
                      className="aspect-video w-full bg-gray-800 relative overflow-hidden cursor-pointer"
                      onClick={() => loadNotebook(notebook.filename)}
                    >
                      {notebook.thumbnail ? (
                        <img
                          src={notebook.thumbnail}
                          alt={notebook.video_title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <Image size={32} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Play className="text-white fill-current drop-shadow-lg" size={48} />
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4
                          className="font-semibold text-gray-200 text-lg leading-tight line-clamp-1 cursor-pointer hover:text-blue-400"
                          onClick={() => loadNotebook(notebook.filename)}
                        >
                          {notebook.filename}
                        </h4>
                        <button
                          onClick={() => deleteNotebook(notebook.filename)}
                          className="text-gray-500 hover:text-red-400 p-1 rounded-md hover:bg-gray-800 transition-colors"
                          title="Delete Notebook"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed" title={notebook.video_title}>
                        {notebook.video_title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm backdrop-blur-sm bg-white/80">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <BrainCircuit size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg">Learn Interactive</span>
        </div>

        <div className="flex items-center gap-4">
          {showSaveInput ? (
            <div className="flex items-center gap-2 animate-fade-in">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Course Name"
                className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={saveNotebook}
                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveInput(false)}
                className="text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSaveInput(true)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              <Save size={16} />
              Save Course
            </button>
          )}
          <div className="h-6 w-px bg-gray-200 mx-2"></div>
          <button
            onClick={() => setVideoData(null)}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            New Course
          </button>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto p-6 space-y-12">
        {videoData.segments.map((segment, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
          >
            {/* Segment Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                  {index + 1}
                </span>
                <h2 className="text-lg font-semibold text-gray-900">{segment.title}</h2>
              </div>
              <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md capitalize">
                {segment.interactive_type}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-gray-100">
              {/* Left Column: Video & Content */}
              <div className="p-6 space-y-6">
                <div className="bg-black rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5">
                  <VideoPlayer
                    url={`https://www.youtube.com/watch?v=${videoData.video_id}`}
                    startTime={segment.start_time}
                    endTime={segment.end_time}
                    onEnded={() => { }}
                  />
                </div>
                <div className="prose prose-sm prose-blue max-w-none">
                  <p className="text-gray-600 leading-relaxed">{segment.summary}</p>
                </div>
              </div>

              {/* Right Column: Interaction */}
              <div className="flex flex-col bg-gray-50/30">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-white/50">
                  {segment.interactive_type === 'quiz' ? (
                    <BookOpen size={16} className="text-purple-600" />
                  ) : segment.interactive_type === 'code' ? (
                    <Code size={16} className="text-green-600" />
                  ) : segment.interactive_type === 'graph' ? (
                    <Activity size={16} className="text-orange-600" />
                  ) : segment.interactive_type === 'three_d_model' ? (
                    <Box size={16} className="text-blue-600" />
                  ) : (
                    <Image size={16} className="text-indigo-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {segment.interactive_type === 'quiz' ? 'Knowledge Check' :
                      segment.interactive_type === 'code' ? 'Coding Challenge' :
                        segment.interactive_type === 'graph' ? 'Interactive Graph' :
                          segment.interactive_type === 'three_d_model' ? '3D Model' : 'Visual Summary'}
                  </span>
                </div>

                <div className="flex-1 p-6">
                  {segment.interactive_type === 'quiz' ? (
                    <QuizComponent
                      data={segment.content}
                      onComplete={() => { }}
                    />
                  ) : segment.interactive_type === 'code' ? (
                    <CodeSandbox
                      data={segment.content}
                      onComplete={() => { }}
                    />
                  ) : segment.interactive_type === 'graph' ? (
                    <GraphInteractive
                      data={segment.content}
                    />
                  ) : segment.interactive_type === 'three_d_model' ? (
                    <ThreeDModel
                      data={segment.content}
                    />
                  ) : (
                    <InfographicComponent
                      data={segment.content}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">You've reached the end of the course!</p>
        </div>
      </main>
    </div>
  );
}

export default App;
