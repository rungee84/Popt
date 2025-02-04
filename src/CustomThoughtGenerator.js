import React, { useState } from 'react';
import { X, Plus, Download } from 'lucide-react';

const DISTORTIONS = [
  "Mind Reading",
  "Fortune Telling",
  "Catastrophizing",
  "Should Statements",
  "All-or-Nothing Thinking"
];

export default function CustomThoughtGenerator({ onClose }) {
  const [thoughts, setThoughts] = useState([
    { negative: '', positive: '', distortion: DISTORTIONS[0] }
  ]);

  const addThought = () => {
    setThoughts([...thoughts, { negative: '', positive: '', distortion: DISTORTIONS[0] }]);
  };

  const removeThought = (index) => {
    setThoughts(thoughts.filter((_, i) => i !== index));
  };

  const updateThought = (index, field, value) => {
    const newThoughts = [...thoughts];
    newThoughts[index] = { ...newThoughts[index], [field]: value };
    setThoughts(newThoughts);
  };

  const downloadFile = () => {
    // Just output the thoughts array directly, without the topic wrapper
    const fileData = thoughts.filter(t => t.negative && t.positive);

    const blob = new Blob([JSON.stringify(fileData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom_thoughts.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Custom Thoughts</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {thoughts.map((thought, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
              <button
                onClick={() => removeThought(index)}
                className="absolute right-2 top-2 text-gray-400 hover:text-red-500"
                disabled={thoughts.length === 1}
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Negative Thought
                  </label>
                  <textarea
                    value={thought.negative}
                    onChange={(e) => updateThought(index, 'negative', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Positive Reframe
                  </label>
                  <textarea
                    value={thought.positive}
                    onChange={(e) => updateThought(index, 'positive', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows="2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cognitive Distortion
                </label>
                <select
                  value={thought.distortion}
                  onChange={(e) => updateThought(index, 'distortion', e.target.value)}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  {DISTORTIONS.map(distortion => (
                    <option key={distortion} value={distortion}>
                      {distortion}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={addThought}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
          >
            <Plus size={20} />
            Add Thought
          </button>

          <button
            onClick={downloadFile}
            disabled={!thoughts.some(t => t.negative && t.positive)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            Download File
          </button>
        </div>
      </div>
    </div>
  );
}
