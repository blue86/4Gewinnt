const COLS = 7;
const ROWS = 6;

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset");

let grid = [];
let currentPlayer = "yellow";
let gameOver = false;

function createBoard() {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  boardEl.innerHTML = "";

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.col = col;
      cell.addEventListener("click", () => handleClick(col));
      boardEl.appendChild(cell);
    }
  }
}

function cellAt(row, col) {
  return boardEl.children[row * COLS + col];
}

function handleClick(col) {
  if (gameOver) return;

  const row = lowestEmptyRow(col);
  if (row === -1) return;

  grid[row][col] = currentPlayer;
  const disc = document.createElement("div");
  disc.className = `disc ${currentPlayer}`;
  cellAt(row, col).appendChild(disc);

  if (checkWin(row, col)) {
    statusEl.textContent = `${label(currentPlayer)} gewinnt!`;
    gameOver = true;
    return;
  }

  if (isBoardFull()) {
    statusEl.textContent = "Unentschieden!";
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === "yellow" ? "red" : "yellow";
  statusEl.textContent = `${label(currentPlayer)} ist am Zug`;
}

function lowestEmptyRow(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (!grid[row][col]) return row;
  }
  return -1;
}

function isBoardFull() {
  return grid[0].every((cell) => cell !== null);
}

function label(player) {
  return player === "yellow" ? "Gelb" : "Rot";
}

function checkWin(row, col) {
  const player = grid[row][col];
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  return directions.some(([dr, dc]) => {
    let count = 1;
    count += countDirection(row, col, dr, dc, player);
    count += countDirection(row, col, -dr, -dc, player);
    return count >= 4;
  });
}

function countDirection(row, col, dr, dc, player) {
  let count = 0;
  let r = row + dr;
  let c = col + dc;

  while (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] === player) {
    count++;
    r += dr;
    c += dc;
  }

  return count;
}

function resetGame() {
  currentPlayer = "yellow";
  gameOver = false;
  statusEl.textContent = `${label(currentPlayer)} ist am Zug`;
  createBoard();
}

resetBtn.addEventListener("click", resetGame);

createBoard();
