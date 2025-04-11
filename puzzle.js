var curTile = null;
var turns = 0;

const BOARD_SIZE = 6;
const CELL_SIZE = 50; // in pixels

class PuzzlePiece {
  constructor(row, col, length, isHorizontal, color) {
    this.row = row;
    this.col = col;
    this.length = length;
    this.isHorizontal = isHorizontal; // boolean: true for horizontal, false for vertical
    this.color = color;
    this.isPink = false; // Flag for the target bar that needs to exit
  }
}

const puzzlePieces = [
  new PuzzlePiece(2, 1, 2, true, "#F1C0E8"),  // Pink horizontal bar (escape bar) in the middle-left
  new PuzzlePiece(0, 1, 2, false, "#e0d6ff"), // Light lavender vertical piece in the top-left
  new PuzzlePiece(0, 2, 2, true, "#C7D7F3"),  // Light periwinkle horizontal piece in the top-middle
  new PuzzlePiece(0, 4, 2, true, "#ADD8E6"),  // Light blue horizontal piece in the top-right
  new PuzzlePiece(3, 3, 2, true, "#98F5E1"),  // Mint green horizontal piece in the middle-right
  new PuzzlePiece(3, 1, 2, true, "#B4D2F5"),  // Light blue horizontal piece in the middle-left
  new PuzzlePiece(1, 0, 3, false, "#CAD4FA"), // Light blue-gray vertical piece on the left edge
  new PuzzlePiece(5, 0, 2, true, "#8EECF5"),  // Cyan horizontal piece in the bottom-left
  new PuzzlePiece(4, 2, 2, false, "#A6E4EB"), // Light turquoise vertical piece in the bottom-middle
  new PuzzlePiece(4, 3, 2, false, "#9FF7D2"), // Light seafoam green vertical piece in the bottom-right
  new PuzzlePiece(4, 4, 2, true, "#A5F8C3"),  // Light lime green horizontal piece in the bottom-right
  new PuzzlePiece(1, 5, 3, false, "#B2FBA5"), // Light green vertical piece on the right edge
];


// Mark the red car
puzzlePieces[0].isPink = true;

function initializePuzzle() {
  const container = document.getElementById("puzzle-container");

  container.style.display = "grid";
  container.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`;
  container.style.gridTemplateRows = `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`;
  container.style.width = `${BOARD_SIZE * CELL_SIZE}px`;
  container.style.height = `${BOARD_SIZE * CELL_SIZE}px`;
  container.style.position = "relative";

  // Create a wrapper for the border
  const wrapper = document.createElement("div");
  wrapper.style.padding = "15px";
  wrapper.style.backgroundColor = "#ADB5BD";
  wrapper.style.display = "inline-block";
  
  // Move the container inside the wrapper
  container.parentNode.insertBefore(wrapper, container);
  wrapper.appendChild(container);

  // Create the exit
  const exit = document.createElement("div");
  exit.className = "exit";
  exit.style.position = "absolute";
  exit.style.right = "-15px";
  exit.style.top = `${2 * CELL_SIZE}px`; // Position at the row of the pink piece
  exit.style.width = "15px";
  exit.style.height = `${CELL_SIZE}px`;
  exit.style.backgroundColor = "#6C757D";
  container.appendChild(exit);

  // Create grid cells
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.style.gridRow = row + 1;
      cell.style.gridColumn = col + 1;
      cell.style.backgroundColor = "#e0e0e0";
      cell.style.border = "1px solid #6C757D";
      container.appendChild(cell);
    }
  }

  // Create puzzle pieces
  puzzlePieces.forEach((piece) => {
    const pieceElement = document.createElement("div");
    pieceElement.className = "puzzle-piece";
    pieceElement.style.position = "absolute";
    pieceElement.style.backgroundColor = piece.color;
    pieceElement.style.cursor = "pointer";

    if (piece.isHorizontal) {
      pieceElement.style.width = `${piece.length * CELL_SIZE - 4}px`;
      pieceElement.style.height = `${CELL_SIZE - 4}px`;
    } else {
      pieceElement.style.width = `${CELL_SIZE - 4}px`;
      pieceElement.style.height = `${piece.length * CELL_SIZE - 4}px`;
    }

    pieceElement.style.left = `${piece.col * CELL_SIZE + 2}px`;
    pieceElement.style.top = `${piece.row * CELL_SIZE + 2}px`;

    // Add directional arrows based on orientation
    if (piece.isHorizontal) {
      const leftArrow = document.createElement("div");
      leftArrow.innerHTML = "◀";
      leftArrow.style.position = "absolute";
      leftArrow.style.left = "5px";
      leftArrow.style.top = "50%";
      leftArrow.style.transform = "translateY(-50%)";
      leftArrow.style.color = "white";

      const rightArrow = document.createElement("div");
      rightArrow.innerHTML = "▶";
      rightArrow.style.position = "absolute";
      rightArrow.style.right = "5px";
      rightArrow.style.top = "50%";
      rightArrow.style.transform = "translateY(-50%)";
      rightArrow.style.color = "white";

      pieceElement.appendChild(leftArrow);
      pieceElement.appendChild(rightArrow);
    } else {
      const upArrow = document.createElement("div");
      upArrow.innerHTML = "▲";
      upArrow.style.position = "absolute";
      upArrow.style.top = "5px";
      upArrow.style.left = "50%";
      upArrow.style.transform = "translateX(-50%)";
      upArrow.style.color = "white";

      const downArrow = document.createElement("div");
      downArrow.innerHTML = "▼";
      downArrow.style.position = "absolute";
      downArrow.style.bottom = "5px";
      downArrow.style.left = "50%";
      downArrow.style.transform = "translateX(-50%)";
      downArrow.style.color = "white";

      pieceElement.appendChild(upArrow);
      pieceElement.appendChild(downArrow);
    }

    pieceElement.addEventListener("mousedown", (e) =>
      startDrag(e, piece, pieceElement),
    );
    container.appendChild(pieceElement);

    // Store reference to DOM element
    piece.element = pieceElement;
  });
}

function startDrag(e, piece, element) {
  e.preventDefault();
  curTile = piece;

  // Calculate starting position
  const startX = e.clientX;
  const startY = e.clientY;
  const startCol = piece.col;
  const startRow = piece.row;

  // Add event listeners for dragging
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", stopDrag);

  function drag(e) {
    let newCol = startCol;
    let newRow = startRow;

    // Calculate new position based on mouse movement
    if (piece.isHorizontal) {
      const deltaX = e.clientX - startX;
      newCol = startCol + Math.round(deltaX / CELL_SIZE);
    } else {
      const deltaY = e.clientY - startY;
      newRow = startRow + Math.round(deltaY / CELL_SIZE);
    }

    // Check if the move is valid and update position
    if (isValidMove(piece, newRow, newCol)) {
      piece.row = newRow;
      piece.col = newCol;
      updatePiecePosition(piece);

      // Check if the pink bar has reached the exit
    if (piece.isPink && piece.col + piece.length >= BOARD_SIZE) {
        setTimeout(() => {
          alert(`Congratulations! You solved the puzzle in ${turns} moves. Continually press enter or click ok to continue`);
          window.location.href = "errorPage.html";

        }, 100);
    }
}
  }

  function stopDrag() {
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDrag);
    turns++;
    document.getElementById("turns-counter").textContent = turns;
  }
}

function updatePiecePosition(piece) {
  piece.element.style.left = `${piece.col * CELL_SIZE + 2}px`;
  piece.element.style.top = `${piece.row * CELL_SIZE + 2}px`;
}

function isValidMove(piece, newRow, newCol) {
  // Check if the move is along the correct axis
  if (piece.isHorizontal && newRow !== piece.row) return false;
  if (!piece.isHorizontal && newCol !== piece.col) return false;

  // Check if the move is within boundaries
  if (
    newRow < 0 ||
    newRow + (piece.isHorizontal ? 0 : piece.length - 1) >= BOARD_SIZE
  )
    return false;
  if (
    newCol < 0 ||
    newCol + (piece.isHorizontal ? piece.length - 1 : 0) >= BOARD_SIZE
  )
    return false;

  // Special case for red car - allow it to exit
  if (piece.isRedCar && newCol + piece.length > BOARD_SIZE && newRow === 2) {
    return true;
  }

  // Check for collisions with other pieces
  for (let otherPiece of puzzlePieces) {
    if (otherPiece === piece) continue;

    // Calculate the space occupied by the other piece
    const otherStartRow = otherPiece.row;
    const otherEndRow =
      otherPiece.row + (otherPiece.isHorizontal ? 0 : otherPiece.length - 1);
    const otherStartCol = otherPiece.col;
    const otherEndCol =
      otherPiece.col + (otherPiece.isHorizontal ? otherPiece.length - 1 : 0);

    // Calculate the space that would be occupied by the current piece after the move
    const pieceStartRow = newRow;
    const pieceEndRow = newRow + (piece.isHorizontal ? 0 : piece.length - 1);
    const pieceStartCol = newCol;
    const pieceEndCol = newCol + (piece.isHorizontal ? piece.length - 1 : 0);

    // Check for overlap
    if (
      pieceStartRow <= otherEndRow &&
      pieceEndRow >= otherStartRow &&
      pieceStartCol <= otherEndCol &&
      pieceEndCol >= otherStartCol
    ) {
      return false;
    }
  }

  return true;
}

window.onload = function () {
  // Create turns counter
  const turnsCounter = document.createElement("div");
  turnsCounter.id = "turns-counter";
  turnsCounter.textContent = turns;
  turnsCounter.style.position = "absolute";
  turnsCounter.style.top = "10px";
  turnsCounter.style.right = "10px";
  turnsCounter.style.fontSize = "24px";
  document.body.appendChild(turnsCounter);

  initializePuzzle();
};
