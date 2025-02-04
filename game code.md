import React, { useState, useEffect } from 'react';
import { Brain, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";

const ThoughtSortGame = () => {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [spawnRate, setSpawnRate] = useState(3000);
  const [dropSpeed, setDropSpeed] = useState(80);
  const [hiddenColorChance, setHiddenColorChance] = useState(0.2);
  const [activeThoughts, setActiveThoughts] = useState([]);
  const [showFeedback, setShowFeedback] = useState(null);
  const [customThoughts, setCustomThoughts] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [health, setHealth] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  
  // Core game data
  const cbtTechniques = {
    "All-or-Nothing Thinking": {
      technique: "Look for Gray Areas",
      description: "Find the middle ground between extremes"
    },
    "Should Statements": {
      technique: "Flexible Thinking",
      description: "Replace 'should' with 'could' or 'would like to'"
    },
    "Fortune Telling": {
      technique: "Evidence Examination",
      description: "Look for evidence that contradicts the prediction"
    },
    "Catastrophizing": {
      technique: "Perspective Taking",
      description: "Consider best, worst, and most likely outcomes"
    },
    "Mind Reading": {
      technique: "Alternative Viewpoints",
      description: "Generate other possible interpretations"
    }
  };

  const defaultThoughtPairs = [
    {
      negative: "I completely failed at this task",
      positive: "I completed parts of the task and can learn from what didn't work",
      distortion: "All-or-Nothing Thinking"
    },
    {
      negative: "I should never make mistakes",
      positive: "Making mistakes helps me learn and grow",
      distortion: "Should Statements"
    },
    {
      negative: "This project will definitely fail",
      positive: "While there are challenges, success is possible with effort",
      distortion: "Fortune Telling"
    }
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const customData = JSON.parse(e.target.result);
        if (Array.isArray(customData) && customData.length > 0) {
          const isValid = customData.every(item => 
            item.negative && 
            item.positive && 
            item.distortion && 
            typeof item.negative === 'string' && 
            typeof item.positive === 'string' && 
            typeof item.distortion === 'string'
          );

          if (isValid) {
            setCustomThoughts(customData);
            resetGame();
          } else {
            alert('Invalid file format. Each thought must have negative, positive, and distortion properties.');
          }
        } else {
          alert('Invalid file format. File must contain an array of thought pairs.');
        }
      } catch (error) {
        alert('Error parsing file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const resetGame = () => {
    setScore(0);
    setCombo(0);
    setSpawnRate(3000);
    setDropSpeed(80);
    setHiddenColorChance(0.2);
    setActiveThoughts([]);
    setIsGameOver(false);
    setHealth(100);
    setIsPaused(false);
  };

  const generateNewThought = () => {
    const thoughtPairs = customThoughts || defaultThoughtPairs;
    const pair = thoughtPairs[Math.floor(Math.random() * thoughtPairs.length)];
    const isPositive = Math.random() < 0.5;
    const hideColor = Math.random() < hiddenColorChance;
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      text: isPositive ? pair.positive : pair.negative,
      isPositive,
      hideColor,
      distortion: pair.distortion,
      pair,
      position: 90
    };
  };

  // Continuous spawning
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const spawnInterval = setInterval(() => {
      if (activeThoughts.length < 8) {
        setActiveThoughts(prev => [...prev, generateNewThought()]);
      }
    }, spawnRate);

    return () => clearInterval(spawnInterval);
  }, [customThoughts, spawnRate, isGameOver, isPaused, activeThoughts.length]);

  // Drop mechanics
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const dropInterval = setInterval(() => {
      setActiveThoughts(prev => {
        const updated = prev.map(thought => ({
          ...thought,
          position: thought.position - 1
        }));

        // Check for thoughts hitting bottom
        const bottomHits = updated.filter(t => t.position <= 0);
        if (bottomHits.length > 0) {
          const negativeHit = bottomHits.find(t => !t.isPositive);
          
          if (negativeHit) {
            setHealth(prev => {
              const newHealth = prev - 20;
              if (newHealth <= 0) {
                setIsGameOver(true);
              }
              return Math.max(0, newHealth);
            });
            
            setShowFeedback({
              distortion: negativeHit.distortion,
              technique: cbtTechniques[negativeHit.distortion],
              isPositive: false
            });
            
            setIsPaused(true);
            setTimeout(() => {
              setIsPaused(false);
              setShowFeedback(null);
            }, 2000);
          } else {
            setScore(prev => Math.max(0, prev - 5));
            setCombo(0);
          }
        }

        return updated.filter(t => t.position > 0);
      });
    }, dropSpeed);

    return () => clearInterval(dropInterval);
  }, [dropSpeed, isGameOver, isPaused]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isGameOver || isPaused || activeThoughts.length === 0) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'p') {
        const sortedPositive = e.key === 'ArrowRight' || e.key.toLowerCase() === 'p';
        
        const lowestThought = [...activeThoughts]
          .sort((a, b) => b.position - a.position)
          .pop();
          
        if (!lowestThought) return;

        const isCorrect = sortedPositive === lowestThought.isPositive;

        if (isCorrect) {
          if (lowestThought.isPositive) {
            setActiveThoughts(prev => prev.filter(t => t.id !== lowestThought.id));
            setScore(prev => prev + (15 * (combo + 1)));
          } else {
            setActiveThoughts(prev => prev.map(t => 
              t.id === lowestThought.id
                ? {
                    ...t,
                    text: t.pair.positive,
                    isPositive: true,
                    hideColor: false,
                    position: Math.min(90, t.position + 10)
                  }
                : t
            ));
            setScore(prev => prev + (10 * (combo + 1)));
          }
          
          setCombo(prev => prev + 1);
          setSpawnRate(prev => Math.max(1000, prev - 100));
          setDropSpeed(prev => Math.max(40, prev - 1));
          setHiddenColorChance(prev => Math.min(0.8, prev + 0.05));
        } else {
          setScore(prev => Math.max(0, prev - 5));
          setCombo(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeThoughts, combo, isGameOver, isPaused]);

  // Handle feedback timing
  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showFeedback]);

  return (
    <div className="relative h-96 w-full bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden rounded-lg border-2 border-blue-200">
      {/* File upload button */}
      <div className="absolute top-2 right-2 z-10">
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('file-upload').click()}
          className="bg-white hover:bg-blue-50"
        >
          <Upload className="w-4 h-4 mr-2" />
          Load Questions
        </Button>
      </div>

      {/* Score and stats */}
      <div className="absolute top-2 left-2 z-10 bg-white p-2 rounded shadow">
        <div>Score: {score}</div>
        <div>Combo: {combo}x</div>
        <div className="flex items-center gap-2">
          <span>Health:</span>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${health}%` }}
            />
          </div>
        </div>
        <div className="text-xs text-gray-600">Speed: {Math.floor((3000 - spawnRate) / 20)}%</div>
        <div className="text-xs text-gray-600">Hidden: {Math.floor(hiddenColorChance * 100)}%</div>
      </div>

      {/* Game Over overlay */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <p className="mb-4">Final Score: {score}</p>
          <Button 
            variant="outline"
            onClick={resetGame}
            className="bg-white text-black hover:bg-blue-50"
          >
            Play Again
          </Button>
        </div>
      )}

      {/* Active thoughts */}
      {activeThoughts.map((thought) => (
        <div 
          key={thought.id}
          className={`absolute left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg 
            transition-all duration-300 max-w-sm text-center
            ${thought.hideColor 
              ? 'bg-gray-100' 
              : thought.isPositive 
                ? 'bg-green-100' 
                : 'bg-red-100'}`}
          style={{ 
            bottom: `${thought.position}%`
          }}
        >
          {thought.text}
        </div>
      ))}

      {/* Control labels */}
      <div className="absolute bottom-16 w-full flex justify-between px-8">
        <div className="bg-white/90 px-4 py-2 rounded-lg shadow-sm">
          <span className="text-sm font-medium">← or A: Negative</span>
        </div>
        <div className="bg-white/90 px-4 py-2 rounded-lg shadow-sm">
          <span className="text-sm font-medium">Positive: → or P</span>
        </div>
      </div>

      {/* Fixed brain/smiley in center */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        {showFeedback?.isPositive ? (
          <div className="text-4xl">😊</div>
        ) : (
          <Brain size={48} className="text-pink-400" />
        )}
      </div>

      {/* Feedback row */}
      <div className="absolute bottom-4 left-0 right-0 px-8">
        <div className="flex justify-between items-center">
          {showFeedback && !showFeedback.isPositive && (
            <div className="bg-purple-100 px-4 py-2 rounded-lg shadow-lg text-center">
              <div className="font-medium text-purple-800">{showFeedback.distortion}</div>
            </div>
          )}
          
          <div className="invisible">
            <Brain size={48} />
          </div>
          
          {showFeedback && !showFeedback.isPositive && (
            <div className="bg-blue-100 px-3 py-2 rounded-lg shadow-lg text-center">
              <div className="font-medium text-blue-800">{showFeedback.technique?.technique}</div>
              <div className="text-xs text-blue-600">{showFeedback.technique?.description}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThoughtSortGame;