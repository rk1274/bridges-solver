let board

const container = document.getElementById('solve-container');
const otherContainer = document.getElementById('make-container');
const otherContainer2 = document.getElementById('puzzle-bg');


export const renderLoad = async () => {
    console.debug("render load")

    container.classList.remove('hidden');
    otherContainer.classList.add('hidden');
    otherContainer2.classList.add('hidden');

    await updateBoardDropdown()

    document.getElementById('load-board').addEventListener('click', loadBoard)

    document.getElementById('solve-board').addEventListener('click', solveBoard)
}

const updateBoardDropdown = async () => {
    try {
        const response = await fetch('/get-boards', { method: 'GET' });

        if (response.ok) {
            const boardNames = await response.json();

            const dropdown = document.getElementById('board-select');
            dropdown.innerHTML = '<option value="">--Choose a Board--</option>';

            boardNames.forEach((name) => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                dropdown.appendChild(option);
            });
        } else {
            console.error('Failed to fetch board names:', response.statusText);
        }
    } catch (error) {
        console.error('Error updating board dropdown:', error);
    }
};



const loadBoard = async () => {
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
}

const solveBoard = async () => {
    const response = await fetch('/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: board }),
    });

    const data = await response.json();

    renderBoard(data.solved_grid);
}

function renderBoard(grid) {
    const container = document.getElementById('board-container');
    container.innerHTML = '';

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
                    if (numLines === 2) line.classList.add('double');

                    cellDiv.appendChild(line);
                }
            } else if (cell.includes('|')) {
                cellDiv.classList.add('vertical-connection-wrapper');

                const numLines = cell.includes('||') ? 2 : 1;
                for (let i = 0; i < numLines; i++) {
                    const line = document.createElement('div');
                    line.className = 'con-vertical';
                    if (numLines === 2) line.classList.add('double');

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