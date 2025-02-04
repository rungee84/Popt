// Function to validate topic format
export const validateTopic = (topic) => {
  if (!topic) {
    console.error('Topic is null or undefined');
    return false;
  }
  if (typeof topic.title !== 'string') {
    console.error('Topic title is not a string:', topic);
    return false;
  }
  if (!Array.isArray(topic.thoughtPairs)) {
    console.error('Topic thoughtPairs is not an array:', topic);
    return false;
  }
  const validPairs = topic.thoughtPairs.every(
    pair => {
      if (!pair) {
        console.error('Thought pair is null or undefined');
        return false;
      }
      if (typeof pair.negative !== 'string') {
        console.error('Negative thought is not a string:', pair);
        return false;
      }
      if (typeof pair.positive !== 'string') {
        console.error('Positive thought is not a string:', pair);
        return false;
      }
      if (typeof pair.distortion !== 'string') {
        console.error('Distortion is not a string:', pair);
        return false;
      }
      return true;
    }
  );
  if (!validPairs) {
    console.error('Invalid thought pairs in topic:', topic);
    return false;
  }
  return true;
};

// List of all topic files
const topicFiles = [
  'anger_management',
  'decision_making',
  'low_self_esteem',
  'negative_selftalk',
  'obsessive_thoughts',
  'panic_attacks',
  'perfectionism',
  'phobias',
  'procrastination',
  'social_anxiety',
  'stress_management',
  'unhelpful_patterns'
];

// Function to load all topics from the data directory
export const loadAllTopics = async () => {
  const topics = {};
  
  try {
    console.log('Starting to load topics...');
    
    // Load each topic file individually
    for (const topicName of topicFiles) {
      try {
        console.log('Loading topic:', topicName);
        const topicModule = await import(`./data/${topicName}.json`);
        const topicData = topicModule.default;
        
        console.log('Topic data loaded:', topicData);
        if (validateTopic(topicData)) {
          topics[topicName] = topicData;
          console.log('Successfully loaded topic:', topicName);
        }
      } catch (topicError) {
        console.error(`Error loading topic ${topicName}:`, topicError);
      }
    }
    
    if (Object.keys(topics).length === 0) {
      throw new Error('No valid topics were loaded');
    }
    
    console.log('All topics loaded successfully:', Object.keys(topics));
    return topics;
  } catch (error) {
    console.error('Error loading topics:', error);
    throw new Error(`Failed to load topics: ${error.message}`);
  }
};
