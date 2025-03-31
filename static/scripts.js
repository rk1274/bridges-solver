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
});

document.getElementById('solve-board').addEventListener('click', async () => {
    const response = await fetch('/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: board }),
    });

    const data = await response.json();

    renderBoard(data.solved_grid);
});

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

document.getElementById('make-board').addEventListener('click', async () => {
    const matrix = Array.from({ length: 20 }, () => Array(16).fill(0));
    console.log("cliocked")
    render_plain_board(matrix);
});

function render_plain_board(grid) {
    const container = document.getElementById('board-container');
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

document.getElementById('submit-board').addEventListener('click', async () => {
    let populatedBoard = getBoardFromContainer();

    await submitBoard(populatedBoard);
});

const getBoardFromContainer = () => {
    const container = document.getElementById('board-container');

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

    await updateAvailableBoards();
};

const checkLoginStatus = async () => {
    try {
        const response = await fetch('/get_login_status\n', { method: 'GET' });
        const data = await response.json();
        const loginSection = document.getElementById('login-section');

        if (data.logged_in_as) {
            loginSection.innerHTML = `
                <p id="greeting">Hello, ${data.logged_in_as}!</p>
                <button id="logout-button">Logout</button>
            `;

            disableSubmitButton();

            document.getElementById('logout-button').addEventListener('click', logout);
        } else {
            loginSection.innerHTML = `
                <h2>Login</h2>
                <input type="text" id="username" placeholder="Username" />
                <input type="password" id="password" placeholder="Password" />
                <button id="login-button">Login</button>
                <button id="signup-button">Sign up</button>
                <p id="login-status"></p>
            `;

            enableSubmitButton()

            document.getElementById('login-button').addEventListener('click', login);
            document.getElementById('signup-button').addEventListener('click', signup);
        }
    }
    catch (error) {
        console.error('Error checking login status:', error);
    }
}

const logout = async () => {
     const logoutResponse = await fetch('/logout', { method: 'POST' });

     if (logoutResponse.ok) {
         await checkLoginStatus();
         await updateAvailableBoards();
     } else {
         document.getElementById('login-status').textContent = `Failed to logout. Try again.`;
     }
}

const login = async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginResponse = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    const loginData = await loginResponse.json();

    if (loginResponse.ok) {
        await checkLoginStatus();
        await updateAvailableBoards();
    } else {
        document.getElementById('login-status').textContent = `Error: ${loginData.error}`;
    }
}

const signup = async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginResponse = await fetch('/sign_up\n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    const loginData = await loginResponse.json();

    if (loginResponse.ok) {
        await checkLoginStatus();
    } else {
        document.getElementById('login-status').textContent = `Error: ${loginData.error}`;
    }
}

const updateAvailableBoards = async () => {
    try {
        const response = await fetch('/get-boards', { method: 'GET' });

        if (!response.ok) {
            throw new Error('Failed to fetch board data');
        }

        const boardNames = await response.json();

        const dropdown = document.getElementById('board-select');
        dropdown.innerHTML = '';

        boardNames.forEach((boardName) => {
            const option = document.createElement('option');
            option.value = boardName;
            option.textContent = boardName;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to update dropdown:', error);
    }
}

const enableSubmitButton = () => {
    document.getElementById('submit-board').disabled = true;
}

const disableSubmitButton = () => {
    document.getElementById('submit-board').disabled = false;
}

window.onload = checkLoginStatus;
