const checkLoginStatus = async () => {
    try {
        const response = await fetch('/get_login_status\n', { method: 'GET' });
        const data = await response.json();
        const loginSection = document.getElementById('login-section');

        if (data.logged_in_as) {
            loginSection.innerHTML = `
                <p id="greeting">Hello, ${data.logged_in_as}!</p>
                <button class="nav-button" id="logout-button">Logout</button>
            `;

            document.getElementById('logout-button').addEventListener('click', logout);
        } else {
            loginSection.innerHTML = `
                <h2>Login</h2>
                <input type="text" id="username" placeholder="Username" />
                <input type="password" id="password" placeholder="Password" />
                <button class="nav-button" id="login-button">Login</button>
                <button class="nav-button" id="signup-button">Sign up</button>
                <p id="login-status"></p>
            `;

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

window.onload = checkLoginStatus;
