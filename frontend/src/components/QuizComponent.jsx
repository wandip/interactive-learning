import React, { useState } from 'react';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';

const QuizComponent = ({ data, onComplete }) => {
    const [selected, setSelected] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        setSubmitted(true);
        if (selected === data.answer) {
            setTimeout(onComplete, 1500); // Auto advance after success
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded text-blue-600">
                        <BookOpen size={18} />
                    </div>
                    <span className="font-semibold text-blue-900">Quiz</span>
                </div>
            </div>

            <div className="p-6">
                <p className="mb-6 text-gray-800 font-medium text-lg leading-relaxed">{data.question}</p>
                <div className="space-y-3">
                    {data.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => !submitted && setSelected(option)}
                            disabled={submitted}
                            className={`w-full p-4 text-left rounded-xl border transition-all flex items-center justify-between group ${selected === option
                                    ? (submitted
                                        ? (option === data.answer
                                            ? 'bg-green-50 border-green-500 text-green-900 ring-1 ring-green-500'
                                            : 'bg-red-50 border-red-500 text-red-900 ring-1 ring-red-500')
                                        : 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-900')
                                    : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                }`}
                        >
                            <span>{option}</span>
                            {submitted && selected === option && (
                                option === data.answer
                                    ? <CheckCircle className="text-green-600" size={20} />
                                    : <XCircle className="text-red-500" size={20} />
                            )}
                        </button>
                    ))}
                </div>
                {!submitted && (
                    <button
                        onClick={handleSubmit}
                        disabled={!selected}
                        className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors shadow-sm hover:shadow-md"
                    >
                        Check Answer
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizComponent;
