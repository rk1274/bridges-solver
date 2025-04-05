const container = document.getElementById('make-container');
const otherContainer = document.getElementById('solve-container');

export const renderMake = () => {
    container.classList.remove('hidden');
    otherContainer.classList.add('hidden');

    document.getElementById('clear-board').addEventListener('click', async () => {
        console.log("clear clicked")

        displayBoard()
    });

    document.getElementById('submit-board').addEventListener('click', async () => {
        let populatedBoard = getBoardFromContainer();

        console.log("click")

        await submitBoard(populatedBoard);
    });

    displayBoard()
}

const displayBoard = () => {
    const matrix = Array.from({ length: 20 }, () => Array(16).fill(0));

    render_plain_board(matrix);
}

function render_plain_board(grid) {
    const container = document.getElementById('make-board-container');
    container.innerHTML = '';

    grid.forEach((row) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'board-row';

        row.forEach((cell) => {
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
}

const getBoardFromContainer = () => {
    const container = document.getElementById('make-board-container');

    const matrix = [];

    const rows = container.querySelectorAll('.board-row');
    rows.forEach((row) => {
        const rowValues = [];

        const cells = row.querySelectorAll('.grid-input, .number-cell');
        cells.forEach((cell) => {
            rowValues.push(cell.textContent);
        });

        matrix.push(rowValues);
    });

    return matrix
};

const submitBoard = async (board) => {
    const boardWidth = board[0].length;
    const boardHeight = board.length;

    console.log("submit clicked")

    const boardName = document.getElementById('board-name').value;
    if (!boardName) return alert('Please enter a name for the board!');

    const response = await fetch('/add-board', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: boardName,
            width: boardWidth,
            height: boardHeight,
            grid: board
        })
    });

    const result = await response.json();
    if (response.ok) {
        alert('Board added successfully!');
    } else {
        alert(`Error: ${result.error}`);
    }
};
