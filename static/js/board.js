let board = null;

export const loadBoard = async () => {
    const boardName = document.getElementById('board-select').value;
    if (!boardName) {
        alert('Please select a board!');
        return;
    }

    const response = await fetch('/load-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board_name: boardName }),
    });

    const data = await response.json();
    renderBoard(data.grid); // Visualize the grid function
    document.getElementById('solve-board').disabled = false;

    board = data; // Store the current board in memory
};

export const solveBoard = async () => {
    if (!board) {
        alert('No board loaded!');
        return;
    }

    const response = await fetch('/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: board }),
    });

    const data = await response.json();
    renderBoard(data.solved_grid);
};

// Creates and renders a blank board
export const makeBoard = () => {
    const matrix = Array.from({ length: 20 }, () => Array(16).fill(0));
    renderPlainBoard(matrix);
};

const renderBoard = (grid) => {
    const container = document.getElementById('board-container');
    container.innerHTML = '';

    grid.forEach((row) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'board-row';

        row.forEach((cell) => {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');

            // Add custom cell rendering logic here
            if (!isNaN(cell) && cell.trim() !== '') {
                cellDiv.classList.add('number-cell');
                cellDiv.textContent = cell;
            } else {
                // Handle connection or other types of cells here
                cellDiv.textContent = cell;
            }

            rowDiv.appendChild(cellDiv);
        });

        container.appendChild(rowDiv);
    });
};

const renderPlainBoard = (grid) => {
    const container = document.getElementById('board-container');
    container.innerHTML = '';

    grid.forEach((row) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'board-row';

        row.forEach(() => {
            const cellDiv = document.createElement('button');
            cellDiv.className = 'grid-input';

            cellDiv.addEventListener('click', () => {
                if (cellDiv.textContent === '') {
                    cellDiv.textContent = '1';
                } else {
                    const currentValue = parseInt(cellDiv.textContent, 10);
                    cellDiv.textContent = currentValue + 1;
                }

                cellDiv.className = 'number-cell';
            });

            rowDiv.appendChild(cellDiv);
        });

        container.appendChild(rowDiv);
    });
};

