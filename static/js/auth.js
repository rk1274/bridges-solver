export const checkLoginStatus = async () => {
    try {
        const response = await fetch('/get_login_status', { method: 'GET' });
        const data = await response.json();
        const loginSection = document.getElementById('login-section');

        if (data.logged_in_as) {
            loginSection.innerHTML = `
                <p id="greeting">Hello, ${data.logged_in_as}!</p>
                <button id="logout-button">Logout</button>
            `;
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

            document.getElementById('login-button').addEventListener('click', login);
            document.getElementById('signup-button').addEventListener('click', signup);
        }
    } catch (error) {
        console.error('Error checking login status:', error);
    }
};

export const login = async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
        await checkLoginStatus();
    } else {
        document.getElementById('login-status').textContent = `Error: ${data.error}`;
    }
};

export const signup = async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/sign_up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
        await checkLoginStatus();
    } else {
        document.getElementById('login-status').textContent = `Error: ${data.error}`;
    }
};

export const logout = async () => {
    const response = await fetch('/logout', { method: 'POST' });

    if (response.ok) {
        await checkLoginStatus();
    } else {
        document.getElementById('login-status').textContent = 'Failed to log out.';
    }
};