const COLS = 7;
const ROWS = 6;

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const fullscreenBtn = document.getElementById("fullscreen");

let grid = [];
let currentPlayer = "yellow";
let gameOver = false;
let piecesLayer = null;

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

  piecesLayer = document.createElement("div");
  piecesLayer.id = "pieces";
  boardEl.appendChild(piecesLayer);

  const face = document.createElement("div");
  face.id = "face";
  boardEl.appendChild(face);
}

function cellAt(row, col) {
  return boardEl.children[row * COLS + col];
}

function handleClick(col) {
  if (gameOver) return;

  const row = lowestEmptyRow(col);
  if (row === -1) return;

  grid[row][col] = currentPlayer;
  dropPiece(row, col, currentPlayer);

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

function dropPiece(row, col, player) {
  const styles = getComputedStyle(document.documentElement);
  const cellSize = parseFloat(styles.getPropertyValue("--cell"));
  const gap = parseFloat(styles.getPropertyValue("--gap"));
  const step = cellSize + gap;

  const piece = document.createElement("div");
  piece.className = `piece ${player}`;
  piece.style.width = `${cellSize}px`;
  piece.style.height = `${cellSize}px`;
  piece.style.left = `${col * step}px`;
  // Final resting position is set immediately; the fall itself is done with a
  // GPU-composited transform so it stays smooth and visible on mobile Safari,
  // instead of animating "top" which forces a layout reflow every frame.
  piece.style.top = `${row * step}px`;
  piecesLayer.appendChild(piece);

  const fallDistance = row + 1;
  const startOffset = -fallDistance * step;
  const duration = 300 + fallDistance * 60;

  const animation = piece.animate(
    [{ transform: `translateY(${startOffset}px)` }, { transform: "translateY(0)" }],
    { duration, easing: "cubic-bezier(0.55, 0.06, 0.9, 0.3)", fill: "forwards" }
  );

  animation.onfinish = () => {
    animation.cancel();
    piece.classList.add("landed");
  };
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

function isFullscreenSupported() {
  return !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
}

function isCurrentlyFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

function toggleFullscreen() {
  if (!isCurrentlyFullscreen()) {
    const el = document.documentElement;
    (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
  }
}

function updateFullscreenLabel() {
  fullscreenBtn.textContent = isCurrentlyFullscreen() ? "⤢ Vollbild beenden" : "⛶ Vollbild";
}

if (isFullscreenSupported()) {
  fullscreenBtn.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", updateFullscreenLabel);
  document.addEventListener("webkitfullscreenchange", updateFullscreenLabel);
} else {
  fullscreenBtn.style.display = "none";
}

createBoard();
