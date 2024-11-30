// Game state
let playerScore = 0;
let computerScore = 0;
const MAX_SCORE = 5;
let gameHistory = [];
let aiModel = {
    playerMoves: [],
    moveProbabilities: {
        'Snake': { 'Snake': 0.33, 'Water': 0.33, 'Gun': 0.33 },
        'Water': { 'Snake': 0.33, 'Water': 0.33, 'Gun': 0.33 },
        'Gun': { 'Snake': 0.33, 'Water': 0.33, 'Gun': 0.33 }
    }
};

// DOM Elements
const playerScoreElement = document.getElementById('player-score');
const computerScoreElement = document.getElementById('computer-score');
const resultElement = document.getElementById('result');
const historyElement = document.getElementById('history');
const playAgainButton = document.getElementById('play-again');
const toggleThemeButton = document.getElementById('toggle-theme');
const resetGameButton = document.getElementById('reset-game');
const choices = document.querySelectorAll('.choice');

// Sound effects using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function createSound(type) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    switch(type) {
        case 'win':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
            break;
        case 'lose':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(200, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
            break;
        case 'tie':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
            break;
    }

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

// AI Functions
function updateAIModel(playerMove) {
    aiModel.playerMoves.push(playerMove);
    
    // Update probabilities based on player's moves
    if (aiModel.playerMoves.length > 1) {
        const previousMove = aiModel.playerMoves[aiModel.playerMoves.length - 2];
        aiModel.moveProbabilities[previousMove][playerMove] += 0.1;
        
        // Normalize probabilities
        const sum = Object.values(aiModel.moveProbabilities[previousMove]).reduce((a, b) => a + b, 0);
        for (let move in aiModel.moveProbabilities[previousMove]) {
            aiModel.moveProbabilities[previousMove][move] /= sum;
        }
    }
}

function predictNextMove() {
    if (aiModel.playerMoves.length === 0) {
        return ['Snake', 'Water', 'Gun'][Math.floor(Math.random() * 3)];
    }

    const lastMove = aiModel.playerMoves[aiModel.playerMoves.length - 1];
    const probabilities = aiModel.moveProbabilities[lastMove];
    
    // Choose counter move based on predicted player move
    const predictedMove = Object.entries(probabilities).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    // Return counter move
    switch(predictedMove) {
        case 'Snake': return 'Gun';    // Gun beats Snake
        case 'Water': return 'Snake';  // Snake beats Water
        case 'Gun': return 'Water';    // Water beats Gun
        default: return ['Snake', 'Water', 'Gun'][Math.floor(Math.random() * 3)];
    }
}

// Game Logic
function getComputerChoice() {
    return predictNextMove();
}

function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) return 'tie';
    
    const rules = {
        'Snake': { beats: 'Water', losesTo: 'Gun' },
        'Water': { beats: 'Gun', losesTo: 'Snake' },
        'Gun': { beats: 'Snake', losesTo: 'Water' }
    };
    
    return rules[playerChoice].beats === computerChoice ? 'win' : 'lose';
}

function updateScore(result) {
    if (result === 'win') playerScore++;
    else if (result === 'lose') computerScore++;
    
    playerScoreElement.textContent = playerScore;
    computerScoreElement.textContent = computerScore;
}

function playSound(result) {
    // Resume audio context if it's suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    createSound(result);
}

function updateHistory(playerChoice, computerChoice, result) {
    const resultText = result === 'win' ? 'Won' : result === 'lose' ? 'Lost' : 'Tied';
    const historyItem = document.createElement('li');
    historyItem.textContent = `Player: ${playerChoice} vs Computer: ${computerChoice} - ${resultText}`;
    historyElement.insertBefore(historyItem, historyElement.firstChild);
    gameHistory.push({ playerChoice, computerChoice, result });
}

function displayResult(playerChoice, computerChoice, result) {
    const messages = {
        'win': 'You win! 🎉',
        'lose': 'Computer wins! 🤖',
        'tie': "It's a tie! 🤝"
    };
    
    resultElement.textContent = `You chose ${playerChoice}, Computer chose ${computerChoice}. ${messages[result]}`;
}

function checkGameEnd() {
    if (playerScore >= MAX_SCORE || computerScore >= MAX_SCORE) {
        const winner = playerScore >= MAX_SCORE ? 'Player' : 'Computer';
        resultElement.textContent = `Game Over! ${winner} wins the game!`;
        playAgainButton.style.display = 'inline-block';
        choices.forEach(choice => choice.disabled = true);
    }
}

// Event Listeners
choices.forEach(choice => {
    choice.addEventListener('click', () => {
        const playerChoice = choice.id.charAt(0).toUpperCase() + choice.id.slice(1);
        const computerChoice = getComputerChoice();
        const result = determineWinner(playerChoice, computerChoice);
        
        updateAIModel(playerChoice);
        updateScore(result);
        playSound(result);
        updateHistory(playerChoice, computerChoice, result);
        displayResult(playerChoice, computerChoice, result);
        checkGameEnd();
    });
});

playAgainButton.addEventListener('click', () => {
    playerScore = 0;
    computerScore = 0;
    gameHistory = [];
    aiModel.playerMoves = [];
    
    playerScoreElement.textContent = '0';
    computerScoreElement.textContent = '0';
    resultElement.textContent = '';
    historyElement.innerHTML = '';
    playAgainButton.style.display = 'none';
    choices.forEach(choice => choice.disabled = false);
});

toggleThemeButton.addEventListener('click', () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? '' : 'dark';
    toggleThemeButton.textContent = document.body.dataset.theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
});

resetGameButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the game?')) {
        playAgainButton.click();
    }
});
