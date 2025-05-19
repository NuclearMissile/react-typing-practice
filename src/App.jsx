import {useEffect, useRef, useState} from 'react'
import './App.css'

// Sample texts for typing practice by difficulty
const sampleTexts = {
    easy: [
        "The quick brown fox jumps over the lazy dog.",
        "Typing practice improves your speed and accuracy over time.",
        "React is a JavaScript library for building user interfaces.",
        "Practice makes perfect, especially when it comes to typing skills.",
        "Learning to type without looking at the keyboard is called touch typing.",
        "Simple sentences help beginners develop basic typing skills.",
        "Regular practice is the key to becoming a proficient typist.",
        "Good posture is important when typing for extended periods.",
        "Typing is an essential skill in today's digital world.",
        "Focus on accuracy first, then gradually increase your speed."
    ],
    medium: [
        "Programming is the art of telling another human what one wants the computer to do.",
        "The best way to predict the future is to invent it. Alan Kay said that.",
        "Typing quickly and accurately is an essential skill for modern computer users.",
        "JavaScript is a high-level, often just-in-time compiled language that conforms to the ECMAScript specification.",
        "React uses a virtual DOM to efficiently update the UI when the underlying data changes.",
        "Efficient typing can significantly increase your productivity in various computer-related tasks.",
        "The QWERTY keyboard layout was designed in the 1870s for mechanical typewriters to prevent jamming.",
        "Touch typing involves placing your fingers on the home row keys and typing without looking at the keyboard.",
        "Modern keyboards have evolved from mechanical typewriters but maintain the same basic layout and functionality.",
        "Learning keyboard shortcuts can save time and increase efficiency when working with computer applications."
    ],
    hard: [
        "The journey of a thousand miles begins with a single step. Typing efficiently is similar - it starts with learning the correct finger positions.",
        "In computer science, artificial intelligence, sometimes called machine intelligence, is intelligence demonstrated by machines, unlike the natural intelligence displayed by humans.",
        "The World Wide Web (WWW), commonly known as the Web, is an information system where documents and other web resources are identified by Uniform Resource Locators, which may be interlinked by hypertext.",
        "Quantum computing is the use of quantum-mechanical phenomena such as superposition and entanglement to perform computation. Computers that perform quantum computations are known as quantum computers.",
        "The process of developing a structured set of instructions to be followed by a computer or electronic device to perform a specific task or solve a particular problem is called computer programming.",
        "The development of typing skills requires consistent practice and attention to technique, including proper finger placement, posture, and rhythmic keystroke patterns that maximize efficiency and minimize strain.",
        "Neuroplasticity, the brain's ability to reorganize itself by forming new neural connections, plays a crucial role in learning complex motor skills such as touch typing, allowing for improved speed and accuracy over time.",
        "The evolution of human-computer interaction has been significantly influenced by advancements in input methods, from punch cards and mechanical keyboards to touchscreens and voice recognition, each requiring different skill sets and adaptations.",
        "Professional typists often achieve speeds exceeding 100 words per minute through a combination of muscle memory, anticipatory reading, and specialized techniques that minimize unnecessary finger movement and maximize keystroke efficiency.",
        "The integration of ergonomic principles into keyboard design aims to reduce the risk of repetitive strain injuries by promoting natural wrist and hand positions, appropriate key resistance, and optimal key spacing for different hand sizes."
    ]
};

export default function App() {
    const [text, setText] = useState('');
    const [userInput, setUserInput] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [status, setStatus] = useState('waiting'); // waiting, started, finished
    const [difficulty, setDifficulty] = useState('easy'); // easy, medium, hard
    const [elapsedTime, setElapsedTime] = useState(0);
    const [wpm, setWpm] = useState('?');
    const textDisplayRef = useRef(null);
    const timerRef = useRef(null);

    // Initialize with a random text based on difficulty
    useEffect(() => {
        getRandomText();
    }, [difficulty]);

    // Timer effect - only for time tracking
    useEffect(() => {
        if (status === 'started') {
            timerRef.current = setInterval(() => {
                setElapsedTime(startTime ? (Date.now() - startTime) / 1000 : 0);
            }, 100);
        } else if (status === 'finished' || status === 'waiting') {
            clearInterval(timerRef.current);
            if (status === 'waiting') {
                setElapsedTime(0);
            }
        }

        return () => clearInterval(timerRef.current);
    }, [status]);

    // Get random text based on current difficulty
    const getRandomText = () => {
        const textsForDifficulty = sampleTexts[difficulty];
        let randomIndex;
        let newText;

        // Keep selecting a random text until we get one that's different from the current text
        do {
            randomIndex = Math.floor(Math.random() * textsForDifficulty.length);
            newText = textsForDifficulty[randomIndex];
        } while (newText === text && textsForDifficulty.length > 1);

        setText(newText);
    };

    // Set focus on text display area when component mounts
    useEffect(() => {
        if (textDisplayRef.current) {
            textDisplayRef.current.focus();
        }
    }, []);

    // Handle keyboard input
    const handleKeyDown = (e) => {
        if (status === 'finished') return;

        // Ignore special keys like Shift, Ctrl, Alt, etc.
        if (e.key.length === 1 || e.key === 'Backspace') {
            e.preventDefault();

            let newInput = userInput;

            if (e.key === 'Backspace') {
                // Handle backspace - remove the last character
                newInput = userInput.slice(0, -1);
            } else if (status !== 'finished') {
                // Add the typed character
                newInput = userInput + e.key;
            }

            setUserInput(newInput);

            // Start timer on first input
            if (status === 'waiting' && newInput.length === 1) {
                setStartTime(new Date());
                setStatus('started');
            }

            // Check if typing is complete
            if (newInput === text) {
                const endTime = new Date();
                setStatus('finished');

                // Calculate statistics
                const timeInSeconds = (endTime - startTime) / 1000;
                const wordsCount = text.trim().split(/\s+/).length;
                const wpm = Math.round((wordsCount / timeInSeconds) * 60);

                setWpm(wpm);
            }
        }
    };

    // Reset the game
    const resetGame = () => {
        getRandomText();
        setUserInput('');
        setStartTime(null);
        setStatus('waiting');
        setElapsedTime(0);
        setWpm('?');
        if (textDisplayRef.current) {
            textDisplayRef.current.focus();
        }
    };

    // Handle difficulty change
    const handleDifficultyChange = (newDifficulty) => {
        if (difficulty !== newDifficulty) {
            setDifficulty(newDifficulty);
            resetGame();
        }
    };

    // Render characters with highlighting
    const renderText = () => {
        return text.split('').map((char, index) => {
            let className = '';
            if (index < userInput.length) {
                className = userInput[index] === char ? 'correct' : 'incorrect';
            } else if (index === userInput.length) {
                className = 'next-char';
            }
            return <span key={index} className={className}>{char}</span>;
        });
    };

    const formatTime = (seconds) => {
        // Handle invalid inputs
        if (seconds === null || seconds === undefined || isNaN(seconds)) {
            return "00:00.0";
        }

        // Ensure non-negative value
        const timeValue = Math.max(0, seconds);

        // Format minutes (integer part of seconds/60)
        const mins = Math.floor(timeValue / 60);

        // Calculate seconds with one decimal place
        const secsTotal = timeValue % 60;
        const secsInt = Math.floor(secsTotal);
        const secsFrac = Math.round((secsTotal - secsInt) * 10);

        // Handle case where fraction rounds up to 10
        let adjustedSecsInt = secsInt;
        let adjustedSecsFrac = secsFrac;

        if (secsFrac === 10) {
            adjustedSecsFrac = 0;
            adjustedSecsInt += 1;

            // Handle case where seconds round up to 60
            if (adjustedSecsInt === 60) {
                adjustedSecsInt = 0;
                // Since we're not returning hours, mins can go above 59
            }
        }

        // Format with padding
        const formattedMins = mins.toString().padStart(2, '0');
        const formattedSecs = adjustedSecsInt.toString().padStart(2, '0');

        return `${formattedMins}:${formattedSecs}.${adjustedSecsFrac}`;
    };

    // Calculate progress percentage
    const calculateProgress = () => {
        if (text.length === 0) return 0;
        return Math.round((userInput.length / text.length) * 100);
    };

    return (
        <div className="typing-app">
            <h2>
                <a href='https://github.com/NuclearMissile/react-typing-practice'>Typing Practice</a>
            </h2>
            <div className="difficulty-selector">
                <button
                    className={difficulty === 'easy' ? 'active' : ''}
                    onClick={() => handleDifficultyChange('easy')}>
                    Easy
                </button>
                <button
                    className={difficulty === 'medium' ? 'active' : ''}
                    onClick={() => handleDifficultyChange('medium')}>
                    Medium
                </button>
                <button
                    className={difficulty === 'hard' ? 'active' : ''}
                    onClick={() => handleDifficultyChange('hard')}>
                    Hard
                </button>
            </div>

            <div
                className="text-display"
                ref={textDisplayRef}
                tabIndex={0}
                onKeyDown={handleKeyDown}>
                {renderText()}
            </div>

            <div className="progress-bar">
                <div className="progress" style={{width: `${calculateProgress()}%`}}></div>
            </div>

            <div className="section">
                <ul>
                    <li>
                        <p>Time:</p>
                        <span>{formatTime(elapsedTime)}</span>
                    </li>
                    <li>
                        <p>WPM:</p>
                        <span>{wpm}</span>
                    </li>
                </ul>
                <button onClick={resetGame} className="reset-btn">Reset</button>
            </div>
        </div>
    )
}
