import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function TopicSelector({ onClose, onStart }) {
  const [selectedTopics, setSelectedTopics] = useState([]);

  const handleTopicChange = (topic) => {
    setSelectedTopics(prev => {
      if (prev.includes(topic)) {
        return prev.filter(t => t !== topic);
      } else {
        return [...prev, topic];
      }
    });
  };

  const handleStart = () => {
    onStart(selectedTopics);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Select Topics</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="anger_management"
              checked={selectedTopics.includes('anger_management')}
              onChange={() => handleTopicChange('anger_management')}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="anger_management" className="ml-2">Anger Management</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="decision_making"
              checked={selectedTopics.includes('decision_making')}
              onChange={() => handleTopicChange('decision_making')}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="decision_making" className="ml-2">Decision Making</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="low_self_esteem"
              checked={selectedTopics.includes('low_self_esteem')}
              onChange={() => handleTopicChange('low_self_esteem')}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="low_self_esteem" className="ml-2">Low Self-Esteem</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="negative_selftalk"
              checked={selectedTopics.includes('negative_selftalk')}
              onChange={() => handleTopicChange('negative_selftalk')}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="negative_selftalk" className="ml-2">Negative Self-Talk</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="obsessive_thoughts"
              checked={selectedTopics.includes('obsessive_thoughts')}
              onChange={() => handleTopicChange('obsessive_thoughts')}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="obsessive_thoughts" className="ml-2">Obsessive Thoughts</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="panic_attacks"
              checked={selectedTopics.includes('panic_attacks')}
              onChange={() => handleTopicChange('panic_attacks')}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="panic_attacks" className="ml-2">Panic Attacks</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="perfectionism"
              checked={selectedTopics.includes('perfectionism')}
              onChange={() => handleTopicChange('perfectionism')}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="perfectionism" className="ml-2">Perfectionism</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="phobias"
              checked={selectedTopics.includes('phobias')}
              onChange={() => handleTopicChange('phobias')}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="phobias" className="ml-2">Phobias</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="procrastination"
              checked={selectedTopics.includes('procrastination')}
              onChange={() => handleTopicChange('procrastination')}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="procrastination" className="ml-2">Procrastination</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="social_anxiety"
              checked={selectedTopics.includes('social_anxiety')}
              onChange={() => handleTopicChange('social_anxiety')}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="social_anxiety" className="ml-2">Social Anxiety</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="stress_management"
              checked={selectedTopics.includes('stress_management')}
              onChange={() => handleTopicChange('stress_management')}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="stress_management" className="ml-2">Stress Management</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="unhelpful_patterns"
              checked={selectedTopics.includes('unhelpful_patterns')}
              onChange={() => handleTopicChange('unhelpful_patterns')}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="unhelpful_patterns" className="ml-2">Unhelpful Patterns</label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={selectedTopics.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
