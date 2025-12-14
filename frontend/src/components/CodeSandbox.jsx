import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Code, Play } from 'lucide-react';

const CodeSandbox = ({ data, onComplete }) => {
    const [code, setCode] = useState(data.initial_code || '# Write your code here\n');
    const [output, setOutput] = useState('');

    const runCode = () => {
        // Mock execution for MVP
        setOutput(`Running code...\n> Output: ${code.length > 0 ? "Success" : "Error"}`);
        // If we had a backend eval or Pyodide, we'd use it here.
        if (data.solution && code.includes(data.solution.trim())) {
            // Simple check: if code contains solution (very naive)
            onComplete();
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden shadow-sm border border-gray-800">
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-gray-700 rounded text-green-400">
                            <Code size={18} />
                        </div>
                        <span className="font-semibold text-gray-100">Code Sandbox</span>
                    </div>
                    <p className="text-sm text-gray-400">{data.instruction}</p>
                </div>
            </div>

            <div className="flex-1 min-h-[300px]">
                <Editor
                    height="100%"
                    defaultLanguage="python"
                    defaultValue={data.initial_code}
                    theme="vs-dark"
                    onChange={(value) => setCode(value)}
                    options={{ minimap: { enabled: false }, fontSize: 13 }}
                />
            </div>

            <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-between items-center">
                <button
                    onClick={runCode}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors"
                >
                    <Play size={16} /> Run Code
                </button>
                {output && <span className="text-gray-400 text-xs">Console Output</span>}
            </div>
            {output && (
                <div className="p-4 bg-black text-green-400 font-mono text-sm border-t border-gray-700">
                    {output}
                </div>
            )}
        </div>
    );
};

export default CodeSandbox;
