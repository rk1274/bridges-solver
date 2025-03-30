let board

document.getElementById('load-board').addEventListener('click', async () => {
    const boardName = document.getElementById('board-select').value;
    if (!boardName) return alert('Please select a board!');

    const response = await fetch('/load-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board_name: boardName }),
    });

    const data = await response.json();
    renderBoard(data.grid); // Visualize the grid function
    document.getElementById('solve-board').disabled = false;

    board = data
    console.log("load", board)
});

document.getElementById('solve-board').addEventListener('click', async () => {
    // const grid = getCurrentBoard(); // Collect current grid state
    const response = await fetch('/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: board }),
    });

    const data = await response.json();

    renderBoard(data.solved_grid); // Render the solved grid
});

function renderBoard(grid) {
    const container = document.getElementById('board-container');
    container.innerHTML = ''; // Clear previous board

    grid.forEach((row) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'board-row';

        row.forEach((cell) => {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');

            if (!isNaN(cell) && cell.trim() !== '') {
                cellDiv.classList.add('number-cell');

                cellDiv.textContent = cell;
            } else if (cell.includes('-') || cell.includes('=')) {
                cellDiv.classList.add('horizontal-connection-wrapper');

                const numLines = cell.includes('=') ? 2 : 1;
                for (let i = 0; i < numLines; i++) {
                    const line = document.createElement('div');
                    line.className = 'con-horizontal';

                    cellDiv.appendChild(line);
                }
            } else if (cell.includes('|')) {
                cellDiv.classList.add('vertical-connection-wrapper');

                const numLines = cell.includes('||') ? 2 : 1;
                for (let i = 0; i < numLines; i++) {
                    const line = document.createElement('div');
                    line.className = 'con-vertical';

                    cellDiv.appendChild(line);
                }
            } else {
                cellDiv.textContent = cell;
            }

            rowDiv.appendChild(cellDiv);
        });

        container.appendChild(rowDiv);
    });
}

