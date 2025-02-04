import React, { useState, useEffect } from 'react';
import { Brain, Upload, List } from 'lucide-react';
import { Button } from "./components/ui/button";
import { loadAllTopics } from './topics/topicsLoader';
import TopicSelector from './TopicSelector';
import CustomThoughtGenerator from './CustomThoughtGenerator';

const ThoughtSortGame = () => {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [spawnRate, setSpawnRate] = useState(3000);
  const [dropSpeed, setDropSpeed] = useState(40);
  const [hiddenColorChance, setHiddenColorChance] = useState(0.2);
  const [activeThoughts, setActiveThoughts] = useState([]);
  const [showFeedback, setShowFeedback] = useState(null);
  const [customThoughts, setCustomThoughts] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [health, setHealth] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [showTitleScreen, setShowTitleScreen] = useState(true);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [availableTopics, setAvailableTopics] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Load topics when component mounts
  useEffect(() => {
    const loadTopics = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const topics = await loadAllTopics();
        console.log('Loaded topics:', topics);
        if (Object.keys(topics).length === 0) {
          throw new Error('No topics were found');
        }
        setAvailableTopics(topics);
      } catch (error) {
        console.error('Error in loadTopics:', error);
        setLoadError(error.message || 'Failed to load topics. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTopics();
  }, []);

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
            setShowTitleScreen(false); // Start game immediately after upload
          } else {
            alert('Invalid file format. Please check the JSON structure.');
          }
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error reading file. Please make sure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleTopicSelection = (topicFiles) => {
    const selectedData = topicFiles.map(topicName => {
      const topic = availableTopics[topicName];
      return topic?.thoughtPairs || [];
    }).flat();
    
    if (selectedData.length > 0) {
      setCustomThoughts(selectedData);
      setShowTopicSelector(false);
      setShowTitleScreen(false);
    }
  };

  const handleStart = async (selectedTopics) => {
    setShowTopicSelector(false);
    setIsLoading(true);
    
    try {
      const topics = await loadAllTopics();
      const selectedThoughts = selectedTopics.flatMap(topic => 
        topics[topic]?.thoughtPairs || []
      );
      
      if (selectedThoughts.length > 0) {
        setCustomThoughts(selectedThoughts);
        setShowTitleScreen(false);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    setScore(0);
    setCombo(0);
    setSpawnRate(3000);
    setDropSpeed(40);
    setHiddenColorChance(0.2);
    setActiveThoughts([]);
    setIsGameOver(false);
    setHealth(100);
    setIsPaused(false);
  };

  const returnToMainMenu = () => {
    setActiveThoughts([]); // Clear all thoughts immediately
    setShowFeedback(null); // Clear any feedback
    setIsGameOver(false); // Reset game over state
    setShowTitleScreen(true); // Show the title screen
  };

  const toggleTopic = (topicKey) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicKey)) {
        return prev.filter(t => t !== topicKey);
      } else {
        return [...prev, topicKey];
      }
    });
  };

  const startGame = () => {
    if (selectedTopics.length === 0) {
      alert("Please select at least one topic");
      return;
    }
    
    const combinedThoughts = selectedTopics.flatMap(topicKey => 
      availableTopics[topicKey].thoughtPairs
    );
    
    setCustomThoughts(combinedThoughts);
    setShowTitleScreen(false);
    resetGame();
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
    if (isGameOver || isPaused || showTitleScreen) return;

    const spawnInterval = setInterval(() => {
      if (activeThoughts.length < 8) {
        setActiveThoughts(prev => [...prev, generateNewThought()]);
      }
    }, spawnRate);

    return () => clearInterval(spawnInterval);
  }, [customThoughts, spawnRate, isGameOver, isPaused, activeThoughts.length, showTitleScreen]);

  // Drop mechanics
  useEffect(() => {
    if (isGameOver || isPaused || showTitleScreen) return;

    const dropInterval = setInterval(() => {
      setActiveThoughts(prev => {
        const updated = prev.map(thought => ({
          ...thought,
          position: thought.position - 0.5
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
  }, [dropSpeed, isGameOver, isPaused, showTitleScreen]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isGameOver || isPaused || activeThoughts.length === 0 || showTitleScreen) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key.toLowerCase() === 'q' || e.key.toLowerCase() === 'p') {
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
            setShowFeedback({ isPositive: true });
            setTimeout(() => setShowFeedback(null), 500);
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
            setShowFeedback({
              distortion: lowestThought.distortion,
              technique: cbtTechniques[lowestThought.distortion],
              isPositive: true
            });
            setTimeout(() => setShowFeedback(null), 1000);
          }
          
          setCombo(prev => prev + 1);
          setSpawnRate(prev => Math.max(1000, prev - 100));
          setDropSpeed(prev => Math.max(40, prev - 1));
          setHiddenColorChance(prev => Math.min(0.8, prev + 0.05));
        } else {
          setScore(prev => Math.max(0, prev - 5));
          setCombo(0);
          
          // Add health reduction and feedback for incorrect sorting of negative thoughts
          if (!lowestThought.isPositive) {
            setHealth(prev => {
              const newHealth = prev - 20;
              if (newHealth <= 0) {
                setIsGameOver(true);
              }
              return Math.max(0, newHealth);
            });
            
            setShowFeedback({
              distortion: lowestThought.distortion,
              technique: cbtTechniques[lowestThought.distortion],
              isPositive: false
            });
            setIsPaused(true);
            setTimeout(() => {
              setIsPaused(false);
              setShowFeedback(null);
            }, 2000);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeThoughts, combo, isGameOver, isPaused, showTitleScreen]);

  // Handle feedback timing
  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showFeedback]);

  if (showTopicSelector) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
        <h2 className="text-2xl mb-6">Select Topics</h2>
        <div className="w-full max-w-md bg-gray-800 p-4 rounded-lg shadow-lg">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Loading topics...</p>
            </div>
          ) : loadError ? (
            <div className="text-center text-red-400 py-4">
              <p>{loadError}</p>
              <div className="mt-4">
                <Button onClick={() => {
                  setLoadError(null);
                  setIsLoading(true);
                  loadAllTopics()
                    .then(topics => {
                      setAvailableTopics(topics);
                      setLoadError(null);
                    })
                    .catch(error => {
                      console.error('Error reloading topics:', error);
                      setLoadError(error.message || 'Failed to load topics. Please try again.');
                    })
                    .finally(() => setIsLoading(false));
                }}>
                  Retry Loading Topics
                </Button>
              </div>
            </div>
          ) : Object.keys(availableTopics).length === 0 ? (
            <div className="text-center py-4">
              <p>No topics available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(availableTopics).map(([topicName, topic]) => (
                <label key={topicName} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topicName)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTopics([...selectedTopics, topicName]);
                      } else {
                        setSelectedTopics(selectedTopics.filter(t => t !== topicName));
                      }
                    }}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span>{topic.title || topicName}</span>
                </label>
              ))}
            </div>
          )}
          <div className="mt-6 space-x-4">
            <Button 
              onClick={() => handleStart(selectedTopics)}
              disabled={selectedTopics.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Game
            </Button>
            <Button 
              onClick={() => setShowTopicSelector(false)}
              variant="secondary"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showTitleScreen) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 text-white">
          <div className="text-center mb-12">
            <h1 className="text-7xl font-bold mb-2 text-white drop-shadow-lg">Popt!</h1>
            <p className="text-xl opacity-90 italic">Power of Positive Thinking</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-2xl w-full max-w-md mx-4">
            <div className="space-y-4">
              <Button
                onClick={() => setShowTopicSelector(true)}
                className="w-full bg-white/20 hover:bg-white/30 transition-all transform hover:scale-105 flex items-center justify-center space-x-3 py-3 text-lg"
              >
                <List className="w-6 h-6" />
                <span>Select Topics</span>
              </Button>

              <Button
                onClick={() => setShowGenerator(true)}
                className="w-full bg-white/20 hover:bg-white/30 transition-all transform hover:scale-105 flex items-center justify-center space-x-3 py-3 text-lg"
              >
                <Brain className="w-6 h-6" />
                <span>Create Custom File</span>
              </Button>
              
              <div className="relative">
                <Button
                  onClick={() => document.getElementById('file-upload').click()}
                  className="w-full bg-white/20 hover:bg-white/30 transition-all transform hover:scale-105 flex items-center justify-center space-x-3 py-3 text-lg"
                >
                  <Upload className="w-6 h-6" />
                  <span>Upload Custom File</span>
                </Button>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".json"
                  onChange={handleFileUpload}
                />
              </div>
              
              <Button
                onClick={() => setShowTitleScreen(false)}
                className="w-full bg-white/20 hover:bg-white/30 transition-all transform hover:scale-105 flex items-center justify-center space-x-3 py-3 text-lg"
              >
                <Brain className="w-6 h-6" />
                <span>Start with Default Topics</span>
              </Button>
            </div>
            
            {isLoading && (
              <div className="mt-6 text-center text-white/80">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Loading topics...</p>
              </div>
            )}
          </div>
        </div>

        {/* Topic Selector Modal */}
        {showTopicSelector && (
          <TopicSelector
            onClose={() => setShowTopicSelector(false)}
            onStart={handleStart}
          />
        )}

        {/* Custom Thought Generator Modal */}
        {showGenerator && (
          <CustomThoughtGenerator
            onClose={() => setShowGenerator(false)}
          />
        )}
      </>
    );
  }

  if (showGenerator) {
    return <CustomThoughtGenerator onClose={() => setShowGenerator(false)} />;
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden">
      {/* Main Menu Button */}
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={returnToMainMenu}
          className="bg-white hover:bg-blue-50"
        >
          Main Menu
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
          className={`absolute left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 max-w-sm text-center ${thought.hideColor ? 'bg-gray-100' : thought.isPositive ? 'bg-green-100' : 'bg-red-100'}`}
          style={{ bottom: `${thought.position}%` }}
        >
          {thought.text}
        </div>
      ))}

      {/* Control labels */}
      <div className="absolute bottom-32 w-full flex justify-between px-8">
        <div className="bg-red-100 px-4 py-2 rounded-lg shadow-sm">
          <span className="text-sm font-medium">← or Q: Negative</span>
        </div>
        <div className="bg-green-100 px-4 py-2 rounded-lg shadow-sm">
          <span className="text-sm font-medium">Positive: → or P</span>
        </div>
      </div>

      {/* Fixed brain/smiley in center */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        {showFeedback?.isPositive ? (
          <div className="text-5xl animate-bounce">😊</div>
        ) : showFeedback ? (
          <Brain size={56} className="text-pink-400" />
        ) : (
          <Brain size={48} className="text-gray-400" />
        )}
      </div>

      {/* Feedback row */}
      <div className="absolute bottom-4 left-0 right-0 px-8">
        <div className="flex justify-between items-center">
          {showFeedback && !showFeedback.isPositive && (
            <div className="bg-purple-100 px-6 py-3 rounded-lg shadow-lg text-center transform transition-all duration-300 scale-110">
              <div className="font-bold text-xl text-purple-800">
                {showFeedback.distortion}
              </div>
              <div className="text-sm text-purple-600 mt-1">Cognitive Distortion</div>
            </div>
          )}
          
          <div className="invisible">
            <Brain size={48} />
          </div>
          
          {showFeedback && !showFeedback.isPositive && (
            <div className="bg-blue-100 px-6 py-3 rounded-lg shadow-lg text-center max-w-sm transform transition-all duration-300 scale-110">
              <div className="font-bold text-xl text-blue-800 mb-1">
                {showFeedback.technique?.technique}
              </div>
              <div className="text-base text-blue-700">
                {showFeedback.technique?.description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Topic Selector Modal */}
      {showTopicSelector && (
        <TopicSelector
          onClose={() => setShowTopicSelector(false)}
          onStart={handleStart}
        />
      )}

      {/* Custom Thought Generator Modal */}
      {showGenerator && (
        <CustomThoughtGenerator
          onClose={() => setShowGenerator(false)}
        />
      )}
    </div>
  );
};

export default ThoughtSortGame;
