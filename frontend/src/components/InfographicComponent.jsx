import React, { useState } from 'react';
import axios from 'axios';
import { Image, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const InfographicComponent = ({ data }) => {
    const [generating, setGenerating] = useState(false);
    const [imageData, setImageData] = useState(null);
    const [error, setError] = useState(null);

    const generateImage = async () => {
        if (!data.image_prompt) return;

        setGenerating(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:8000/generate-image', {
                prompt: data.image_prompt
            });

            if (response.data.image_base64) {
                setImageData(response.data.image_base64);
            } else {
                setError("No image data returned.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to generate image.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded text-purple-600">
                        <Image size={18} />
                    </div>
                    <span className="font-semibold text-purple-900">Infographic</span>
                </div>

                <button
                    onClick={generateImage}
                    disabled={generating || !data.image_prompt || !!imageData}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                    title="Generate Image using Nano Banana"
                >
                    {generating ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Sparkles size={14} />
                    )}
                    {imageData ? "Image Generated" : "Generate Image (Nano Banana)"}
                </button>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{data.infographic_title || "Summary"}</h3>
                    <p className="text-gray-600 leading-relaxed">
                        {data.infographic_description || "No description available."}
                    </p>
                </div>

                {/* Image Area */}
                <div className="relative w-full aspect-video bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {imageData ? (
                        <img
                            src={`data:image/png;base64,${imageData}`}
                            alt="Generated Infographic"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center p-6">
                            {generating ? (
                                <div className="flex flex-col items-center gap-3 text-indigo-600">
                                    <Loader2 size={32} className="animate-spin" />
                                    <span className="text-sm font-medium">Creating your custom visual...</span>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center gap-2 text-red-500">
                                    <AlertCircle size={32} />
                                    <span className="text-sm">{error}</span>
                                    <button onClick={generateImage} className="text-indigo-600 underline text-xs">Try Again</button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                    <Image size={40} className="mb-2 opacity-50" />
                                    <p className="text-sm font-medium">Visualization Placeholder</p>
                                    <p className="text-xs text-gray-500 max-w-xs">{data.image_prompt || "No prompt available"}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InfographicComponent;
