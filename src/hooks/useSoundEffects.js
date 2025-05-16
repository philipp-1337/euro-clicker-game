import { useEffect, useState, useCallback } from 'react';

const soundFiles = {
  click: '/sounds/click-sound.mp3',
  manager: '/sounds/manager-sound.mp3',
  valueUpgrade: '/sounds/value-click.mp3',
};

let audioContext = null;
const audioBuffers = {};
let isInitialized = false;
const initializationListeners = [];

async function loadSound(url, context) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } catch (error) {
    console.error(`Error loading sound ${url}:`, error);
    return null;
  }
}

async function initializeAudio() {
  if (isInitialized) return;

  try {
    // Create AudioContext on user interaction
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Load and decode all sounds
    const loadPromises = Object.entries(soundFiles).map(async ([name, url]) => {
      audioBuffers[name] = await loadSound(url, audioContext);
    });

    await Promise.all(loadPromises);

    isInitialized = true;
    console.log('AudioContext initialized and sounds loaded.');

    // Notify waiting listeners
    initializationListeners.forEach(listener => listener());
    initializationListeners.length = 0; // Clear listeners

  } catch (error) {
    console.error('Error initializing AudioContext:', error);
    // Handle initialization failure (e.g., browser not supporting AudioContext)
    audioContext = null; // Ensure context is null if initialization fails
  }
}

// Function to play a sound
function playSound(name) {
  if (!audioContext || !audioBuffers[name]) {
    // If not initialized yet or sound failed to load, queue or log
    if (!isInitialized) {
        // Queue the play request until initialized
        initializationListeners.push(() => playSound(name));
    } else {
        console.warn(`AudioContext not available or sound "${name}" not loaded.`);
    }
    return;
  }

  try {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers[name];
    source.connect(audioContext.destination);
    source.start(0); // Play immediately
  } catch (error) {
    console.error(`Error playing sound "${name}":`, error);
  }
}

export default function useSoundEffects() {
    // Use a state to track if the hook is ready (sounds loaded)
    const [isReady, setIsReady] = useState(isInitialized);

    useEffect(() => {
        if (isInitialized) {
            setIsReady(true);
        } else {
            // Add a listener to be notified when initialization is complete
            const listener = () => setIsReady(true);
            initializationListeners.push(listener);

            // Clean up the listener if the component unmounts before initialization
            return () => {
                const index = initializationListeners.indexOf(listener);
                if (index > -1) {
                    initializationListeners.splice(index, 1);
                }
            };
        }
    }, []);

    // Initialize AudioContext on the first user interaction
    // This is crucial for mobile browsers and autoplay policies
    useEffect(() => {
        const handleUserInteraction = () => {
            if (!isInitialized && !audioContext) { // Only initialize if not already started
                initializeAudio();
            }
            // Remove listeners after first interaction
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
            // Add other relevant interaction events if needed (e.g., touchstart)
            document.removeEventListener('touchstart', handleUserInteraction);
        };

        // Add listeners for common user interactions
        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('keydown', handleUserInteraction);
        document.addEventListener('touchstart', handleUserInteraction);

        return () => {
            // Clean up listeners on unmount
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
        };
    }, []);


    // Return the playSound function and the ready state
    return { playSound: useCallback(playSound, []), isReady };
}