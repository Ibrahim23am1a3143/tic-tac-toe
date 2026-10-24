
const cells = [...document.querySelectorAll(".cell")];
const statusText = document.getElementById("status");

const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreD = document.getElementById("scoreD");
const labelO = document.getElementById("labelO");

const pvpButton = document.getElementById("pvp");
const aiButton = document.getElementById("ai");
const restartButton = document.getElementById("restart");

const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
let vsAI = false;
let scores = { X: 0, O: 0, D: 0 };

function getWinner(state) {
    for (const line of wins) {
        const [a, b, c] = line;

        if (state[a] &&
            state[a] === state[b] &&
            state[a] === state[c]) {
            return { player: state[a], line };
        }
    }

    return null;
}

function render() {
    cells.forEach((cell, i) => {
        cell.textContent = board[i];
        cell.classList.toggle("o", board[i] === "O");
        cell.classList.remove("winner");
        cell.disabled = gameOver || board[i] !== "";
    });

    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
    scoreD.textContent = scores.D;

    if (!gameOver) {
        statusText.textContent = `Player ${currentPlayer}'s turn`;
    }
}

function makeMove(index) {
    if (gameOver || board[index] !== "") return;

    board[index] = currentPlayer;

    const result = getWinner(board);

    if (result) {
        gameOver = true;
        scores[result.player]++;

        result.line.forEach(i => {
            cells[i].classList.add("winner");
        });

        statusText.textContent =
            vsAI && result.player === "O"
                ? "🤖 AI wins!"
                : `🎉 Player ${result.player} wins!`;

        render();
        return;
    }

    if (board.every(cell => cell !== "")) {
        gameOver = true;
        scores.D++;
        statusText.textContent = "🤝 It's a draw!";
        render();
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    render();

    if (vsAI && currentPlayer === "O" && !gameOver) {
        cells.forEach(cell => cell.disabled = true);
        statusText.textContent = "🤖 AI is thinking...";

        setTimeout(() => {
            if (gameOver || !vsAI || currentPlayer !== "O") return;

            const move = findBestMove();

            if (move !== -1) makeMove(move);
        }, 350);
    }
}

function findBestMove() {
    // Win immediately if possible.
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = "O";
            const won = getWinner(board);
            board[i] = "";

            if (won) return i;
        }
    }

    // Block the player's winning move.
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = "X";
            const won = getWinner(board);
            board[i] = "";

            if (won) return i;
        }
    }

    // Prefer the center.
    if (board[4] === "") return 4;

    // Prefer a free corner.
    const corners = [0, 2, 6, 8].filter(i => board[i] === "");
    if (corners.length) {
        return corners[Math.floor(Math.random() * corners.length)];
    }

    // Otherwise choose any free cell.
    const available = board
        .map((value, i) => value === "" ? i : -1)
        .filter(i => i !== -1);

    return available.length
        ? available[Math.floor(Math.random() * available.length)]
        : -1;
}

function resetRound() {
    board = Array(9).fill("");
    currentPlayer = "X";
    gameOver = false;

    cells.forEach(cell => cell.classList.remove("winner"));

    render();
}

function setMode(aiMode) {
    vsAI = aiMode;

    pvpButton.classList.toggle("selected", !aiMode);
    aiButton.classList.toggle("selected", aiMode);
    labelO.textContent = aiMode ? "AI PLAYER" : "PLAYER O";

    resetRound();
}

cells.forEach((cell, index) => {
    cell.addEventListener("click", () => makeMove(index));
});

pvpButton.addEventListener("click", () => setMode(false));
aiButton.addEventListener("click", () => setMode(true));
restartButton.addEventListener("click", resetRound);

render();
